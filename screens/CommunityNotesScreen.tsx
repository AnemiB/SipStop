import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Modal, FlatList, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { collection, query, orderBy, onSnapshot, collectionGroup, where, limit, Timestamp, doc, getDocs, setDoc, serverTimestamp, } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

import NotificationBanner from '../components/NotificationBanner';

// SVG imports
import HappyOne from '../assets/HappyOne.svg';
import HappyTwo from '../assets/HappyTwo.svg';
import NormalOne from '../assets/NormalOne.svg';
import NormalTwo from '../assets/NormalTwo.svg';
import SadOne from '../assets/SadOne.svg';
import SadTwo from '../assets/SadTwo.svg';

const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Community'>;

const moodOptions = [
  { id: 4, image: HappyOne, category: 'happy' },
  { id: 5, image: HappyTwo, category: 'happy' },
  { id: 2, image: NormalOne, category: 'normal' },
  { id: 3, image: NormalTwo, category: 'normal' },
  { id: 0, image: SadOne, category: 'sad' },
  { id: 1, image: SadTwo, category: 'sad' },
];

const CommunityNotesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Notification banner state
  const [notif, setNotif] = useState<{
    visible: boolean;
    noteId?: string;
    noteTitle?: string;
    commentText?: string;
  }>({ visible: false });

  // Keep track of when we started listening to avoid showing old comments
  const lastCheckedRef = useRef<number>(Date.now());

  const lastShownCommentIdRef = useRef<string | null>(null);
  const [lastViewedMap, setLastViewedMap] = useState<Record<string, number>>({});
  const [unseenNotesSet, setUnseenNotesSet] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);

  // Load notes
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const notesData = snapshot.docs.map(docSnap => {
        const noteData = docSnap.data();
        return {
          id: docSnap.id,
          ...noteData,
          username: 'Anonymous',
        };
      });
      setNotes(notesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's lastViewed docs into lastViewedMap
  const fetchLastViewedForUser = async (uid: string) => {
    try {
      const colRef = collection(db, 'users', uid, 'notesLastViewed');
      const snap = await getDocs(colRef);
      const map: Record<string, number> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data?.lastViewedAt) {
          const millis =
            data.lastViewedAt instanceof Timestamp ? data.lastViewedAt.toMillis() : new Date(data.lastViewedAt).getTime();
          map[d.id] = millis;
        }
      });
      setLastViewedMap(map);
    } catch (err) {
      console.warn('Failed to fetch lastViewed docs:', err);
    }
  };

  // LastViewed for a note (called when user views a post)
  const markNoteViewed = async (noteId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'notesLastViewed', noteId);
      await setDoc(docRef, { lastViewedAt: serverTimestamp() }, { merge: true });
      const now = Date.now();
      setLastViewedMap(prev => ({ ...prev, [noteId]: now }));
      setUnseenNotesSet(prev => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    } catch (err) {
      console.warn('Failed to mark note viewed:', err);
    }
  };

  // Fetch lastViewed map when user logs in
  useEffect(() => {
    if (!currentUser) {
      setLastViewedMap({});
      setUnseenNotesSet(new Set());
      return;
    }
    fetchLastViewedForUser(currentUser.uid);
  }, [currentUser]);

  const getCreatedAtMillis = (data: any): number => {
    if (!data) return 0;
    const candidates = [data.createdAt, data.timestamp, data.time, data.created_at, data.date];
    let c: any = undefined;
    for (const cand of candidates) {
      if (cand !== undefined && cand !== null) {
        c = cand;
        break;
      }
    }
    if (c === undefined) return 0;
    if (typeof c === 'object' && typeof (c as any).toMillis === 'function') {
      try {
        return (c as any).toMillis();
      } catch {
        return 0;
      }
    }

    if (typeof c === 'number') {
      return c < 1e11 ? c * 1000 : c;
    }
    if (typeof c === 'string') {
      const t = Date.parse(c);
      return isNaN(t) ? 0 : t;
    }

    return 0;
  };

  useEffect(() => {
    if (!currentUser) return;

    const commentsQuery = query(
      collectionGroup(db, 'comments'),
      where('noteOwnerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      snapshot => {
        console.log('[comments] snapshot size:', snapshot.size);

        if (snapshot.empty) {
          console.log('[comments] no comments for this user; clearing unseen set.');
          setUnseenNotesSet(new Set());
          return;
        }

        // Debug dump first few docs fields can be inspected in Metro
        snapshot.docs.slice(0, 6).forEach(d => console.log('[comments] doc:', d.id, d.data()));

        const newUnseen = new Set<string>();

        snapshot.docs.forEach(docSnap => {
          const data: any = docSnap.data();
          const noteId: string | undefined = data?.noteId;
          if (!noteId) {
            console.warn('[comments] doc missing noteId:', docSnap.id);
            return;
          }

          const createdAtMillis = getCreatedAtMillis(data);
          if (!createdAtMillis) console.warn('[comments] createdAt missing/invalid in doc:', docSnap.id, data);

          const lastViewedMillis = lastViewedMap[noteId] ?? 0;

          if (createdAtMillis > lastViewedMillis) {
            newUnseen.add(noteId);
          }
        });

        console.log('[comments] newUnseen:', Array.from(newUnseen));
        setUnseenNotesSet(prev => {
          const same = prev.size === newUnseen.size && Array.from(prev).every(v => newUnseen.has(v));
          if (same) return prev;
          return newUnseen;
        });

        const newestDoc = snapshot.docs[0];
        if (newestDoc) {
          const data: any = newestDoc.data();
          const createdAtMillis = getCreatedAtMillis(data) || 0;

          if (newestDoc.id !== lastShownCommentIdRef.current && createdAtMillis > lastCheckedRef.current) {
            lastShownCommentIdRef.current = newestDoc.id;
            console.log('[comments] showing banner for comment', newestDoc.id);
            setNotif({
              visible: true,
              noteId: data.noteId,
              noteTitle: data.noteTitle ?? 'Untitled',
              commentText: data.text ?? '',
            });
          }
        }
      },
      err => {
        console.warn('[comments] onSnapshot error:', err);
      }
    );

    lastCheckedRef.current = Date.now();

    return () => unsubscribe();
  }, [currentUser, lastViewedMap]);

  const openNoteAndMarkViewed = async (noteId?: string) => {
    if (!noteId) return;
    await markNoteViewed(noteId);
    setModalVisible(false);
    navigation.navigate('Comment', { noteId });
  };

  // Filter notes
  const filteredNotes = filter === 'mine' && currentUser ? notes.filter(note => note.userId === currentUser.uid) : notes;

  const unseenNoteItems = Array.from(unseenNotesSet).map(id => {
    const note = notes.find(n => n.id === id);
    return { id, title: note?.title ?? 'Untitled' };
  });

  return (
    <SafeAreaView style={styles.container}>
      <NotificationBanner
        visible={notif.visible}
        title={notif.noteTitle}
        subtitle={notif.commentText ? notif.commentText.slice(0, 80) : undefined}
        onPress={() => {
          setNotif({ visible: false });
          if (notif.noteId) openNoteAndMarkViewed(notif.noteId);
        }}
        onHide={() => setNotif({ visible: false })}
      />

      <Text style={styles.header}>Community Notes</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'mine' && styles.filterButtonActive]} onPress={() => setFilter('mine')}>
          <Text style={[styles.filterText, filter === 'mine' && styles.filterTextActive]}>Mine</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#A93853" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredNotes.map(note => {
            const moodOption = moodOptions.find(option => option.id === note.emojiId);
            const SvgIcon = moodOption ? moodOption.image : null;

            const hasUnseen = unseenNotesSet.has(note.id);

            return (
              <TouchableOpacity key={note.id} style={styles.card} activeOpacity={0.8} onPress={() => openNoteAndMarkViewed(note.id)}>
                <Text style={styles.user}>{note.username}</Text>
                <View style={styles.contentRow}>
                  {SvgIcon ? <SvgIcon width={32} height={32} style={styles.icon} /> : <Ionicons name="help-circle-outline" size={32} color="#A93853" style={styles.icon} />}
                  <View style={styles.textBlock}>
                    <Text style={styles.title}>{note.title}</Text>
                    <Text style={styles.message}>{note.details}</Text>
                  </View>
                  {/* Small dot indicator on card for unseen comments */}
                  {hasUnseen ? <View style={styles.unseenDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {currentUser ? (
        <View style={styles.floatingWrapper} pointerEvents="box-none">
          <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="notifications" size={22} color="#fff" />
            {unseenNotesSet.size > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unseenNotesSet.size}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      ) : (
        // small sign-in prompt if user logged out
        <TouchableOpacity style={styles.signInPrompt} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="log-in" size={20} color="#4A1D23" />
          <Text style={{ marginLeft: 6, color: '#4A1D23' }}>Sign in to see comments</Text>
        </TouchableOpacity>
      )}

      {/* Modal: list of notes with unseen comments */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New activity on your posts</Text>
            {unseenNoteItems.length === 0 ? (
              <Text style={{ marginTop: 12 }}>No new comments</Text>
            ) : (
              <FlatList
                data={unseenNoteItems}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => openNoteAndMarkViewed(item.id)}>
                    <Text style={styles.modalItemText} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              />
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#A93853', fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#FFF9FB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Community')}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#FFF9FB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Create')}>
          <Ionicons name="create" size={24} color="#FFF9FB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={24} color="#FFF9FB" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9FB',
    paddingHorizontal: 20,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.12,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1D23',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FAB9C9',
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#A93853',
  },
  filterText: {
    fontSize: 14,
    color: '#4A1D23',
  },
  filterTextActive: {
    color: '#FFF9FB',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FCDCE4',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  user: {
    fontSize: 14,
    color: '#4A1D23',
    marginBottom: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A1D23',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#4A1D23',
  },
  navbar: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#A93853',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 25,
  },

  /* floating button */
  floatingWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 130,
    zIndex: 999,
  },
  floatingButton: {
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: '#A93853',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF9FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#A93853',
    fontWeight: '700',
    fontSize: 12,
  },

  signInPrompt: {
    position: 'absolute',
    right: 20,
    bottom: 130,
    zIndex: 999,
    backgroundColor: '#FFEFF2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  unseenDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#A93853',
    marginLeft: 8,
    alignSelf: 'center',
  },

  /* modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A1D23',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  modalClose: {
    marginTop: 12,
    alignItems: 'center',
  },
});

export default CommunityNotesScreen;
