import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../src/components/GlassCard';
import { COLORS, GRADIENTS } from '../src/theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'AI Career\nCo-Pilot',
    desc: 'Get personalized advice, resume reviews, and interview prep from our advanced AI.',
    icon: 'sparkles',
    gradient: GRADIENTS.brand,
  },
  {
    id: 2,
    title: 'Track Your\nGrowth',
    desc: 'Measure your skills against market demands and close gaps with targeted learning.',
    icon: 'trending-up',
    gradient: [COLORS.emerald[500], COLORS.emerald[400]],
  },
  {
    id: 3,
    title: 'Land Your\nDream Role',
    desc: 'From mock interviews to portfolio building, we are with you every step of the way.',
    icon: 'rocket',
    gradient: [COLORS.primary[500], COLORS.primary[400]],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIdx(Math.round(x / width));
  };

  const nextSlide = () => {
    if (activeIdx < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIdx + 1) * width, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={GRADIENTS.screenLight} style={StyleSheet.absoluteFill} />

      {/* Skip Button */}
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slideWrap}>
            <View style={styles.imageZone}>
              {/* Abstract decorative elements instead of images for now */}
              <GlassCard style={styles.heroCard} gradientColors={GRADIENTS.cardNeutral} elevation="medium">
                <LinearGradient colors={slide.gradient as any} style={styles.iconWrap}>
                  <Ionicons name={slide.icon as any} size={48} color="#fff" />
                </LinearGradient>
                <View style={styles.decoCircle1} />
                <View style={styles.decoCircle2} />
              </GlassCard>
            </View>

            <View style={styles.textZone}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.desc}>{slide.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomZone}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIdx === i ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={nextSlide} activeOpacity={0.8}>
          <LinearGradient colors={GRADIENTS.brand} style={styles.nextBtnInner}>
            <Text style={styles.nextText}>
              {activeIdx === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.base },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  skipText: {
    color: COLORS.text.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  slideWrap: {
    width,
    height: height * 0.7,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageZone: {
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 2,
  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59,130,246,0.05)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  textZone: {
    marginTop: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text.primary,
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
    paddingRight: 20,
  },
  bottomZone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary[500],
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.glass.borderStrong,
  },
  nextBtn: {
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
