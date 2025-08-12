import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import type { Timestamp } from 'firebase/firestore';

// SVG imports
import HappyOne from '../assets/HappyOne.svg';
import HappyTwo from '../assets/HappyTwo.svg';
import NormalOne from '../assets/NormalOne.svg';
import NormalTwo from '../assets/NormalTwo.svg';
import SadOne from '../assets/SadOne.svg';
import SadTwo from '../assets/SadTwo.svg';

type Props = {
  lastDrink: Timestamp | null;
  lastNoteMood: 'happy' | 'normal' | 'sad' | null;
  lastDrinkMotivation: string | null;
  now: Timestamp;
  loadingDrink?: boolean;
  loadingNote?: boolean;
  messagesOverride?: any;
  hasNote?: boolean; 
  onAddNotePress?: () => void;
};

const goalDaysMap: Record<string, number> = {
  '1 week': 7,
  '1 month': 30,
  '3 months': 90,
  '6 months': 180,
  '1 year': 365,
};

const defaultMessages = {
  relapse: {
    happy: [
      "One step back doesn’t erase the progress you've made. Start fresh, you can do this.",
      "Feelings are real, you're learning. We'll keep going together."
    ],
    normal: [
      "This was a bump in the road. Small steps tomorrow build the path forward.",
      "You've handled hard days before, you'll handle this one too."
    ],
    sad: [
      "Be kind to yourself right now. Tomorrow is another chance to try again.",
      "It hurts, that's okay. You're still moving forward simply by noticing it."
    ]
  },
  early: {
    happy: [
      "Nice start! Keep building the good habit, one hour at a time.",
      "You're off to a great beginning! Keep stacking those wins."
    ],
    normal: [
      "Early days can be tricky. Keep your goal visible and be gentle with yourself.",
      "Small wins matter. Celebrate the minutes and hours."
    ],
    sad: [
      "This is tough, but you’ve already begun. Don’t give up on yourself.",
      "You’re starting something important, it’s ok to be scared."
    ]
  },
  milestone: {
    happy: [
      "Amazing progress! Look at how far you’ve come already.",
      "You should be proud! Keep going, you’re doing great."
    ],
    normal: [
      "A strong streak forming. Stick with the routine that helps you.",
      "You're building momentum, keep protecting it."
    ],
    sad: [
      "Even on harder days, your streak shows real effort. Keep going.",
      "You’ve made meaningful progress. Don’t let one tough day define it."
    ]
  },
  longTerm: {
    happy: [
      "You’ve built something powerful. Keep owning it.",
      "Your consistency is inspiring, keep it up!"
    ],
    normal: [
      "Long-term progress is real. Maintain your supports and celebrate small wins.",
      "Wonderful consistency, you’re in a different league now."
    ],
    sad: [
      "Long streaks still have rough days. You’ve proven you can make it through.",
      "You’ve been steady, lean on your tools and supports today."
    ]
  },
  goalNear: {
    happy: [
      "You're nearly at your goal, this is huge. Keep pushing!",
      "So close to your target! Let's finish strong."
    ],
    normal: [
      "You're approaching your goal, little decisions matter now.",
      "Almost there. Keep using what’s worked for you."
    ],
    sad: [
      "You're close, don't let discouragement stop you. One day at a time.",
      "You're nearly there. Reach out for support if you need it."
    ]
  },
  default: [
    "Keep going, small steps add up.",
    "You’re doing better than you think. Keep it up!"
  ]
};

