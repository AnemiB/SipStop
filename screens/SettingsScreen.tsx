import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Alert, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { auth, db } from '../firebase';
import { signOut, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('Loading...');
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || '');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsername();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Update username
      if (newUsername.trim() !== '') {
        await updateDoc(doc(db, 'users', user.uid), {
          username: newUsername,
        });
        setUsername(newUsername);
        setNewUsername('');
      }

      // Update password
      if (password && newPassword && password !== newPassword) {
        await updatePassword(user, newPassword);
        setPassword('');
        setNewPassword('');
      }

      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      console.error("Error updating settings:", error);
      Alert.alert('Update failed', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'LogIn' }],
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      Alert.alert('Sign out failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        editable={false}
      />

      <Text style={styles.label}>New Username</Text>
      <TextInput
        style={styles.input}
        placeholder="..."
        placeholderTextColor="#FEEEF1"
        value={newUsername}
        onChangeText={setNewUsername}
      />

      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        placeholder="..."
        placeholderTextColor="#FEEEF1"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="..."
        placeholderTextColor="#FEEEF1"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
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
  label: {
    color: '#4A1D23',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#F25077',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 6,
    fontSize: 14,
    color: '#4A1D23',
  },
  saveButton: {
    backgroundColor: '#F25077',
    borderRadius: 30,
    paddingVertical: 14,
    marginTop: 35,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#A93853',
    borderRadius: 30,
    paddingVertical: 14,
    marginTop: 12,
    alignItems: 'center',
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

export default SettingsScreen;
