import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Easing, Text, ViewStyle, StyleProp } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onHide?: () => void;
};

const NotificationBanner: React.FC<Props> = ({
  visible,
  title,
  subtitle,
  duration = 5000,
  style,
  onPress,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimerRef.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onHide && onHide();
        });
      }, duration);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          top: 14,
          left: 18,
          right: 18,
          zIndex: 999,
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={{
          backgroundColor: '#A93853',
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 12,
          shadowOpacity: 0.18,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{ color: '#FFF9FB', fontWeight: '700', fontSize: 15 }}>
          New comment on: {title ?? 'your note'}
        </Text>
        {subtitle ? (
          <Text style={{ color: '#FFF9FB', marginTop: 4, fontSize: 13 }}>{subtitle}</Text>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationBanner;
