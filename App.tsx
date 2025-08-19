// App.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LogInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import DrinksScreen from './screens/DinksScreen';
import SettingsScreen from './screens/SettingsScreen';
import CreateNoteScreen from './screens/CreateNoteScreen';
import CommunityNotesScreen from './screens/CommunityNotesScreen';
import CommentScreen from './screens/CommentScreen';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authInitializing, setAuthInitializing] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setAuthInitializing(false);
      console.log(user ? 'user logged in already' : 'user not logged in');
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authInitializing ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !isLoggedIn ? (
          <>
            <Stack.Screen name="LogIn" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Splash" component={SplashScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Drinks" component={DrinksScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Create" component={CreateNoteScreen} />
            <Stack.Screen name="Community" component={CommunityNotesScreen} />
            <Stack.Screen name="Comment" component={CommentScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

