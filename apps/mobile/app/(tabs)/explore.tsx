import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

interface ExploreItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  route: string;
  badge?: string;
  category: 'Career & Prep' | 'Resources' | 'Tools';
}

const FEATURES: ExploreItem[] = [
  {
    id: 'navigator',
    title: 'Career Navigator',
    description: 'AI career tree from school to dream job',
    icon: 'map-outline',
    gradient: [COLORS.primary[500], COLORS.primary[400]],
    route: '/features/navigator',
    badge: 'AI Powered',
    category: 'Career & Prep',
  },
  {
    id: 'career-updates',
    title: 'Career Updates',
    description: 'Live trending skills & opportunities',
    icon: 'trending-up-outline',
    gradient: [COLORS.secondary[500], COLORS.secondary[400]],
    route: '/features/career-updates',
    badge: 'Live',
    category: 'Career & Prep',
  },
  {
    id: 'skillgap',
    title: 'Skill Gap',
    description: 'AI skill analysis & learning paths',
    icon: 'analytics-outline',
    gradient: [COLORS.emerald[500], COLORS.emerald[400]],
    route: '/features/skillgap',
    category: 'Career & Prep',
  },
  {
    id: 'resume',
    title: 'Resume ATS',
    description: 'Upload & improve score',
    icon: 'document-text-outline',
    gradient: [COLORS.emerald[500], COLORS.emerald[400]],
    route: '/features/resume',
    badge: 'Parser',
    category: 'Career & Prep',
  },
  {
    id: 'interview',
    title: 'Mock Interviews',
    description: 'Role-specific AI feedback',
    icon: 'videocam-outline',
    gradient: [COLORS.amber[500], COLORS.amber[400]],
    route: '/features/interview',
    badge: 'AI',
    category: 'Career & Prep',
  },
  {
    id: 'mentors',
    title: 'Mentor Finder',
    description: 'LinkedIn domain experts',
    icon: 'people-outline',
    gradient: [COLORS.rose[500], COLORS.rose[400]],
    route: '/features/mentors',
    category: 'Career & Prep',
  },
  {
    id: 'community',
    title: 'Community',
    description: 'College reviews & AI rank predictor',
    icon: 'people-circle-outline',
    gradient: [COLORS.primary[500], COLORS.secondary[500]],
    route: '/features/community',
    badge: 'Reviews',
    category: 'Career & Prep',
  },
  {
    id: 'colleges',
    title: 'College Ranker',
    description: 'Rank predictor & reviews',
    icon: 'school-outline',
    gradient: [COLORS.primary[500], COLORS.primary[400]],
    route: '/features/colleges',
    category: 'Resources',
  },
  {
    id: 'courses',
    title: 'Course Finder',
    description: 'NPTEL, Coursera, YouTube',
    icon: 'play-circle-outline',
    gradient: [COLORS.secondary[500], COLORS.secondary[400]],
    route: '/features/courses',
    category: 'Resources',
  },
  {
    id: 'library',
    title: 'Library Finder',
    description: 'Maps, ratings & distance',
    icon: 'location-outline',
    gradient: [COLORS.emerald[500], COLORS.emerald[400]],
    route: '/features/library',
    category: 'Resources',
  },
  {
    id: 'ebooks',
    title: 'eBook Library',
    description: 'Internet Archive indexer',
    icon: 'book-outline',
    gradient: [COLORS.amber[500], COLORS.amber[400]],
    route: '/features/ebooks',
    category: 'Resources',
  },
  {
    id: 'projects',
    title: 'Project Builder',
    description: 'Difficulty & guide maps',
    icon: 'construct-outline',
    gradient: [COLORS.emerald[500], COLORS.emerald[400]],
    route: '/features/projects',
    category: 'Tools',
  },
  {
    id: 'certifications',
    title: 'Certs Hub',
    description: 'Progress & trackers',
    icon: 'ribbon-outline',
    gradient: [COLORS.primary[500], COLORS.primary[400]],
    route: '/features/certifications',
    category: 'Tools',
  },
  {
    id: 'analytics',
    title: 'Growth Analytics',
    description: 'Streaks & indicators',
    icon: 'trending-up-outline',
    gradient: [COLORS.secondary[500], COLORS.secondary[400]],
    route: '/features/analytics',
    badge: 'Stats',
    category: 'Tools',
  },
];

const CATEGORIES = ['Career & Prep', 'Resources', 'Tools'] as const;

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Career & Prep': 'briefcase-outline',
  Resources: 'library-outline',
  Tools: 'build-outline',
};

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Career & Prep');

  const filtered = FEATURES.filter(
    (f) =>
      f.category === activeCategory &&
      (search === '' || f.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={GRADIENTS.screenLight} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSub}>Unlock your career potential</Text>
          </View>
          <LinearGradient colors={GRADIENTS.brand} style={styles.headerBadge}>
            <Ionicons name="compass" size={24} color="#fff" />
          </LinearGradient>
        </View>

        {/* ── SEARCH ── */}
        <GlassCard style={styles.searchCard} gradientColors={GRADIENTS.cardNeutral} elevation="low">
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={20} color={COLORS.text.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search features..."
              placeholderTextColor={COLORS.text.faint}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.text.faint} />
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>

        {/* ── CATEGORY FILTER ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={styles.catBtnWrap}
                activeOpacity={0.8}
              >
                {active ? (
                  <LinearGradient
                    colors={GRADIENTS.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.catBtn}
                  >
                    <Ionicons name={CATEGORY_ICONS[cat]} size={16} color="#fff" />
                    <Text style={[styles.catLabel, styles.catLabelActive]}>{cat}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.catBtn, styles.catBtnInactive]}>
                    <Ionicons name={CATEGORY_ICONS[cat]} size={16} color={COLORS.text.muted} />
                    <Text style={styles.catLabel}>{cat}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── GRID ── */}
        <View style={styles.grid}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <GlassCard style={styles.featureCard} gradientColors={GRADIENTS.cardNeutral} elevation="medium">
                {/* Top row: icon + badge */}
                <View style={styles.cardTop}>
                  <LinearGradient colors={item.gradient as unknown as string[]} style={styles.featureIcon}>
                    <Ionicons name={item.icon} size={20} color="#fff" />
                  </LinearGradient>
                  {item.badge && (
                    <View style={[styles.badge, { backgroundColor: `${item.gradient[1]}15` }]}>
                      <Text style={[styles.badgeText, { color: item.gradient[0] }]}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.description}</Text>
                {/* Bottom arrow */}
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward-outline" size={16} color={COLORS.text.faint} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.text.faint} />
            <Text style={styles.emptyText}>No results for "{search}"</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 52) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.base },
  scroll: { padding: 20, paddingTop: 16 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  // Search
  searchCard: { marginBottom: 24, paddingVertical: 0 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 15,
  },

  // Category
  catScroll: { marginBottom: 24 },
  catBtnWrap: { marginRight: 12 },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  catBtnInactive: {
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    backgroundColor: COLORS.bg.surface,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  catLabelActive: { color: '#fff' },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: { width: CARD_WIDTH },
  featureCard: {
    minHeight: 150,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  featureTitle: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  cardArrow: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: COLORS.text.muted,
    fontSize: 15,
  },
});
