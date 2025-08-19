import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { registerUser } from '../services/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      const res = await registerUser(username, email, password);
      if (res.user) {
        // Render the appropriate (logged-in) stack automatically.
        Alert.alert('Success', 'Account created!');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', res.error?.message ?? 'Registration failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleGoToLogin = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      Alert.alert('Info', 'Please use the login entry point to sign in.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcome}>Welcome!</Text>
      <Text style={styles.loginText}>Sign Up</Text>

      <View style={styles.inputBox}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} placeholder="..." placeholderTextColor="#A93853" value={username} onChangeText={setUsername} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="..." placeholderTextColor="#A93853" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="..." placeholderTextColor="#A93853" secureTextEntry value={password} onChangeText={setPassword} />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} placeholder="..." placeholderTextColor="#A93853" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A1D23',
    marginBottom: 8,
  },
  loginText: {
    fontSize: 18,
    color: '#4A1D23',
    marginBottom: 24,
  },
  inputBox: {
    backgroundColor: '#FCDCE4',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#4A1D23',
  },
  input: {
    borderWidth: 2,
    borderColor: '#F25077',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    color: '#4A1D23',
    backgroundColor: '#FFF9FB',
  },
  signupButton: {
    backgroundColor: '#F25077',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  signupButtonText: {
    color: '#FFF9FB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#A93853',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF9FB',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignUpScreen;
