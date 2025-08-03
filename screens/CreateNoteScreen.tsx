import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// SVG imports
import HappyOne from '../assets/HappyOne.svg';
import HappyTwo from '../assets/HappyTwo.svg';
import NormalOne from '../assets/NormalOne.svg';
import NormalTwo from '../assets/NormalTwo.svg';
import SadOne from '../assets/SadOne.svg';
import SadTwo from '../assets/SadTwo.svg';

// Firebase
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Create'>;

const moodOptions = [
  { id: 4, image: HappyOne, category: 'happy' },
  { id: 5, image: HappyTwo, category: 'happy' },
  { id: 2, image: NormalOne, category: 'normal' },
  { id: 3, image: NormalTwo, category: 'normal' },
  { id: 0, image: SadOne, category: 'sad' },
  { id: 1, image: SadTwo, category: 'sad' },
];

const CreateNoteScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (selectedEmoji === null || title.trim() === '' || details.trim() === '') {
      Alert.alert('Please complete all fields.');
      return;
    }

    const moodCategory = moodOptions.find(option => option.id === selectedEmoji)?.category;
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Not signed in.');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'notes'), {
        userId: user.uid,
        mood: moodCategory,
        emojiId: selectedEmoji,
        title: title.trim(),
        details: details.trim(),
        timestamp: serverTimestamp(),
      });

      // Reset state
      setSelectedEmoji(null);
      setTitle('');
      setDetails('');
      Alert.alert('Note saved!');
      navigation.navigate('Home');
    } catch (error: any) {
      console.error('Error saving note:', error);
      Alert.alert('Save failed:', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>New Note</Text>

      <View style={styles.noteCard}>
        <Text style={styles.label}>How are you feeling?</Text>
        <View style={styles.emojiRow}>
          {moodOptions.map(({ id, image: SvgIcon }) => (
            <TouchableOpacity key={id} onPress={() => setSelectedEmoji(id)}>
              <View style={[styles.emojiImage, selectedEmoji === id && styles.selectedEmoji]}>
                <SvgIcon width={40} height={40} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subLabel}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.subLabel}>Details</Text>
        <TextInput
          style={[styles.input, styles.detailsInput]}
          placeholder="..."
          placeholderTextColor="#999"
          multiline
          value={details}
          onChangeText={setDetails}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>

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
  noteCard: {
    backgroundColor: '#FCDCE4',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    textAlign: 'center',
    color: '#4A1D23',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  emojiImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  selectedEmoji: {
    borderWidth: 2,
    borderColor: '#F25077',
    borderRadius: 35,
    backgroundColor: '#FFE8ED',
  },
  subLabel: {
    color: '#4A1D23',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#F25077',
    backgroundColor: '#FFF9FB',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 14,
    color: '#4A1D23',
  },
  detailsInput: {
    height: 100,
    borderRadius: 20,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#F25077',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFF9FB',
    fontWeight: 'bold',
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

export default CreateNoteScreen;
