/**
 * CareerLens Design Token System - Professional Light Theme
 * Single source of truth for all colors, gradients, and spacing.
 */

export const COLORS = {
  // Base backgrounds — clean and bright
  bg: {
    deep: '#F8FAFC',    // slate-50 (app background)
    base: '#F1F5F9',    // slate-100
    elevated: '#FFFFFF', // pure white (cards)
    surface: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },

  // Primary — Professional Blue
  primary: {
    900: '#1E3A8A',
    700: '#1D4ED8',
    500: '#2563EB', // New primary
    400: '#3B82F6',
    300: '#60A5FA',
    200: '#BFDBFE',
    glow: 'rgba(37, 99, 235, 0.15)',
    subtle: 'rgba(37, 99, 235, 0.08)',
    border: 'rgba(37, 99, 235, 0.2)',
  },

  // Secondary — Slate (Neutral accents)
  secondary: {
    900: '#0F172A',
    700: '#334155',
    500: '#64748B', // Match secondary
    400: '#94A3B8',
    300: '#CBD5E1',
    200: '#E2E8F0',
    subtle: 'rgba(100, 116, 139, 0.08)',
    border: 'rgba(100, 116, 139, 0.2)',
  },

  // Accent — Emerald Green (Success/Growth)
  emerald: {
    500: '#10B981', // Match success
    400: '#34D399',
    300: '#6EE7B7',
    glow: 'rgba(16, 185, 129, 0.15)',
    subtle: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.2)',
  },

  // Warning — Amber
  amber: {
    500: '#F59E0B', // Match warning
    400: '#FBBF24',
    300: '#FCD34D',
    subtle: 'rgba(245, 158, 11, 0.08)',
  },

  // Danger — Rose/Red
  rose: {
    500: '#EF4444', // New danger
    400: '#F87171',
    subtle: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.2)',
  },

  // Neutral text
  text: {
    primary: '#0F172A',   // slate-900
    secondary: '#475569', // slate-600
    muted: '#64748B',     // slate-500
    faint: '#94A3B8',     // slate-400
    inverse: '#FFFFFF',   // white (on dark buttons)
  },

  // Glass effects (adapted for light mode)
  glass: {
    border: 'rgba(0, 0, 0, 0.06)',
    borderStrong: 'rgba(0, 0, 0, 0.12)',
    bg: 'rgba(255, 255, 255, 0.85)',
    bgLight: 'rgba(255, 255, 255, 0.95)',
    shine: 'rgba(255, 255, 255, 0.8)',
  },
} as const;

export const GRADIENTS = {
  // Screen backgrounds (subtle light gradients)
  screenLight: ['#F8FAFC', '#F1F5F9'],
  screenWhite: ['#FFFFFF', '#F8FAFC'],

  // Hero / brand gradient
  brand: ['#1D4ED8', '#3B82F6'],
  brandReverse: ['#3B82F6', '#1D4ED8'],
  brandSoft: ['rgba(59,130,246,0.1)', 'rgba(59,130,246,0.02)'],

  // Button gradients
  btnPrimary: ['#2563EB', '#3B82F6'],
  btnSecondary: ['#475569', '#64748B'],
  btnSuccess: ['#059669', '#10B981'],

  // Card accents (very subtle on white)
  cardPrimary: ['rgba(59,130,246,0.04)', 'rgba(59,130,246,0.01)'],
  cardEmerald: ['rgba(16,185,129,0.04)', 'rgba(16,185,129,0.01)'],
  cardAmber: ['rgba(245,158,11,0.04)', 'rgba(245,158,11,0.01)'],
  cardNeutral: ['#FFFFFF', '#F8FAFC'],

  // Header accent stripe
  headerPrimary: ['rgba(59,130,246,0.0)', 'rgba(59,130,246,0.1)', 'rgba(59,130,246,0.0)'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const TYPOGRAPHY = {
  // Display sizes
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '600', letterSpacing: 0 },

  // Body
  bodyLg: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySm: { fontSize: 13, fontWeight: '400', lineHeight: 18 },

  // Labels
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  caption: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
} as const;
