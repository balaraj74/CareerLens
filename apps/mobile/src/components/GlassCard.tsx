import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradientColors?: readonly string[];
  /** Accent variant adds a colored top border stripe */
  accent?: 'primary' | 'emerald' | 'amber' | 'rose' | 'none';
  /** Elevation levels affect shadow and border opacity */
  elevation?: 'low' | 'medium' | 'high';
}

const ACCENT_COLORS: Record<string, string> = {
  primary: COLORS.primary[500],
  emerald: COLORS.emerald[500],
  amber: COLORS.amber[500],
  rose: COLORS.rose[500],
  none: 'transparent',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 40,
  tint = 'light',
  gradientColors = COLORS.glass.bgLight,
  accent = 'none',
  elevation = 'low',
}) => {
  // We use a premium solid style now, moving away from heavy glassmorphism
  const accentColor = ACCENT_COLORS[accent] ?? 'transparent';

  // Use gradientColors if it's an array, otherwise default
  const colorsArray = Array.isArray(gradientColors)
    ? gradientColors
    : ['#FFFFFF', '#FFFFFF'];

  return (
    <View
      style={[
        styles.container,
        {
          // Premium depth requested: shadow 0 8 24 rgba(0,0,0,0.08)
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 4,
          // Subtle border
          borderColor: 'rgba(255, 255, 255, 0.7)',
          borderWidth: 1,
        },
        style,
      ]}
    >
      {/* Inner background fill */}
      <LinearGradient
        colors={colorsArray as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Accent top border */}
      {accent !== 'none' && (
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      )}

      {/* Content wrapper */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 10,
  },
  content: {
    padding: 16,
    zIndex: 1,
  },
});

export default GlassCard;
