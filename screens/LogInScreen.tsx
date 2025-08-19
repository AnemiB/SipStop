import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { loginUser } from '../services/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LogIn'>;

const LogInScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogIn = async () => {
    try {
      const res = await loginUser(email, password);
      if (res.user) {
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        let message = 'Login failed';
        const code = res.error?.code;
        if (code === 'auth/user-not-found') message = 'No account found with this email';
        if (code === 'auth/wrong-password') message = 'Incorrect password';
        if (res.error?.message) message = res.error.message;
        Alert.alert('Error', message);
      }
    } catch (error: any) {
      let message = 'Login failed';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcome}>Welcome Back!</Text>
      <Text style={styles.loginText}>Log In</Text>

      <View style={styles.inputBox}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="..."
          placeholderTextColor="#A93853"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="..."
          placeholderTextColor="#A93853"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogIn}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
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
  loginButton: {
    backgroundColor: '#F25077',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFF9FB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#A93853',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#FFF9FB',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LogInScreen;
