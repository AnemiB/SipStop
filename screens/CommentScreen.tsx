import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Keyboard, Animated, ActivityIndicator, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

import { doc, collection, getDoc, query, orderBy, onSnapshot, addDoc, serverTimestamp, } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

// SVG imports
import HappyOne from '../assets/HappyOne.svg';
import HappyTwo from '../assets/HappyTwo.svg';
import NormalOne from '../assets/NormalOne.svg';
import NormalTwo from '../assets/NormalTwo.svg';
import SadOne from '../assets/SadOne.svg';
import SadTwo from '../assets/SadTwo.svg';

const { height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 65;
const NAVBAR_BOTTOM_OFFSET = 45;
const GAP_ABOVE_NAVBAR = 16;
const BASE_INPUT_BOTTOM =
  NAVBAR_HEIGHT + NAVBAR_BOTTOM_OFFSET + GAP_ABOVE_NAVBAR;

type CommentNavProp = NativeStackNavigationProp<RootStackParamList, 'Comment'>;
type CommentRouteProp = RouteProp<RootStackParamList, 'Comment'>;

const moodOptions = [
  { id: 4, image: HappyOne, category: 'happy' },
  { id: 5, image: HappyTwo, category: 'happy' },
  { id: 2, image: NormalOne, category: 'normal' },
  { id: 3, image: NormalTwo, category: 'normal' },
  { id: 0, image: SadOne, category: 'sad' },
  { id: 1, image: SadTwo, category: 'sad' },
];

const CommentScreen = () => {
  const navigation = useNavigation<CommentNavProp>();
  const route = useRoute<CommentRouteProp>();
  const { noteId } = route.params;

  const [note, setNote] = useState<any | null>(null);
  const [noteAuthorName, setNoteAuthorName] = useState<string>('');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [keyboardHeight] = useState(new Animated.Value(BASE_INPUT_BOTTOM));
  const [loadingNote, setLoadingNote] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  const auth = getAuth();

  // Load note data
  useEffect(() => {
    const fetchNote = async () => {
      const noteDoc = await getDoc(doc(db, 'notes', noteId));
      if (noteDoc.exists()) {
        const noteData = noteDoc.data();
        setNote({ id: noteDoc.id, ...noteData });

        if (noteData.userId) {
          const userDocRef = doc(db, 'users', noteData.userId);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && userSnap.data().username) {
            setNoteAuthorName(userSnap.data().username);
          } else {
            setNoteAuthorName(noteData.username || 'Anonymous');
          }
        } else {
          setNoteAuthorName(noteData.username || 'Anonymous');
        }
      }
      setLoadingNote(false);
    };
    fetchNote();
  }, [noteId]);

  // Listen to comments real time updates
  useEffect(() => {
    const commentsQuery = query(
      collection(db, 'notes', noteId, 'comments'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(commentsQuery, snapshot => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [noteId]);

  // Keyboard animation - always moves with keyboard
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height + GAP_ABOVE_NAVBAR + 35,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardHeight, {
        toValue: BASE_INPUT_BOTTOM,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (newComment.trim() === '') return;

    try {
      let usernameToUse = 'Anonymous';

      if (auth.currentUser?.uid) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists() && userSnap.data().username) {
          usernameToUse = userSnap.data().username;
        } else if (auth.currentUser.displayName) {
          usernameToUse = auth.currentUser.displayName;
        }
      }

      await addDoc(collection(db, 'notes', noteId, 'comments'), {
        user: usernameToUse,
        text: newComment.trim(),
        timestamp: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loadingNote ? (
        <ActivityIndicator
          size="large"
          color="#A93853"
          style={{ marginTop: 20 }}
        />
      ) : note ? (
        <View style={styles.card}>
          <Text style={styles.user}>{noteAuthorName}</Text>
          <View style={styles.contentRow}>
            {(() => {
              const moodOption = moodOptions.find(
                option => option.id === note.emojiId
              );
              const SvgIcon = moodOption ? moodOption.image : null;
              return SvgIcon ? (
                <SvgIcon width={32} height={32} style={styles.icon} />
              ) : (
                <Ionicons
                  name="help-circle-outline"
                  size={32}
                  color="#A93853"
                  style={styles.icon}
                />
              );
            })()}
            <View style={styles.textBlock}>
              <Text style={styles.title}>{note.title}</Text>
              <Text style={styles.message}>{note.details}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: '#4A1D23',
          }}
        >
          Note not found.
        </Text>
      )}

      <Text style={styles.commentsHeader}>Comments</Text>

      {loadingComments ? (
        <ActivityIndicator
          size="small"
          color="#A93853"
          style={{ marginBottom: 20 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.commentsList}
          keyboardShouldPersistTaps="handled"
        >
          {comments.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#999' }}>
              No comments yet. Be the first!
            </Text>
          ) : (
            comments.map(c => (
              <View key={c.id} style={styles.commentBubble}>
                <Text style={styles.commentUser}>{c.user}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Animated.View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Leave a Comment"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#FFF9FB" />
          </TouchableOpacity>
        </View>
      </Animated.View>

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
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A1D23',
    textAlign: 'center',
    marginBottom: 12,
  },
  commentsList: {
    paddingBottom: 20,
  },
  commentBubble: {
    backgroundColor: '#F25077',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    maxWidth: '90%',
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF9FB',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#FFF9FB',
  },
  inputContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F25077',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 14,
    backgroundColor: '#FFF9FB',
  },
  sendButton: {
    backgroundColor: '#F25077',
    borderRadius: 25,
    padding: 12,
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
});

export default CommentScreen;
