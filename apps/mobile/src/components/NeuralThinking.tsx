import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';

export const NeuralThinking: React.FC = () => {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const cfg = { duration: 560, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
    dot1.value = withRepeat(withTiming(1, cfg), -1, true);
    dot2.value = withDelay(160, withRepeat(withTiming(1, cfg), -1, true));
    dot3.value = withDelay(320, withRepeat(withTiming(1, cfg), -1, true));
  }, []);

  const a1 = useAnimatedStyle(() => ({ opacity: dot1.value, transform: [{ translateY: dot1.value * -4 }] }));
  const a2 = useAnimatedStyle(() => ({ opacity: dot2.value, transform: [{ translateY: dot2.value * -4 }] }));
  const a3 = useAnimatedStyle(() => ({ opacity: dot3.value, transform: [{ translateY: dot3.value * -4 }] }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.brand} style={styles.avatarBadge}>
        <Ionicons name="sparkles" size={10} color="#fff" />
      </LinearGradient>
      <View style={styles.bubble}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { backgroundColor: COLORS.emerald[400] }, a1]} />
          <Animated.View style={[styles.dot, { backgroundColor: COLORS.primary[400] }, a2]} />
          <Animated.View style={[styles.dot, { backgroundColor: COLORS.emerald[400] }, a3]} />
        </View>
        <Text style={styles.text}>Thinking...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    marginVertical: 6,
    gap: 8,
  },
  avatarBadge: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.glass.bg,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  text: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

export default NeuralThinking;
