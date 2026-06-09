import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import gemini from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

// ── Types ──────────────────────────────────────────────────────────────────────
interface CareerNode {
  id: string;
  label: string;
  type: 'stream' | 'subject' | 'exam' | 'degree' | 'career' | 'skill';
  score?: number;
  summary?: string;
  timeframe?: string;
  actions?: string[];
}

interface CareerEdge {
  from: string;
  to: string;
  label?: string;
}

interface CareerTreeData {
  root: { id: string; label: string };
  nodes: CareerNode[];
  edges: CareerEdge[];
  insights?: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────────
const GRADE_OPTIONS = [
  { value: 'grade8', label: 'Grade 8' },
  { value: 'grade9', label: 'Grade 9' },
  { value: 'grade10', label: 'Grade 10' },
  { value: 'grade11', label: 'Grade 11' },
  { value: 'grade12_science', label: 'Grade 12 – Science' },
  { value: 'grade12_commerce', label: 'Grade 12 – Commerce' },
  { value: 'grade12_arts', label: 'Grade 12 – Arts' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'ug_btech', label: 'BTech (Pursuing)' },
  { value: 'ug_bsc', label: 'BSc (Pursuing)' },
  { value: 'ug_bcom', label: 'BCom (Pursuing)' },
  { value: 'ug_ba', label: 'BA (Pursuing)' },
  { value: 'pg_mtech', label: 'MTech (Pursuing)' },
  { value: 'pg_msc', label: 'MSc (Pursuing)' },
];

const INTEREST_OPTIONS = [
  'Coding', 'AI & ML', 'Medicine', 'Design', 'Business', 'Law',
  'Research', 'Teaching', 'Government Jobs', 'Entrepreneurship',
  'Finance', 'Data Science', 'Cloud Computing', 'Cybersecurity',
];

const NODE_TYPE_COLORS: Record<string, string> = {
  stream: COLORS.primary[500],
  subject: COLORS.secondary[500],
  exam: COLORS.amber[500],
  degree: COLORS.emerald[500],
  career: COLORS.rose[500],
  skill: '#A78BFA',
};

const NODE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  stream: 'git-branch-outline',
  subject: 'book-outline',
  exam: 'trophy-outline',
  degree: 'school-outline',
  career: 'briefcase-outline',
  skill: 'flash-outline',
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function CareerNavigator() {
  const router = useRouter();
  const [currentGrade, setCurrentGrade] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [region, setRegion] = useState('India');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<CareerTreeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // ── Grade Picker State ───────────────────────────────────────────────────────
  const [showGradePicker, setShowGradePicker] = useState(false);

  const handleGenerate = async () => {
    if (!currentGrade) {
      Alert.alert('Select Education Level', 'Please select your current education level first.');
      return;
    }

    setLoading(true);
    setTreeData(null);
    setSelectedNode(null);

    try {
      const prompt = `
You are an expert Indian career counselor. Create a comprehensive career pathway tree for a student.

STUDENT PROFILE:
- Education Level: ${GRADE_OPTIONS.find(g => g.value === currentGrade)?.label || currentGrade}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'General (not specified)'}
- Region: ${region}

TASK:
Generate a detailed career path tree showing educational streams, entrance exams, degrees, and career options.

Return ONLY valid JSON in this exact format:
{
  "root": { "id": "root", "label": "Your Career Journey" },
  "nodes": [
    {
      "id": "node1",
      "label": "Node Name",
      "type": "stream|subject|exam|degree|career|skill",
      "score": 85,
      "summary": "Brief 1-2 sentence explanation",
      "timeframe": "2-3 years",
      "actions": ["Action 1", "Action 2"]
    }
  ],
  "edges": [
    { "from": "root", "to": "node1", "label": "optional edge label" }
  ],
  "insights": ["Key insight 1", "Key insight 2", "Key insight 3"]
}

Generate 12-18 nodes across different career paths based on their interests.
Types: "stream" (educational stream), "exam" (entrance exam), "degree" (college degree), "career" (job role), "skill" (key skill to learn).
Score should be 0-100 representing opportunity/relevance for this student.
`;

      const data = await gemini.generateJSON<CareerTreeData>(prompt, { temperature: 0.3 });

      if (data.nodes && data.nodes.length > 0) {
        setTreeData(data);
      } else {
        throw new Error('Invalid tree data from AI');
      }
    } catch (err) {
      console.error('[Navigator] AI generation error:', err);
      Alert.alert('Error', 'Could not generate career path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = useCallback((interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }, []);

  const filteredNodes = treeData?.nodes.filter((n) =>
    filterType === 'all' || n.type === filterType
  ) ?? [];

  const selectedGradeLabel = GRADE_OPTIONS.find(g => g.value === currentGrade)?.label || 'Select level...';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={GRADIENTS.screenLight as any} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary[500]} />
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Career Navigator</Text>
              <Text style={styles.subtitle}>AI-powered path from school to dream career</Text>
            </View>
            <LinearGradient colors={GRADIENTS.brand} style={styles.headerBadge}>
              <Ionicons name="map" size={20} color="#fff" />
            </LinearGradient>
          </View>
        </View>

        {/* GRADE PICKER */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>
            <Ionicons name="school-outline" size={14} color={COLORS.secondary[500]} />
            {'  '}Current Education Level
          </Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowGradePicker(!showGradePicker)}
          >
            <Text style={[styles.pickerText, !currentGrade && styles.pickerPlaceholder]}>
              {selectedGradeLabel}
            </Text>
            <Ionicons
              name={showGradePicker ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.text.muted}
            />
          </TouchableOpacity>

          {showGradePicker && (
            <View style={styles.dropdownList}>
              {GRADE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.dropdownItem, currentGrade === opt.value && styles.dropdownItemSelected]}
                  onPress={() => { setCurrentGrade(opt.value); setShowGradePicker(false); }}
                >
                  <Text style={[styles.dropdownItemText, currentGrade === opt.value && styles.dropdownItemTextSelected]}>
                    {opt.label}
                  </Text>
                  {currentGrade === opt.value && <Ionicons name="checkmark" size={16} color={COLORS.secondary[500]} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GlassCard>

        {/* INTERESTS */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>
            Your Interests {interests.length > 0 && `(${interests.length} selected)`}
          </Text>
          <View style={styles.pillsRow}>
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[styles.pill, selected && styles.pillSelected]}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* REGION */}
        <GlassCard style={styles.card}>
          <Text style={styles.fieldLabel}>
            <Ionicons name="location-outline" size={14} color={COLORS.emerald[500]} />
            {'  '}Region (optional)
          </Text>
          <TextInput
            style={styles.textInput}
            value={region}
            onChangeText={setRegion}
            placeholder="e.g., Karnataka, Delhi, Mumbai"
            placeholderTextColor={COLORS.text.faint}
          />
        </GlassCard>

        {/* GENERATE BUTTON */}
        <TouchableOpacity
          style={[styles.generateBtn, (!currentGrade || loading) && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!currentGrade || loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={GRADIENTS.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateGradient}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateText}>Generating your career tree...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.generateText}>Generate Career Tree</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* RESULTS */}
        {treeData && (
          <>
            {/* AI Insights */}
            {treeData.insights && treeData.insights.length > 0 && (
              <GlassCard style={styles.insightsCard}>
                <View style={styles.insightsHeader}>
                  <Ionicons name="bulb-outline" size={18} color={COLORS.emerald[500]} />
                  <Text style={styles.insightsTitle}>AI Insights</Text>
                </View>
                {treeData.insights.map((insight, i) => (
                  <View key={i} style={styles.insightRow}>
                    <Text style={styles.insightBullet}>•</Text>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </GlassCard>
            )}

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'stream', 'exam', 'degree', 'career', 'skill'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, filterType === type && styles.filterChipActive]}
                  onPress={() => setFilterType(type)}
                >
                  {type !== 'all' && (
                    <Ionicons
                      name={NODE_TYPE_ICONS[type] || 'ellipse-outline'}
                      size={12}
                      color={filterType === type ? COLORS.secondary[500] : COLORS.text.muted}
                    />
                  )}
                  <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Node Cards */}
            <Text style={styles.sectionHeader}>
              Career Path ({filteredNodes.length} steps)
            </Text>
            <View style={styles.nodesGrid}>
              {filteredNodes.map((node) => {
                const color = NODE_TYPE_COLORS[node.type] || COLORS.text.muted;
                const icon = NODE_TYPE_ICONS[node.type] || 'ellipse-outline';
                const isSelected = selectedNode?.id === node.id;

                return (
                  <TouchableOpacity
                    key={node.id}
                    style={[styles.nodeCard, isSelected && { borderColor: color, borderWidth: 1.5 }]}
                    onPress={() => setSelectedNode(isSelected ? null : node)}
                    activeOpacity={0.85}
                  >
                    <GlassCard style={styles.nodeCardInner}>
                      <View style={styles.nodeCardTop}>
                        <View style={[styles.nodeIcon, { backgroundColor: `${color}20` }]}>
                          <Ionicons name={icon} size={18} color={color} />
                        </View>
                        <View style={[styles.nodeTypeBadge, { backgroundColor: `${color}15` }]}>
                          <Text style={[styles.nodeTypeText, { color }]}>
                            {node.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.nodeLabel}>{node.label}</Text>

                      {node.score !== undefined && (
                        <View style={styles.scoreRow}>
                          <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, { width: `${node.score}%`, backgroundColor: color }]} />
                          </View>
                          <Text style={[styles.scoreText, { color }]}>{node.score}%</Text>
                        </View>
                      )}

                      {node.timeframe && (
                        <View style={styles.timeframeRow}>
                          <Ionicons name="time-outline" size={11} color={COLORS.text.faint} />
                          <Text style={styles.timeframeText}>{node.timeframe}</Text>
                        </View>
                      )}

                      {isSelected && node.summary && (
                        <View style={styles.expandedSection}>
                          <Text style={styles.summaryText}>{node.summary}</Text>
                          {node.actions && node.actions.length > 0 && (
                            <>
                              <Text style={styles.actionsLabel}>Next Steps:</Text>
                              {node.actions.map((action, i) => (
                                <View key={i} style={styles.actionRow}>
                                  <Ionicons name="arrow-forward-circle" size={13} color={color} />
                                  <Text style={styles.actionText}>{action}</Text>
                                </View>
                              ))}
                            </>
                          )}
                        </View>
                      )}
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Empty state before generation */}
        {!treeData && !loading && (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="compass" size={52} color={COLORS.secondary[500]} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Ready to Map Your Future?</Text>
            <Text style={styles.emptySubtitle}>
              Select your education level and interests above, then tap Generate to see your personalized AI-powered career tree.
            </Text>
            <View style={styles.emptyBadges}>
              {['🎯 Smart Scoring', '💼 Career Paths', '📚 Exams & Degrees'].map((b) => (
                <View key={b} style={styles.emptyBadge}>
                  <Text style={styles.emptyBadgeText}>{b}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.base },
  scroll: { padding: 20, paddingTop: 40 },

  header: { marginBottom: 20 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text.primary },
  subtitle: { fontSize: 13, color: COLORS.primary[500], marginTop: 4, fontWeight: '500' },
  headerBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  card: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 10 },

  pickerBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bg.elevated, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, borderWidth: 1, borderColor: COLORS.glass.border,
  },
  pickerText: { fontSize: 14, color: COLORS.text.primary, fontWeight: '600' },
  pickerPlaceholder: { color: COLORS.text.faint },

  dropdownList: {
    marginTop: 8, backgroundColor: COLORS.bg.elevated, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.glass.border, overflow: 'hidden',
  },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
  dropdownItemSelected: { backgroundColor: 'rgba(0,229,255,0.08)' },
  dropdownItemText: { fontSize: 13, color: COLORS.text.primary },
  dropdownItemTextSelected: { color: COLORS.secondary[500], fontWeight: '700' },

  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glass.border,
    backgroundColor: COLORS.bg.surface,
  },
  pillSelected: { borderColor: COLORS.secondary[500], backgroundColor: 'rgba(0,229,255,0.1)' },
  pillText: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600' },
  pillTextSelected: { color: COLORS.secondary[500] },

  textInput: {
    backgroundColor: COLORS.bg.elevated, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, color: COLORS.text.primary, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.glass.border,
  },

  generateBtn: { marginBottom: 24, borderRadius: 30, overflow: 'hidden' },
  generateBtnDisabled: { opacity: 0.5 },
  generateGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, paddingHorizontal: 24,
  },
  generateText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  insightsCard: { marginBottom: 16 },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  insightsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  insightRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  insightBullet: { color: COLORS.emerald[500], fontSize: 14, fontWeight: '700' },
  insightText: { flex: 1, fontSize: 12, color: COLORS.text.secondary, lineHeight: 18 },

  filterScroll: { marginBottom: 14 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glass.border,
    backgroundColor: COLORS.bg.surface, marginRight: 8,
  },
  filterChipActive: { borderColor: COLORS.secondary[500], backgroundColor: 'rgba(0,229,255,0.08)' },
  filterChipText: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.secondary[500] },

  sectionHeader: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary, marginBottom: 12 },

  nodesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  nodeCard: { width: '48%', borderRadius: 16 },
  nodeCardInner: {},
  nodeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nodeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nodeTypeBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  nodeTypeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  nodeLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8, lineHeight: 18 },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  scoreBarBg: { flex: 1, height: 4, backgroundColor: COLORS.bg.elevated, borderRadius: 2, overflow: 'hidden' },
  scoreBarFill: { height: 4, borderRadius: 2 },
  scoreText: { fontSize: 11, fontWeight: '700', minWidth: 32, textAlign: 'right' },

  timeframeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeframeText: { fontSize: 10, color: COLORS.text.faint },

  expandedSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.glass.border },
  summaryText: { fontSize: 11, color: COLORS.text.secondary, lineHeight: 16, marginBottom: 8 },
  actionsLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text.muted, marginBottom: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  actionText: { flex: 1, fontSize: 11, color: COLORS.text.secondary, lineHeight: 16 },

  emptyCard: { alignItems: 'center', padding: 24 },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  emptyBadge: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: COLORS.bg.elevated, borderWidth: 1, borderColor: COLORS.glass.border,
  },
  emptyBadgeText: { fontSize: 12, color: COLORS.text.muted },
});
