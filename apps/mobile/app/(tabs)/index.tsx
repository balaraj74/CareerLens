import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import useAuthStore from '../../src/store/useAuthStore';
import { COLORS, GRADIENTS, SPACING, RADIUS, TYPOGRAPHY } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

// ─── Horizontal Metric ───────────────────────────────────────────────────────────
function HorizontalMetric({ percentage, label, color }: { percentage: number; label: string; color: string }) {
  return (
    <View style={metricStyles.wrap}>
      <View style={metricStyles.header}>
        <Text style={metricStyles.label}>{label}</Text>
        <Text style={metricStyles.pct}>{percentage}%</Text>
      </View>
      <View style={metricStyles.track}>
        <View style={[metricStyles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  pct: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  track: { height: 8, backgroundColor: COLORS.secondary[200], borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

// ─── Home Screen ───────────────────────────────────────────────────────────────
export default function HomeDashboard() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const name = profile?.name || 'Balaraj R';
  const title = profile?.targetRole || 'Software Engineer';
  const readiness = profile?.careerScore ?? 79;
  const skillScore = 85;
  const resumeScore = 88;
  const interviewScore = 92;

  const heatmapWeeks = Array.from({ length: 26 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const i = w * 7 + d;
      return {
        v: Math.floor(Math.max(0, Math.sin(i / 10) * 2 + Math.cos(i / 5) * 2 + 1)),
      };
    })
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={GRADIENTS.screenLight as any} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 1. MODERN GREETING SECTION */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.journeyBadge}>
              <Ionicons name="rocket" size={12} color={COLORS.primary[500]} />
              <Text style={styles.journeyText}>{title} Journey • Level 12</Text>
            </View>
          </View>
          <View style={styles.avatarWrap}>
            <Image 
              source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Balaraj' }} 
              style={styles.avatar} 
            />
            <View style={styles.avatarBadge} />
          </View>
        </View>

        {/* 2. HERO CAREER DASHBOARD */}
        <GlassCard style={styles.heroCard} elevation="high">
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Career Readiness</Text>
              <Text style={styles.heroScore}>{readiness}%</Text>
            </View>
            <View style={styles.demandBadge}>
              <Text style={styles.demandText}>High Demand</Text>
              <Ionicons name="trending-up" size={14} color={COLORS.emerald[500]} />
            </View>
          </View>
          <View style={styles.heroGrid}>
            <View style={styles.heroStat}>
              <Text style={styles.statLabel}>Top Skill</Text>
              <Text style={styles.statValue}>React Native</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.statLabel}>Next Goal</Text>
              <Text style={styles.statValue}>System Design</Text>
            </View>
          </View>
        </GlassCard>

        {/* 3. TODAY's ACTION */}
        <View style={styles.sectionHeaderNoTop}>
          <Text style={styles.sectionTitle}>Today's Action</Text>
        </View>
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="code-slash" size={20} color={COLORS.primary[500]} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Complete SQL Practice</Text>
            <Text style={styles.actionSub}>Data Engineering Track • 20 mins</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.faint} />
        </TouchableOpacity>

        {/* 4. DYNAMIC AI COPILOT */}
        <GlassCard style={styles.aiCard} elevation="medium" accent="primary">
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
            </View>
            <Text style={styles.aiTitle}>AI Career Copilot</Text>
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiStatus}>Good Progress 🚀</Text>
            <Text style={styles.aiImpact}>+8% Market Readiness potential</Text>
            
            <View style={styles.aiRecBox}>
              <Text style={styles.aiRecLabel}>Recommended focus:</Text>
              <Text style={styles.aiRecValue}>React Native Skia</Text>
            </View>
            
            <View style={styles.aiRecBox}>
              <Text style={styles.aiRecLabel}>Next Milestone:</Text>
              <Text style={styles.aiRecValue}>Build Animation Project</Text>
            </View>
            
            <TouchableOpacity style={styles.aiBtn}>
              <Text style={styles.aiBtnText}>Start Now</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitleSpaced}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          {[
            { icon: 'trending-up', label: 'Career Updates', color: COLORS.secondary[500], route: '/features/career-updates' },
            { icon: 'document-text', label: 'Resume ATS', color: COLORS.primary[500], route: '/features/resume' },
            { icon: 'mic', label: 'Mock Interview', color: COLORS.amber[500], route: '/features/interview' },
            { icon: 'analytics', label: 'Skill Gap', color: COLORS.emerald[500], route: '/features/skillgap' },
            { icon: 'people-circle', label: 'Community', color: COLORS.rose[500], route: '/features/community' },
            { icon: 'newspaper', label: 'News', color: COLORS.primary[400], route: '/features/news' },
          ].map((action, i) => (
            <TouchableOpacity key={i} style={styles.chip} onPress={() => router.push(action.route as any)}>
              <Ionicons name={action.icon as any} size={16} color={action.color} />
              <Text style={styles.chipText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        {/* 6. BETTER CAREER METRICS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Metrics</Text>
          <TouchableOpacity><Text style={styles.linkText}>Details</Text></TouchableOpacity>
        </View>
        <GlassCard style={styles.metricsCard} elevation="low">
          <HorizontalMetric percentage={readiness} label="Career Readiness" color={COLORS.primary[500]} />
          <HorizontalMetric percentage={skillScore} label="Skill Gap" color={COLORS.secondary[500]} />
          <HorizontalMetric percentage={resumeScore} label="Resume" color={COLORS.emerald[500]} />
          <HorizontalMetric percentage={interviewScore} label="Interview" color={COLORS.amber[500]} />
        </GlassCard>

        {/* 7. AI INSIGHT TIMELINE */}
        <Text style={styles.sectionTitleSpaced}>Career Timeline</Text>
        <GlassCard style={styles.timelineCard} elevation="low">
          {[
            { time: 'Today', task: 'Complete SQL Practice', active: true },
            { time: 'Tomorrow', task: 'Interview Session', active: false },
            { time: 'Next Week', task: 'Resume Review', active: false },
            { time: 'This Month', task: 'ML Certification', active: false },
          ].map((item, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineNodeWrap}>
                <View style={[styles.timelineNode, item.active && styles.timelineNodeActive]} />
                {i < 3 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTime, item.active && { color: COLORS.primary[500], fontWeight: '700' }]}>{item.time}</Text>
                <Text style={styles.timelineTask}>{item.task}</Text>
              </View>
            </View>
          ))}
        </GlassCard>

        {/* 8. UPGRADED HEATMAP */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learning Streak</Text>
        </View>
        <GlassCard style={styles.heatCard} elevation="low">
          <View style={styles.heatStatsRow}>
            <View>
              <Text style={styles.heatStatValue}>148</Text>
              <Text style={styles.heatStatLabel}>Contributions</Text>
            </View>
            <View>
              <Text style={styles.heatStatValue}>12</Text>
              <Text style={styles.heatStatLabel}>Day Streak</Text>
            </View>
            <View>
              <Text style={styles.heatStatValue}>March</Text>
              <Text style={styles.heatStatLabel}>Top Month</Text>
            </View>
          </View>
          
          <View style={styles.heatWrapper}>
            <View style={styles.heatYLabels}>
              <Text style={styles.heatLabel}>Mon</Text>
              <Text style={styles.heatLabel}>Wed</Text>
              <Text style={styles.heatLabel}>Fri</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heatScroll}>
              <View>
                <View style={styles.heatMonthsRow}>
                  <Text style={styles.heatMonthLabel}>Jan</Text>
                  <Text style={styles.heatMonthLabel}>Feb</Text>
                  <Text style={styles.heatMonthLabel}>Mar</Text>
                  <Text style={styles.heatMonthLabel}>Apr</Text>
                  <Text style={styles.heatMonthLabel}>May</Text>
                  <Text style={styles.heatMonthLabel}>Jun</Text>
                </View>
                <View style={styles.heatGrid}>
                  {heatmapWeeks.map((week, wIdx) => (
                    <View key={wIdx} style={styles.heatCol}>
                      {week.map((day, dIdx) => {
                        let bg = '#ebedf0'; // 0
                        if (day.v === 1) bg = '#9be9a8';
                        else if (day.v === 2) bg = '#40c463';
                        else if (day.v === 3) bg = '#30a14e';
                        else if (day.v >= 4) bg = '#216e39';
                        return <View key={dIdx} style={[styles.heatCell, { backgroundColor: bg }]} />;
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </GlassCard>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.base },
  scroll: { padding: 20, paddingTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 24 },
  sectionHeaderNoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, letterSpacing: -0.3 },
  sectionTitleSpaced: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, letterSpacing: -0.3, marginTop: 24, marginBottom: 12 },
  linkText: { fontSize: 13, color: COLORS.primary[500], fontWeight: '700' },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTextWrap: { flex: 1 },
  greeting: { fontSize: 14, color: COLORS.text.secondary, fontWeight: '600', marginBottom: 4 },
  name: { fontSize: 28, fontWeight: '800', color: COLORS.text.primary, letterSpacing: -0.5, marginBottom: 8 },
  journeyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary.subtle, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', gap: 6 },
  journeyText: { fontSize: 12, fontWeight: '700', color: COLORS.primary[500] },
  avatarWrap: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.secondary[200] },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.emerald[500], borderWidth: 2, borderColor: '#FFF' },

  // Hero Card
  heroCard: { marginBottom: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.secondary[200], marginBottom: 16 },
  heroLabel: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '600', marginBottom: 4 },
  heroScore: { fontSize: 36, fontWeight: '800', color: COLORS.text.primary, letterSpacing: -1 },
  demandBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.emerald.subtle, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  demandText: { fontSize: 12, fontWeight: '700', color: COLORS.emerald[500] },
  heroGrid: { flexDirection: 'row', gap: 16 },
  heroStat: { flex: 1 },
  statLabel: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },

  // Action Card
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.secondary[200], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  actionIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primary.subtle, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 2 },
  actionSub: { fontSize: 12, color: COLORS.text.secondary },

  // AI Card
  aiCard: { marginTop: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  aiIconBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.primary[500], alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },
  aiContent: {},
  aiStatus: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 },
  aiImpact: { fontSize: 14, color: COLORS.emerald[500], fontWeight: '600', marginBottom: 16 },
  aiRecBox: { backgroundColor: COLORS.secondary[200], padding: 12, borderRadius: 8, marginBottom: 8 },
  aiRecLabel: { fontSize: 12, color: COLORS.text.secondary, fontWeight: '600', marginBottom: 2 },
  aiRecValue: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  aiBtn: { backgroundColor: COLORS.primary[500], paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  aiBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Quick Actions
  quickActionsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.secondary[200], marginRight: 10, gap: 6 },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },

  // Timeline
  timelineCard: { paddingVertical: 20 },
  timelineRow: { flexDirection: 'row', marginBottom: 0 },
  timelineNodeWrap: { width: 24, alignItems: 'center' },
  timelineNode: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.secondary[300], marginTop: 4 },
  timelineNodeActive: { backgroundColor: COLORS.primary[500], borderWidth: 2, borderColor: COLORS.primary.subtle },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.secondary[200], marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 24, paddingLeft: 12 },
  timelineTime: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600', marginBottom: 4 },
  timelineTask: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },

  // Metrics
  metricsCard: { paddingBottom: 4 },

  // Heatmap
  heatCard: { marginBottom: 28 },
  heatStatsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.secondary[200], marginBottom: 16 },
  heatStatValue: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  heatStatLabel: { fontSize: 11, color: COLORS.text.secondary, fontWeight: '600', marginTop: 2 },
  heatWrapper: { flexDirection: 'row' },
  heatYLabels: { justifyContent: 'space-between', paddingTop: 20, paddingBottom: 6, marginRight: 6 },
  heatLabel: { fontSize: 10, color: COLORS.text.muted },
  heatScroll: { flexDirection: 'column', paddingRight: 16 },
  heatMonthsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, width: 26 * 15 - 3 },
  heatMonthLabel: { fontSize: 10, color: COLORS.text.muted },
  heatGrid: { flexDirection: 'row', gap: 3 },
  heatCol: { flexDirection: 'column', gap: 3 },
  heatCell: { width: 12, height: 12, borderRadius: 2 },
});