function pick<T>(arr: T[] | undefined, seed?: number) {
  if (!arr || arr.length === 0) return null;
  if (typeof seed === 'number') {
    return arr[Math.abs(seed) % arr.length];
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

const moodAssetMap = {
  happy: [HappyOne, HappyTwo],
  normal: [NormalOne, NormalTwo],
  sad: [SadOne, SadTwo],
};

function formatTimeAgo(diffMs: number) {
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) {
    const s = Math.floor(seconds);
    return `${s} second${s === 1 ? '' : 's'} ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    if (minutes === 1) return 'about a minute ago';
    if (minutes < 5) return `${minutes} minutes ago`;
    return `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    if (hours === 1) return 'about an hour ago';
    if (hours < 6) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

const EncouragementCard: React.FC<Props> = ({
  lastDrink,
  lastNoteMood,
  lastDrinkMotivation,
  now,
  loadingDrink = false,
  loadingNote = false,
  messagesOverride,
  hasNote = true,
  onAddNotePress,
}) => {
  const messages = messagesOverride ?? defaultMessages;

  const [fixedMessage, setFixedMessage] = useState<string | null>(null);
  const [FixedIcon, setFixedIcon] = useState<React.ComponentType<any> | React.ReactElement<any> | null>(null);
  const [categoryAtChoose, setCategoryAtChoose] = useState<string | null>(null);

  useEffect(() => {
    if (loadingDrink || loadingNote) {
      setFixedMessage(null);
      setFixedIcon(null);
      setCategoryAtChoose(null);
      return;
    }

    if (!lastDrink) {
      setFixedMessage("Welcome! Log your first drink so we can track your progress and cheer you on.");
      setFixedIcon(hasNote ? NormalOne : null);
      setCategoryAtChoose(null);
      return;
    }

    const nowMs = Date.now();
    const lastMs = lastDrink.toDate().getTime();
    const diffMsAtChoose = Math.max(0, nowMs - lastMs);
    const diffDaysAtChoose = Math.floor(diffMsAtChoose / (1000 * 60 * 60 * 24));

    let category: keyof typeof messages = 'early';
    if (diffDaysAtChoose < 1) category = 'relapse';
    else if (diffDaysAtChoose < 7) category = 'early';
    else if (diffDaysAtChoose < 30) category = 'milestone';
    else category = 'longTerm';

    let selectedPhrase: string | null = null;
    if (lastDrinkMotivation) {
      const goalDays = goalDaysMap[lastDrinkMotivation] ?? null;
      if (goalDays) {
        if (diffDaysAtChoose >= goalDays) {
          const opt = (messages as any).goalNear?.[lastNoteMood ?? 'normal'] ?? (messages as any).longTerm?.[lastNoteMood ?? 'normal'];
          selectedPhrase = pick(opt) ?? pick((messages as any).default);
        } else {
          const remaining = goalDays - diffDaysAtChoose;
          if (remaining <= Math.max(3, Math.ceil(goalDays * 0.1))) {
            const opt = (messages as any).goalNear?.[lastNoteMood ?? 'normal'] ?? (messages as any).milestone?.[lastNoteMood ?? 'normal'];
            selectedPhrase = pick(opt) ?? pick((messages as any).default);
          }
        }
      }
    }

    if (!selectedPhrase) {
      const pool = (messages as any)[category]?.[lastNoteMood ?? 'normal'] ?? (messages as any)[category]?.normal;
      selectedPhrase = pick(pool) ?? pick((messages as any).default);
    }

    const seedBase = (lastDrink?.seconds ?? Math.floor(lastMs / 1000));
    const mood = lastNoteMood ?? 'normal';
    const moodCharSum = Array.from(mood).reduce((s, c) => s + c.charCodeAt(0), 0);
    const seed = seedBase + moodCharSum;
    const candidates = (moodAssetMap as any)[mood] ?? moodAssetMap.normal;
    const IconComp = (pick(candidates, seed) as any) ?? NormalOne;

    setFixedMessage(selectedPhrase);
    setFixedIcon(hasNote ? IconComp : null);
    setCategoryAtChoose(category);
  }, [lastDrink?.seconds, lastNoteMood, lastDrinkMotivation, messagesOverride, loadingDrink, loadingNote, hasNote]);

  const dynamicSuffix = useMemo(() => {
    if (!lastDrink) return '';
    const nowDate = now.toDate();
    const lastDate = lastDrink.toDate();
    const diffMs = Math.max(0, nowDate.getTime() - lastDate.getTime());

    const human = formatTimeAgo(diffMs);

    if (categoryAtChoose === 'relapse') {
      return ` You last had a drink ${human}.`;
    } else {
      if (human === 'yesterday' || human === 'just now' || human.includes('hour') || human.includes('minute') || human.includes('second')) {
        return ` You've been sober for ${human.replace(' ago', '')}.`;
      }
      return ` You've been sober for ${human.replace(' ago', '')}.`;
    }
  }, [now, lastDrink, categoryAtChoose]);

  if (loadingDrink || loadingNote) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color="#FFF9FB" />
      </View>
    );
  }

  const IconCandidate = FixedIcon ?? NormalOne;
  const displayMessage = (fixedMessage ?? defaultMessages.default[0]) + (lastDrink ? dynamicSuffix : '');
  const showNotePrompt = hasNote === false && !loadingNote;

  // TS-safe render: cloneElement cast to any to avoid strict unknown(jsx) props error. this is the case for the svg null for new users
  const renderIcon = () => {
    if (!IconCandidate) return null;

    if (React.isValidElement(IconCandidate)) {
      return React.cloneElement(IconCandidate as React.ReactElement<any>, { width: 36, height: 36 } as any);
    }

    if (typeof IconCandidate === 'function') {
      const Comp = IconCandidate as React.ComponentType<any>;
      return <Comp width={36} height={36} />;
    }

    return null;
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          {showNotePrompt ? (
            <View style={styles.placeholder}>
              <Text style={styles.notePromptText}>Add a note to personalise this emotion</Text>
            </View>
          ) : (
            renderIcon()
          )}
        </View>

        <Text style={styles.text}>{displayMessage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F25077',
    borderRadius: 20,
    padding: 25,
    marginBottom: 16,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconWrapper: { 
    marginRight: 12, 
    width: 120, height: 44, 
    justifyContent: 'center', 
    alignItems: 'flex-start' 
  },
  placeholder: { 
    justifyContent: 'center' 
  },
  notePromptText: { 
    color: '#FFF9FB', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  addNoteCta: { 
    marginTop: 6, 
    backgroundColor: '#A93853', 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 12 },
  addNoteText: { 
    color: '#FFF9FB', 
    fontWeight: '700', 
    fontSize: 12 },
  text: { 
    color: '#FFF9FB', 
    fontSize: 15, 
    fontWeight: '500', 
    flex: 1 },
});

export default EncouragementCard;
