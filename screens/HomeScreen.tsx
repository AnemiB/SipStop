import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

const { height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [lastDrink, setLastDrink] = useState<Timestamp | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDrink, setLoadingDrink] = useState(true);
  const [now, setNow] = useState(Timestamp.now());

  // Fetch username once on mount
  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth.currentUser;
      if (!user) {
        setUsername(null);
        setLoadingUser(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username || 'User');
        } else {
          setUsername('User');
        }
      } catch (err) {
        console.error('Error fetching username:', err);
        setUsername('User');
      }
      setLoadingUser(false);
    };
    fetchUsername();
  }, []);

  // Real-time listener for last drink timestamp
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLastDrink(null);
      setLoadingDrink(false);
      return;
    }

    const q = query(
      collection(db, 'drinks'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          setLastDrink(snapshot.docs[0].data().timestamp as Timestamp);
        } else {
          setLastDrink(null);
        }
        setLoadingDrink(false);
      },
      (error) => {
        console.error('Error fetching last drink:', error);
        setLastDrink(null);
        setLoadingDrink(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update current time every minute to keep sober timer fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Timestamp.now());
    }, 60 * 1000); // every minute

    return () => clearInterval(interval);
  }, []);

  const renderSoberCard = () => {
    if (loadingUser || loadingDrink) {
      return <ActivityIndicator size="small" color="#4A1D23" style={{ marginVertical: 20 }} />;
    }

    if (!lastDrink) {
      return (
        <View style={styles.noDrinkCard}>
          <Text style={styles.noDrinkText}>Please log a drink first</Text>
        </View>
      );
    }

    const diffSeconds = now.seconds - lastDrink.seconds;
    const days = Math.floor(diffSeconds / 86400);
    const hours = Math.floor((diffSeconds % 86400) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);

    return (
      <View style={styles.soberCard}>
        <Text style={styles.soberText}>You have been sober for:</Text>
        <Text style={styles.soberTime}>
          {days} days, {hours} hours and {minutes} minutes
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Hello, {username || 'User'}!</Text>

      {renderSoberCard()}

      <View style={styles.messageCard}>
        <View style={styles.messageRow}>
          <Ionicons name="happy-outline" size={32} color="#FFF9FB" style={styles.messageIcon} />
          <Text style={styles.messageText}>
            This is a really good start!{"\n"}Let’s keep going!
          </Text>
        </View>
      </View>

      <View style={styles.messageCardSecond}>
        <Text style={styles.messageTextSecond}>
          Let’s go on a walk today!{"\n"}
          Keeping busy is always good for you.{"\n"}
          You can invite a friend to join you.
        </Text>
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackText}>How do you feel about this?</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.addNoteButton} onPress={() => navigation.navigate('Create')}>
            <Text style={styles.buttonText}>Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logDrinkButton} onPress={() => navigation.navigate('Drinks')}>
            <Text style={styles.buttonText}>Log Drink</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    marginBottom: height * 0.05,
  },
  soberCard: {
    backgroundColor: '#FCDCE4',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  soberText: {
    fontSize: 14,
    color: '#4A1D23',
  },
  soberTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A1D23',
    marginTop: 4,
  },
  noDrinkCard: {
    backgroundColor: '#F8D7DA',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  noDrinkText: {
    fontSize: 16,
    color: '#721C24',
    fontWeight: 'bold',
  },
  messageCard: {
    backgroundColor: '#F25077',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageIcon: {
    marginRight: 12,
  },
  messageText: {
    color: '#FFF9FB',
    fontSize: 15,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  messageCardSecond: {
    backgroundColor: '#F25077',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  messageTextSecond: {
    color: '#FFF9FB',
    fontSize: 15,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  feedbackCard: {
    backgroundColor: '#FCDCE4',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  feedbackText: {
    color: '#4A1D23',
    fontSize: 14,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addNoteButton: {
    backgroundColor: '#F25077',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  logDrinkButton: {
    backgroundColor: '#A93853',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 24,
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

export default HomeScreen;
