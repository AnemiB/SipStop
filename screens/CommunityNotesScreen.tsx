import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

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

const CommunityNotesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async snapshot => {
      const notesData = await Promise.all(
        snapshot.docs.map(async docSnap => {
          const noteData = docSnap.data();
          let username = noteData.username || 'Anonymous';

          if (!noteData.username && noteData.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', noteData.userId));
              if (userDoc.exists() && userDoc.data().username) {
                username = userDoc.data().username;
              }
            } catch (err) {
              console.error('Error fetching username:', err);
            }
          }

          return {
            id: docSnap.id,
            ...noteData,
            username,
          };
        })
      );

      setNotes(notesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePress = (id: string) => {
    navigation.navigate('Comment', { noteId: id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Community Notes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#A93853" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {notes.map(note => {
            const moodOption = moodOptions.find(option => option.id === note.emojiId);
            const SvgIcon = moodOption ? moodOption.image : null;

            return (
              <TouchableOpacity
                key={note.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => handlePress(note.id)}
              >
                <Text style={styles.user}>{note.username}</Text>
                <View style={styles.contentRow}>
                  {SvgIcon ? (
                    <SvgIcon width={32} height={32} style={styles.icon} />
                  ) : (
                    <Ionicons
                      name="help-circle-outline"
                      size={32}
                      color="#A93853"
                      style={styles.icon}
                    />
                  )}
                  <View style={styles.textBlock}>
                    <Text style={styles.title}>{note.title}</Text>
                    <Text style={styles.message}>{note.details}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

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
    marginBottom: height * 0.04,
  },
  scrollContent: {
    paddingBottom: 20,
      marginTop: 20,
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
});

export default CommunityNotesScreen;
