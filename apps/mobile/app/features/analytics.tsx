import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import GlassCard from '../../src/components/GlassCard';
import gemini from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function GrowthAnalytics() {
  const router = useRouter();
  const [aiPrediction, setAiPrediction] = useState('Analyzing learning patterns...');
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const prompt = `Based on a user's 12-day learning streak and 4h/day study pattern, generate a 1-sentence career trajectory forecast.`;
        const response = await gemini.generateContent(prompt);
        setAiPrediction(response);
      } catch (e) {
        setAiPrediction('Based on your 12-day streak and consistent 4h/day mobile study slots, your readiness index is projected to reach 90% in 18 days.');
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  // Weekly study hours data
  const studyHours = [12, 18, 15, 24, 22, 28, 32];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const maxVal = Math.max(...studyHours);
  const chartHeight = 120;
  const chartWidth = width - 72;
  const barWidth = 22;
  const gap = (chartWidth - barWidth * studyHours.length) / (studyHours.length - 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={GRADIENTS.screenLight as any}
          style={StyleSheet.absoluteFill}
        />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary[500]} />
          </TouchableOpacity>
          <Text style={styles.title}>Growth Analytics</Text>
          <Text style={styles.subtitle}>Track your performance trends and learning streaks</Text>
        </View>

        {/* REPORT CARD */}
        <GlassCard style={styles.reportCard} gradientColors={GRADIENTS.cardNeutral as any}>
          <View style={styles.reportRow}>
            <View style={styles.reportMetric}>
              <Text style={styles.metricVal}>32h</Text>
              <Text style={styles.metricLabel}>Study Time (Wk)</Text>
            </View>
            <View style={styles.reportDivider} />
            <View style={styles.reportMetric}>
              <Text style={[styles.metricVal, { color: COLORS.emerald[500] }]}>+14%</Text>
              <Text style={styles.metricLabel}>vs Last Week</Text>
            </View>
            <View style={styles.reportDivider} />
            <View style={styles.reportMetric}>
              <Text style={[styles.metricVal, { color: COLORS.secondary[500] }]}>88%</Text>
              <Text style={styles.metricLabel}>Target Match</Text>
            </View>
          </View>
        </GlassCard>

        {/* STUDY HOURS SVG BAR CHART */}
        <Text style={styles.sectionHeader}>Study Hours (Daily)</Text>
        <GlassCard style={styles.chartCard}>
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight + 20}>
              {/* Baseline Grid Line */}
              <Line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke={COLORS.secondary[200]}
                strokeWidth={1}
              />
              
              {studyHours.map((val, idx) => {
                const barHeight = (val / maxVal) * (chartHeight - 20);
                const x = idx * (barWidth + gap);
                const y = chartHeight - barHeight;

                return (
                  <React.Fragment key={idx}>
                    {/* Bar */}
                    <Rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={4}
                      fill={idx === studyHours.length - 1 ? COLORS.emerald[500] : COLORS.primary[500]}
                    />
                    {/* Value text above bar */}
                    <SvgText
                      x={x + barWidth / 2}
                      y={y - 6}
                      fill={COLORS.text.muted}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {val}h
                    </SvgText>
                    {/* Label below axis */}
                    <SvgText
                      x={x + barWidth / 2}
                      y={chartHeight + 14}
                      fill={COLORS.text.muted}
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {days[idx]}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </GlassCard>

        {/* AI PREDICTION MODEL */}
        <Text style={styles.sectionHeader}>AI Career Projections</Text>
        <GlassCard style={styles.predictionCard} gradientColors={GRADIENTS.cardNeutral as any}>
          <View style={styles.predictHeader}>
            <Ionicons name="trending-up" size={18} color={COLORS.secondary[500]} />
            <Text style={styles.predictTitle}>Trajectory Forecast</Text>
          </View>
          {isAiLoading ? (
            <ActivityIndicator size="small" color={COLORS.secondary[500]} style={{ marginVertical: 10 }} />
          ) : (
            <Text style={styles.predictText}>"{aiPrediction}"</Text>
          )}
        </GlassCard>

        {/* MONTHLY REVIEW WIDGET */}
        <Text style={styles.sectionHeader}>Monthly Summary Reports</Text>
        <GlassCard style={styles.reportDownloadCard}>
          <View style={styles.downloadRow}>
            <View>
              <Text style={styles.downloadTitle}>June 2026 Analytics Report</Text>
              <Text style={styles.downloadSub}>PDF • 1.2 MB • Generated today</Text>
            </View>
            <TouchableOpacity style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={18} color={COLORS.bg.base} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg.base,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.primary[500],
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'System',
  },
  reportCard: {
    marginBottom: 24,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reportMetric: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'System',
  },
  metricLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'System',
  },
  reportDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.secondary[200],
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    marginTop: 16,
    fontFamily: 'System',
  },
  chartCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  chartContainer: {
    alignItems: 'center',
  },
  predictionCard: {
    marginBottom: 24,
  },
  predictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictTitle: {
    color: COLORS.secondary[500],
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
    fontFamily: 'System',
  },
  predictText: {
    color: COLORS.text.primary,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  reportDownloadCard: {
    marginBottom: 20,
  },
  downloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadTitle: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'System',
  },
  downloadSub: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'System',
  },
  downloadBtn: {
    backgroundColor: COLORS.emerald[500],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
