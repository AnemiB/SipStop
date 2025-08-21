import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Pressable, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const { height } = Dimensions.get('window');

const OnboardingModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(true);

  // Firestore doc path
  const buildOnboardingDocRef = (uid: string) => doc(db, 'users', uid, 'settings', 'onboarding');

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const auth = getAuth();
        const uid = auth.currentUser?.uid ?? null;

        if (uid) {
          const onboardingDocRef = buildOnboardingDocRef(uid);
          const snap = await getDoc(onboardingDocRef);
          const seen = snap.exists() && !!(snap.data() as any).seen;
          if (mounted) setVisible(!seen);
        } else {
          const val = await AsyncStorage.getItem('hasOnboarded_anonymous');
          if (mounted) setVisible(val !== 'true');
        }
      } catch (err) {
        // If anything fails, show the modal (safe fallback)
        console.warn('OnboardingModal: failed reading onboarding state, falling back to showing modal', err);
        if (mounted) setVisible(true);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, []);

  const closeAndPersist = async () => {
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid ?? null;

      if (uid) {
        const onboardingDocRef = buildOnboardingDocRef(uid);
        await setDoc(onboardingDocRef, { seen: true, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        await AsyncStorage.setItem('hasOnboarded_anonymous', 'true');
      }
    } catch (err) {
      console.warn('OnboardingModal: failed persisting onboarding state; modal will still close:', err);
    } finally {
      setVisible(false);
    }
  };

  if (checking) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={closeAndPersist}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable style={styles.closeIcon} onPress={closeAndPersist} accessibilityLabel="Close onboarding">
            <Ionicons name="close" size={22} color="#4A1D23" />
          </Pressable>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Welcome ✨</Text>

            <Text style={styles.paragraph}>Thanks for joining; here are the basics to get you started:</Text>

            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Track your sobriety with a live timer on the Home screen and receive motivational messages.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Add notes or log drinks. Notes can include a mood, title and details; then save them.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Community Notes are anonymous. You can delete only the notes you created and filter to view your
                notes via the “Mine” filter.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                In the Community tab there is an alerts button; tap it to see notifications for activity on your posts.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Return to Home anytime to see your sober time and an encouraging message tailored to you.
              </Text>
            </View>

            <Text style={styles.small}>
              If you're signed in this preference is saved to your account (won't show on other devices). If you're not
              signed in, it will be saved locally on this device.
            </Text>

            <TouchableOpacity style={styles.button} onPress={closeAndPersist} accessibilityLabel="Got it, close onboarding">
              <Text style={styles.buttonText}>Got it!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.ghostButton]}
              onPress={() => setVisible(false)}
              accessibilityLabel="Close without saving onboarding preference"
            >
              <Text style={[styles.buttonText, styles.ghostText]}>Close (show again next time)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default OnboardingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#4a1d2321)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  card: {
    width: '100%',
    maxHeight: Math.min(680, height - 120),
    backgroundColor: '#FFF9FB',
    borderRadius: 16,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: '#4A1D23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  closeIcon: {
    position: 'absolute',
    right: 14,
    top: 12,
    zIndex: 10,
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#A93853',
    textAlign: 'center',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#4A1D23',
    marginBottom: 12,
    textAlign: 'left',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A93853',
    marginTop: 6,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#4A1D23',
  },
  small: {
    fontSize: 12,
    color: '#FFF9FB',
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#A93853',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF9FB',
    fontWeight: '700',
    fontSize: 16,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    marginTop: 6,
  },
  ghostText: {
    color: '#A93853',
    fontSize: 14,
  },
});
