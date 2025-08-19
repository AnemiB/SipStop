// services/authService.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged as rnOnAuthStateChanged } from 'firebase/auth';

type ServiceResult = { user?: User; error?: any };

export const loginUser = async (email: string, password: string): Promise<ServiceResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: any) {
    console.log('Login Error:', error.message ?? error);
    return { error };
  }
};

// Register user and write basic profile data in Firestore
export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<ServiceResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a minimal user document
    await setDoc(doc(db, 'users', user.uid), {
      email,
      username,
      lastDrinkDate: null,
      createdAt: serverTimestamp(),
    });

    return { user };
  } catch (error: any) {
    console.log('Register Error:', error.message ?? error);
    return { error };
  }
};

export const logoutUser = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    await signOut(auth);
    console.log('User Logged Out...');
    return { success: true };
  } catch (error: any) {
    console.log('Logout Error:', error.message ?? error);
    return { success: false, error };
  }
};

export const getUserInfo = () => {
  return auth.currentUser ?? null;
};

// Small helper to subscribe to auth changes (returns unsubscribe)
export const onAuthStateChanged = (cb: (user: User | null) => void) => {
  return rnOnAuthStateChanged(auth, cb);
};
