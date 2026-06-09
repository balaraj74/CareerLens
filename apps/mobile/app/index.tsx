import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../src/store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../src/theme/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // 1. Logo zoom & fade animation
    scale.value = withTiming(1.05, { duration: 2000, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 1500 });
    
    // 2. Pulse glowing background circles
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );

    // 3. Navigation routing logic after splash animation
    const checkNavigation = async () => {
      // Simulate splash display time
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      if (loading) {
        // Wait for Firebase auth to load
        return;
      }

      const hasBoarded = await AsyncStorage.getItem('user_has_onboarded');
      if (user) {
        router.replace('/(tabs)');
      } else if (hasBoarded === 'true') {
        router.replace('/(auth)/login');
      } else {
        router.replace('/onboarding');
      }
    };

    if (!loading) {
      checkNavigation();
    }
  }, [loading, user]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
      
      {/* Brand Glow background circles */}
      <Animated.View style={[styles.glowCircle, styles.primaryGlow, animatedGlowStyle]} />
      <Animated.View style={[styles.glowCircle, styles.secondaryGlow, animatedGlowStyle]} />

      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <View style={styles.iconCircle}>
          <Image 
            source={require('../assets/icon.png')} 
            style={{ width: 96, height: 96, borderRadius: 48 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>CareerLens</Text>
        <Text style={styles.subtitle}>Your AI Career Co-Pilot</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Enterprise Architecture • v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary.subtle,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  iconText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary[500],
    fontFamily: 'System',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 8,
    fontWeight: '600',
    fontFamily: 'System',
  },
  glowCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
  },
  primaryGlow: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    top: '30%',
    left: '-10%',
  },
  secondaryGlow: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    bottom: '30%',
    right: '-10%',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: COLORS.text.muted,
    fontSize: 12,
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
});
