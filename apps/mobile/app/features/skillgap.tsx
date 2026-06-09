import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import GlassCard from '../../src/components/GlassCard';
import useAuthStore from '../../src/store/useAuthStore';
import { api, SkillGapAnalysisResult } from '../../src/services/api';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

type TabType = 'overview' | 'actions' | 'skills' | 'learn' | 'insights' | 'market';

export default function SkillGapAnalyzer() {
  const router = useRouter();
  const { profile } = useAuthStore();
  
  const [targetRole, setTargetRole] = useState(profile?.targetRole || '');
  const [industry, setIndustry] = useState('Technology');
  const [skillInput, setSkillInput] = useState('');
  const [currentSkills, setCurrentSkills] = useState<string[]>(profile?.currentSkills || []);
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleAddSkill = () => {
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setCurrentSkills([...currentSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setCurrentSkills(currentSkills.filter(s => s !== skill));
  };

  const handleAnalyze = async () => {
    if (!targetRole || currentSkills.length === 0) return;
    setLoading(true);
    const result = await api.analyzeSkillGap(targetRole, currentSkills, industry);
    if (result) {
      setAnalysis(result);
      setActiveTab('overview');
    }
    setLoading(false);
  };

  // Radar Chart Calculations
  const size = 240;
  const center = size / 2;
  const radius = 90;

  const getCoordinates = (values: number[]) => {
    const coords: string[] = [];
    values.forEach((v, index) => {
      const angle = (Math.PI * 2 / values.length) * index - Math.PI / 2;
      const r = (v / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      coords.push(`${x},${y}`);
    });
    return coords.join(' ');
  };

  const renderRadarAxes = () => {
    if (!analysis?.radarData || analysis.radarData.length === 0) return null;
    return analysis.radarData.map((s, index) => {
      const angle = (Math.PI * 2 / analysis.radarData.length) * index - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const labelX = center + (radius + 25) * Math.cos(angle);
      const labelY = center + (radius + 12) * Math.sin(angle);

      // Truncate category name if too long
      const labelText = s.category.length > 14 ? s.category.substring(0, 12) + '..' : s.category;

      return (
        <React.Fragment key={s.category}>
          <Line x1={center} y1={center} x2={x} y2={y} stroke={COLORS.text.faint} strokeWidth={1} />
          <SvgText x={labelX} y={labelY} fill={COLORS.text.muted} fontSize="10" fontWeight="bold" textAnchor="middle">
            {labelText}
          </SvgText>
        </React.Fragment>
      );
    });
  };

  const currentCoords = analysis?.radarData ? getCoordinates(analysis.radarData.map(s => s.currentScore)) : '';
  const targetCoords = analysis?.radarData ? getCoordinates(analysis.radarData.map(s => s.targetScore)) : '';

  const renderTabs = () => (
    <View style={{ marginBottom: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
        {(['overview', 'actions', 'skills', 'learn', 'insights', 'market'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={GRADIENTS.screenLight as any} style={StyleSheet.absoluteFill} />

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.secondary[500]} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Skill Gap Analyzer</Text>
              <Text style={styles.subtitle}>AI-Powered analysis with BigQuery market data</Text>
            </View>
          </View>

          {/* INPUT FORM */}
          {!analysis && !loading && (
            <GlassCard style={styles.inputCard}>
              <Text style={styles.sectionHeader}>Define Target Role</Text>
              <TextInput
                style={styles.input}
                placeholder="Target Role (e.g., Full Stack Developer)"
                placeholderTextColor={COLORS.text.muted}
                value={targetRole}
                onChangeText={setTargetRole}
              />
              <TextInput
                style={styles.input}
                placeholder="Industry (e.g., Technology)"
                placeholderTextColor={COLORS.text.muted}
                value={industry}
                onChangeText={setIndustry}
              />

              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Your Skills</Text>
              <View style={styles.skillInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Add a skill"
                  placeholderTextColor={COLORS.text.muted}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onSubmitEditing={handleAddSkill}
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleAddSkill}>
                  <Ionicons name="add" size={20} color={COLORS.bg.base} />
                </TouchableOpacity>
              </View>

              {currentSkills.length > 0 && (
                <View style={styles.skillsWrap}>
                  {currentSkills.map(skill => (
                    <TouchableOpacity key={skill} onPress={() => handleRemoveSkill(skill)} style={styles.skillBadge}>
                      <Text style={styles.skillBadgeText}>{skill}</Text>
                      <Ionicons name="close" size={14} color={COLORS.text.muted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={[styles.analyzeBtn, (!targetRole || currentSkills.length === 0) && { opacity: 0.5 }]} 
                onPress={handleAnalyze}
                disabled={!targetRole || currentSkills.length === 0}
              >
                <Ionicons name="analytics" size={20} color={COLORS.bg.base} />
                <Text style={styles.analyzeBtnText}>Analyze with AI</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary[500]} />
              <Text style={styles.loadingText}>Gemini AI is analyzing market data...</Text>
            </View>
          )}

          {analysis && !loading && (
            <>
              {renderTabs()}

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  <GlassCard style={styles.overviewCard}>
                    <Text style={styles.matchScore}>{analysis.matchPercentage}%</Text>
                    <Text style={styles.matchScoreLabel}>Match Score</Text>
                    
                    <View style={styles.readinessContainer}>
                      <Ionicons name="trophy" size={16} color={COLORS.primary[500]} />
                      <Text style={styles.readinessText}>Readiness: {analysis.careerInsights.readinessLevel.replace('-', ' ')}</Text>
                    </View>
                    
                    {analysis.radarData && analysis.radarData.length > 0 && (
                      <View style={styles.chartContainer}>
                        <Svg width={size} height={size}>
                          <Circle cx={center} cy={center} r={radius * 0.4} stroke={COLORS.secondary[200]} fill="none" strokeWidth={1} />
                          <Circle cx={center} cy={center} r={radius * 0.7} stroke={COLORS.secondary[200]} fill="none" strokeWidth={1} />
                          <Circle cx={center} cy={center} r={radius} stroke={COLORS.secondary[200]} fill="none" strokeWidth={1} />
                          {renderRadarAxes()}
                          <Polygon points={targetCoords} fill="rgba(165, 124, 255, 0.15)" stroke={COLORS.primary[500]} strokeWidth={1.5} />
                          <Polygon points={currentCoords} fill="rgba(0, 229, 255, 0.2)" stroke={COLORS.secondary[500]} strokeWidth={2} />
                        </Svg>
                        <View style={styles.legendRow}>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.secondary[500] }]} />
                            <Text style={styles.legendText}>Current</Text>
                          </View>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.primary[500] }]} />
                            <Text style={styles.legendText}>Target Role</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </GlassCard>

                  <TouchableOpacity style={styles.reanalyzeBtn} onPress={() => setAnalysis(null)}>
                    <Text style={styles.reanalyzeBtnText}>New Analysis</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ACTIONS TAB */}
              {activeTab === 'actions' && (
                <View style={styles.tabContent}>
                  {analysis.recommendations.map((rec, idx) => (
                    <GlassCard key={idx} style={styles.listItemCard}>
                      <View style={styles.rowBetween}>
                        <View style={[styles.priorityBadge, rec.priority === 'immediate' ? { backgroundColor: COLORS.rose[500] } : { backgroundColor: COLORS.secondary[500] }]}>
                          <Text style={styles.priorityText}>{rec.priority}</Text>
                        </View>
                        <Text style={styles.impactText}>{rec.impact} impact</Text>
                      </View>
                      <Text style={styles.itemTitle}>{rec.action}</Text>
                      <Text style={styles.itemDesc}>{rec.rationale}</Text>
                    </GlassCard>
                  ))}
                </View>
              )}

              {/* SKILLS TAB */}
              {activeTab === 'skills' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.sectionHeader, { color: COLORS.emerald[500] }]}>Matched Skills</Text>
                  {analysis.skillBreakdown.matchedSkills.map((s, i) => (
                    <GlassCard key={i} style={styles.listItemCard}>
                      <Text style={styles.itemTitle}>{s.skill}</Text>
                      <Text style={styles.itemDesc}>Proficiency: {s.proficiencyLevel} • Demand: {s.marketDemand}</Text>
                    </GlassCard>
                  ))}

                  <Text style={[styles.sectionHeader, { color: COLORS.rose[500], marginTop: 16 }]}>Missing Critical Skills</Text>
                  {analysis.skillBreakdown.missingCriticalSkills.map((s, i) => (
                    <GlassCard key={i} style={styles.listItemCard}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.itemTitle}>{s.skill}</Text>
                        <Text style={[styles.impactText, { color: COLORS.rose[500] }]}>{s.importance}</Text>
                      </View>
                      <Text style={styles.itemDesc}>Time to learn: {s.timeToLearn}</Text>
                    </GlassCard>
                  ))}
                  
                  {analysis.skillBreakdown.emergingSkills.length > 0 && (
                    <>
                      <Text style={[styles.sectionHeader, { color: COLORS.primary[500], marginTop: 16 }]}>Trending & Emerging</Text>
                      <View style={styles.skillsWrap}>
                        {analysis.skillBreakdown.emergingSkills.map((s, i) => (
                          <View key={i} style={[styles.skillBadge, { borderColor: COLORS.primary[500], borderWidth: 1 }]}>
                            <Text style={[styles.skillBadgeText, { color: COLORS.primary[500] }]}>{s.skill} ({s.trendScore}/10)</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* LEARN TAB */}
              {activeTab === 'learn' && (
                <View style={styles.tabContent}>
                  {analysis.learningPath.map((phase, i) => (
                    <GlassCard key={i} style={styles.listItemCard}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.itemTitle}>{phase.phase}</Text>
                        <Text style={styles.impactText}>{phase.duration}</Text>
                      </View>
                      <View style={[styles.skillsWrap, { marginTop: 8 }]}>
                        {phase.skills.map((s, idx) => (
                          <View key={idx} style={styles.skillBadge}>
                            <Text style={styles.skillBadgeText}>{s}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={{ marginTop: 12 }}>
                        {phase.resources.map((res, idx) => (
                          <Text key={idx} style={styles.itemDesc}>• {res}</Text>
                        ))}
                      </View>
                    </GlassCard>
                  ))}
                </View>
              )}

              {/* INSIGHTS TAB */}
              {activeTab === 'insights' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.sectionHeader, { color: COLORS.emerald[500] }]}>Strengths</Text>
                  <GlassCard style={styles.listItemCard}>
                    {analysis.careerInsights.strengthAreas.map((s, i) => (
                      <Text key={i} style={styles.itemDesc}>• {s}</Text>
                    ))}
                  </GlassCard>

                  <Text style={[styles.sectionHeader, { color: COLORS.amber[500], marginTop: 16 }]}>Areas to Improve</Text>
                  <GlassCard style={styles.listItemCard}>
                    {analysis.careerInsights.weaknessAreas.map((s, i) => (
                      <Text key={i} style={styles.itemDesc}>• {s}</Text>
                    ))}
                  </GlassCard>

                  {analysis.careerInsights.competitiveAdvantages.length > 0 && (
                    <>
                      <Text style={[styles.sectionHeader, { color: COLORS.primary[500], marginTop: 16 }]}>Competitive Advantages</Text>
                      <View style={styles.skillsWrap}>
                        {analysis.careerInsights.competitiveAdvantages.map((s, i) => (
                          <View key={i} style={[styles.skillBadge, { backgroundColor: 'rgba(165, 124, 255, 0.1)' }]}>
                            <Text style={[styles.skillBadgeText, { color: COLORS.primary[400] }]}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* MARKET TAB */}
              {activeTab === 'market' && (
                <View style={styles.tabContent}>
                  <View style={styles.gridContainer}>
                    <GlassCard style={styles.gridCard}>
                      <Ionicons name="bar-chart" size={24} color={COLORS.primary[500]} />
                      <Text style={styles.gridLabel}>Demand Level</Text>
                      <Text style={styles.gridValue}>{analysis.marketContext.demandLevel.replace('-', ' ')}</Text>
                    </GlassCard>
                    <GlassCard style={styles.gridCard}>
                      <Ionicons name="people" size={24} color={COLORS.rose[500]} />
                      <Text style={styles.gridLabel}>Competition</Text>
                      <Text style={styles.gridValue}>{analysis.marketContext.competitionLevel.replace('-', ' ')}</Text>
                    </GlassCard>
                    <GlassCard style={styles.gridCard}>
                      <Ionicons name="cash" size={24} color={COLORS.emerald[500]} />
                      <Text style={styles.gridLabel}>Salary Outlook</Text>
                      <Text style={styles.gridValue}>{analysis.marketContext.salaryOutlook}</Text>
                    </GlassCard>
                    <GlassCard style={styles.gridCard}>
                      <Ionicons name="briefcase" size={24} color={COLORS.secondary[500]} />
                      <Text style={styles.gridLabel}>Job Openings</Text>
                      <Text style={styles.gridValue}>{analysis.marketContext.jobOpenings}</Text>
                    </GlassCard>
                  </View>
                </View>
              )}
            </>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg.base },
  scrollContainer: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { marginRight: 16 },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text.primary, fontFamily: 'System' },
  subtitle: { fontSize: 13, color: COLORS.primary[500], marginTop: 2, fontWeight: '500' },
  
  // Input
  inputCard: { padding: 20 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, marginBottom: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, color: COLORS.text.primary, marginBottom: 12, borderWidth: 1, borderColor: COLORS.secondary.border },
  skillInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addBtn: { backgroundColor: COLORS.primary[500], width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  skillBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, gap: 6 },
  skillBadgeText: { color: COLORS.text.primary, fontSize: 12, fontWeight: '600' },
  analyzeBtn: { backgroundColor: COLORS.text.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 24, gap: 8 },
  analyzeBtnText: { color: COLORS.bg.base, fontSize: 16, fontWeight: 'bold' },
  
  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  loadingText: { color: COLORS.text.muted, marginTop: 16 },
  
  // Tabs
  tabsContainer: { gap: 12, paddingBottom: 8 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.secondary.border },
  tabButtonActive: { backgroundColor: COLORS.primary[500], borderColor: COLORS.primary[500] },
  tabText: { color: COLORS.text.muted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: COLORS.bg.base, fontWeight: 'bold' },
  
  // Tab Content
  tabContent: { marginTop: 8 },
  overviewCard: { padding: 24, alignItems: 'center' },
  matchScore: { fontSize: 64, fontWeight: '900', color: COLORS.primary[500] },
  matchScoreLabel: { fontSize: 16, color: COLORS.text.muted, fontWeight: '600', marginBottom: 16 },
  readinessContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(165, 124, 255, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8, marginBottom: 24 },
  readinessText: { color: COLORS.primary[400], fontWeight: 'bold', textTransform: 'capitalize' },
  reanalyzeBtn: { marginTop: 16, alignSelf: 'center' },
  reanalyzeBtnText: { color: COLORS.secondary[500], fontWeight: 'bold' },

  // List Items
  listItemCard: { padding: 16, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priorityText: { color: COLORS.bg.base, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  impactText: { color: COLORS.text.muted, fontSize: 12, fontWeight: '600' },
  itemTitle: { color: COLORS.text.primary, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  itemDesc: { color: COLORS.text.muted, fontSize: 13, lineHeight: 20 },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: (width - 52) / 2, padding: 16, gap: 8 },
  gridLabel: { color: COLORS.text.muted, fontSize: 12, fontWeight: '600' },
  gridValue: { color: COLORS.text.primary, fontSize: 15, fontWeight: 'bold', textTransform: 'capitalize' },

  // Chart
  chartContainer: { alignItems: 'center', marginTop: 16 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: COLORS.text.muted, fontSize: 11, fontWeight: '600' },
});
