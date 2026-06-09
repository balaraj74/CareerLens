import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import GlassCard from '../../src/components/GlassCard';
import gemini from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

// ── Types ──────────────────────────────────────────────────────────────────────
interface SummaryItem {
  title: string;
  summary: string;
}

interface CareerSummary {
  trendingSkills: SummaryItem[];
  certifications: SummaryItem[];
  opportunities: SummaryItem[];
  aiInsights: SummaryItem[];
}

type TabType = 'skills' | 'certs' | 'jobs' | 'ai';

const TABS: Array<{ key: TabType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = [
  { key: 'skills', label: 'Trending Skills', icon: 'trending-up', color: COLORS.primary[500] },
  { key: 'certs', label: 'Certifications', icon: 'ribbon', color: COLORS.secondary[500] },
  { key: 'jobs', label: 'Opportunities', icon: 'briefcase', color: COLORS.emerald[500] },
  { key: 'ai', label: 'AI Insights', icon: 'sparkles', color: COLORS.amber[500] },
];

// ── Fallback data ──────────────────────────────────────────────────────────────
const FALLBACK_SUMMARY: CareerSummary = {
  trendingSkills: [
    { title: 'Generative AI & LLMs', summary: 'Demand for GenAI engineers grew 340% in 2025. Companies need experts in prompt engineering, RAG, and fine-tuning.' },
    { title: 'Rust Systems Programming', summary: 'Major companies including Google and Microsoft are mandating Rust for safety-critical codebases. Salaries 35% above C++.' },
    { title: 'DevOps & Platform Engineering', summary: 'Platform engineering roles surpassed traditional DevOps. Kubernetes + Terraform + ArgoCD are must-haves.' },
    { title: 'TypeScript & React Native', summary: 'Mobile/web convergence makes TS+RN the go-to stack. Companies value engineers who can ship on both platforms.' },
  ],
  certifications: [
    { title: 'AWS Solutions Architect Professional', summary: 'Most sought-after cloud cert in 2026. Average 28% salary hike post-certification in India.' },
    { title: 'Google Professional ML Engineer', summary: 'Hands-on ML certification covering TensorFlow, Vertex AI, and MLOps pipelines. High demand in Bangalore/Hyderabad.' },
    { title: 'CKAD – Certified Kubernetes App Developer', summary: 'Container orchestration is essential. CKAD holders earn ₹35–60 LPA in top product companies.' },
    { title: 'Meta Certified Developer', summary: 'Free certification from Meta covering React, React Native, and full-stack JavaScript development.' },
  ],
  opportunities: [
    { title: 'AI Engineer – Bangalore Tech Corridor', summary: '1,200+ AI/ML openings at Google, Microsoft, Flipkart, and startups. Median CTC: ₹42 LPA.' },
    { title: 'Full Stack Remote Roles – Tier 2 Cities', summary: 'Post-pandemic remote culture has opened 8,000+ remote roles to Mysore, Coimbatore, Jaipur developers.' },
    { title: 'Govt AI Mission Hiring', summary: 'IndiaAI Mission is hiring 500+ data scientists and AI engineers for public sector digital transformation.' },
    { title: 'Freelance Opportunity – GenAI Consulting', summary: 'Enterprises pay ₹5,000–₹25,000/hour for GenAI strategy consultants. High growth for independent consultants.' },
  ],
  aiInsights: [
    { title: 'The 10× Developer Myth is Real Now', summary: 'AI coding tools have made the 10x productivity gap real. Engineers using Cursor+Claude are shipping 3× faster than those who aren\'t.' },
    { title: 'India to Lead Global AI Talent by 2027', summary: 'IDC predicts India will produce 40% of the world\'s AI engineers by 2027, driven by IIT/NIT curriculum overhaul and bootcamp culture.' },
    { title: 'Open Source Contributions = New Resume', summary: 'Hiring managers at top firms rank GitHub contributions equally with degrees. 3+ merged PRs in popular repos is now a differentiator.' },
    { title: 'Micro-credentials Over Degrees', summary: 'Google\'s Career Certificates program alone placed 150,000 people in 2025. Skill-first hiring is mainstream in tech.' },
  ],
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function CareerUpdates() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const [summary, setSummary] = useState<CareerSummary | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isFirestoreData, setIsFirestoreData] = useState(false);

  useEffect(() => {
    // Try Firestore first
    const q = query(
      collection(db, 'careerUpdates'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const firstDoc = snapshot.docs[0];
          const data = firstDoc?.data() ?? {};

          if (data.summary) {
            const mapped: CareerSummary = {
              trendingSkills: (data.summary.trendingSkills || []).map((s: any) => ({
                title: s.skill || s.title || 'Trending Skill',
                summary: s.evidence?.[0] || s.summary || `${s.changePct ?? ''}% growth`,
              })),
              certifications: (data.summary.certifications || []).map((c: any) => ({
                title: c.certification || c.title || 'Certification',
                summary: c.insight || c.summary || '',
              })),
              opportunities: (data.summary.opportunities || []).map((o: any) => ({
                title: o.title || 'Opportunity',
                summary: o.description || o.summary || '',
              })),
              aiInsights: (data.summary.aiInsights || []).map((i: any) => ({
                title: i.title || 'AI Insight',
                summary: i.content || i.summary || '',
              })),
            };
            setSummary(mapped);
            setIsFirestoreData(true);
            const ts = data.timestamp?.toDate?.()?.toLocaleString?.() || null;
            setLastUpdate(ts);
          } else {
            useFallback();
          }
        } else {
          useFallback();
        }
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error('[CareerUpdates] Firestore error:', err);
        useFallback();
      }
    );

    return () => unsubscribe();
  }, []);

  const useFallback = () => {
    setSummary(FALLBACK_SUMMARY);
    setIsFirestoreData(false);
    setLastUpdate(new Date().toLocaleString());
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Firestore listener auto-updates; just generate fresh AI if no Firestore
    if (!isFirestoreData) {
      generateFreshAI();
    }
  };

  const generateFreshAI = async () => {
    try {
      const prompt = `
You are a career intelligence analyst for Indian developers. Generate an up-to-date career market summary.

Return ONLY valid JSON:
{
  "trendingSkills": [
    { "title": "Skill Name", "summary": "1-2 sentence market context and why it's trending" }
  ],
  "certifications": [
    { "title": "Cert Name", "summary": "Value and salary impact" }
  ],
  "opportunities": [
    { "title": "Opportunity Title", "summary": "Role count, location, salary" }
  ],
  "aiInsights": [
    { "title": "Insight Title", "summary": "Key career observation or trend" }
  ]
}

Generate 4 items per category. Focus on India's tech market in 2026.
`;
      const data = await gemini.generateJSON<CareerSummary>(prompt, { temperature: 0.5 });
      setSummary(data);
      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      console.error('[CareerUpdates] AI generation error:', err);
      setSummary(FALLBACK_SUMMARY);
    } finally {
      setRefreshing(false);
    }
  };

  const activeItems: SummaryItem[] = summary
    ? activeTab === 'skills' ? summary.trendingSkills
    : activeTab === 'certs' ? summary.certifications
    : activeTab === 'jobs' ? summary.opportunities
    : summary.aiInsights
    : [];

  const activeTabConfig = TABS.find(t => t.key === activeTab)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={GRADIENTS.screenLight as any} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.secondary[500]} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary[500]} />
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Career Updates</Text>
              <Text style={styles.subtitle}>Real-time market intelligence</Text>
            </View>
            <LinearGradient colors={GRADIENTS.brand} style={styles.headerBadge}>
              <Ionicons name="trending-up" size={20} color="#fff" />
            </LinearGradient>
          </View>
        </View>

        {/* STATUS CARD */}
        <GlassCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: isFirestoreData ? COLORS.emerald[500] : COLORS.amber[500] }]} />
              <Text style={styles.statusText}>
                {isFirestoreData ? 'Live Intelligence Feed' : 'AI-Generated Insights'}
              </Text>
            </View>
            {lastUpdate && (
              <Text style={styles.lastUpdateText}>Updated: {lastUpdate}</Text>
            )}
          </View>
        </GlassCard>

        {/* TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, active && { borderColor: tab.color, backgroundColor: `${tab.color}15` }]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons name={tab.icon} size={14} color={active ? tab.color : COLORS.text.muted} />
                <Text style={[styles.tabChipText, active && { color: tab.color }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CONTENT */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary[500]} />
            <Text style={styles.loadingText}>Loading career intelligence...</Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            <Text style={styles.sectionHeader}>
              {activeTabConfig.label} ({activeItems.length})
            </Text>

            {activeItems.map((item, i) => (
              <GlassCard key={i} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <View style={[styles.itemIconBg, { backgroundColor: `${activeTabConfig.color}15` }]}>
                    <Ionicons name={activeTabConfig.icon} size={16} color={activeTabConfig.color} />
                  </View>
                  <View style={[styles.indexBadge, { backgroundColor: `${activeTabConfig.color}20` }]}>
                    <Text style={[styles.indexText, { color: activeTabConfig.color }]}>#{i + 1}</Text>
                  </View>
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSummary}>{item.summary}</Text>
              </GlassCard>
            ))}
          </View>
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

  statusCard: { marginBottom: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
  lastUpdateText: { fontSize: 10, color: COLORS.text.faint },

  tabsScroll: { marginBottom: 20 },
  tabChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glass.border,
    backgroundColor: COLORS.bg.surface, marginRight: 10,
  },
  tabChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },

  loadingContainer: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { color: COLORS.text.muted, fontSize: 14 },

  sectionHeader: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary, marginBottom: 12 },
  itemsList: { gap: 12 },

  itemCard: {},
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemIconBg: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  indexBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  indexText: { fontSize: 11, fontWeight: '800' },
  itemTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary, marginBottom: 6 },
  itemSummary: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 19 },
});
