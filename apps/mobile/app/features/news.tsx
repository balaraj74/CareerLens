import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCard from '../../src/components/GlassCard';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

const NEWS_API_KEY = '314dac5d12f04fc9886bdaf5cd427e83';
const BOOKMARKS_KEY = 'careerlens_mobile_bookmarked_news';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

const CATEGORIES = ['All', 'Technology', 'AI', 'Career', 'Business', 'Science'];

const CATEGORY_QUERIES: Record<string, string> = {
  All: 'technology career jobs india',
  Technology: 'software technology programming developers',
  AI: 'artificial intelligence machine learning ChatGPT',
  Career: 'career jobs hiring employment india',
  Business: 'startup business entrepreneurship india',
  Science: 'science research innovation education',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const published = new Date(dateStr).getTime();
  const diff = Math.floor((now - published) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

async function fetchNewsArticles(
  tab: 'indian' | 'global',
  category: string
): Promise<NewsArticle[]> {
  const q: string = CATEGORY_QUERIES[category] ?? CATEGORY_QUERIES['All'] ?? 'technology career india';


  // Use top-headlines for Indian, everything for global
  let url: string;
  if (tab === 'indian') {
    url = `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(q)}&country=in&category=technology&pageSize=20&apiKey=${NEWS_API_KEY}`;
  } else {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=20&language=en&apiKey=${NEWS_API_KEY}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`News API error: ${response.status}`);

  const data = await response.json();
  if (data.status !== 'ok') throw new Error(data.message || 'News API failed');

  return (data.articles || [])
    .filter((a: any) => a.title && a.title !== '[Removed]')
    .slice(0, 15)
    .map((a: any, i: number) => ({
      id: `${tab}_${i}_${Date.now()}`,
      title: a.title,
      description: a.description || 'Tap to read full article',
      url: a.url,
      source: a.source?.name || 'Unknown',
      publishedAt: a.publishedAt || new Date().toISOString(),
      category,
    }));
}

export default function CareerNews() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'indian' | 'global'>('indian');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved bookmarks
  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY).then((raw) => {
      if (raw) {
        try { setBookmarkedIds(new Set(JSON.parse(raw))); } catch {}
      }
    });
  }, []);

  const loadNews = useCallback(async (tab: 'indian' | 'global', category: string) => {
    setLoading(true);
    try {
      const articles = await fetchNewsArticles(tab, category);
      setArticles(articles);
    } catch (err) {
      console.error('[News] fetch error:', err);
      // Fallback mock on network error
      setArticles([
        {
          id: 'mock1', title: 'AI Boom Drives Record Tech Hiring Across India',
          description: 'Companies across Bangalore, Hyderabad, and Pune are ramping up AI/ML engineering roles as the generative AI wave accelerates product development.',
          url: 'https://techcrunch.com', source: 'TechCrunch', publishedAt: new Date().toISOString(), category: 'AI'
        },
        {
          id: 'mock2', title: 'India Emerges as Global Startup Hub in 2026',
          description: 'With over 100,000 startups, India ranks 3rd globally in startup density. Government policies and deep tech funding fuel growth.',
          url: 'https://economictimes.com', source: 'Economic Times', publishedAt: new Date().toISOString(), category: 'Business'
        },
        {
          id: 'mock3', title: 'React Native 1.0 Released with New Architecture',
          description: 'Meta ships React Native 1.0 with the Fabric renderer and JSI bridge as defaults, dramatically improving performance on mobile devices.',
          url: 'https://reactnative.dev', source: 'React Native Blog', publishedAt: new Date().toISOString(), category: 'Technology'
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNews(activeTab, selectedCategory);
  }, [activeTab, selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews(activeTab, selectedCategory);
  };

  const toggleBookmark = async (article: NewsArticle) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(article.id)) {
        next.delete(article.id);
      } else {
        next.add(article.id);
      }
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      searchQuery === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={GRADIENTS.screenLight as any} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary[500]} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary[500]} />
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Career News</Text>
              <Text style={styles.subtitle}>Live headlines · AI & Tech · Jobs</Text>
            </View>
            <LinearGradient colors={GRADIENTS.brand} style={styles.headerBadge}>
              <Ionicons name="newspaper" size={20} color="#fff" />
            </LinearGradient>
          </View>
        </View>

        {/* TAB: Indian / Global */}
        <View style={styles.tabRow}>
          {(['indian', 'global'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => { setActiveTab(tab); setArticles([]); }}
            >
              <Ionicons
                name={tab === 'indian' ? 'flag' : 'globe'}
                size={14}
                color={activeTab === tab ? COLORS.secondary[500] : COLORS.text.muted}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'indian' ? '🇮🇳 Indian' : '🌍 Global'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={COLORS.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news..."
            placeholderTextColor={COLORS.text.faint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.text.faint} />
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORY CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, isSelected && styles.categoryBtnSelected]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryBtnText, isSelected && styles.categoryBtnTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ARTICLES */}
        <View style={styles.articlesHeader}>
          <Text style={styles.sectionHeader}>
            {activeTab === 'indian' ? '🇮🇳 Indian Headlines' : '🌍 Global Headlines'}
          </Text>
          {!loading && (
            <Text style={styles.articleCount}>{filteredArticles.length} articles</Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary[500]} />
            <Text style={styles.loadingText}>Fetching live news...</Text>
          </View>
        ) : (
          <View style={styles.newsContainer}>
            {filteredArticles.map((art) => {
              const isExpanded = expandedId === art.id;
              const isBookmarked = bookmarkedIds.has(art.id);
              return (
                <GlassCard key={art.id} style={styles.newsCard}>
                  {/* Card top row */}
                  <View style={styles.cardHeader}>
                    <View style={styles.sourcePill}>
                      <Text style={styles.newsSource}>{art.source}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <Text style={styles.newsTime}>{timeAgo(art.publishedAt)}</Text>
                      <TouchableOpacity onPress={() => toggleBookmark(art)} style={styles.bookmarkBtn}>
                        <Ionicons
                          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                          size={18}
                          color={isBookmarked ? COLORS.secondary[500] : COLORS.text.muted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={styles.newsTitle} numberOfLines={isExpanded ? undefined : 3}>
                    {art.title}
                  </Text>

                  {/* Expand / collapse */}
                  <TouchableOpacity
                    style={styles.summaryToggleBtn}
                    onPress={() => setExpandedId(isExpanded ? null : art.id)}
                  >
                    <Ionicons
                      name={isExpanded ? 'chevron-up-circle' : 'sparkles'}
                      size={14}
                      color={COLORS.emerald[500]}
                    />
                    <Text style={styles.summaryToggleText}>
                      {isExpanded ? 'Hide Summary' : 'Read Summary'}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryText}>{art.description}</Text>
                      <TouchableOpacity
                        style={styles.readMoreBtn}
                        onPress={() => Linking.openURL(art.url)}
                      >
                        <Ionicons name="open-outline" size={14} color={COLORS.primary[500]} />
                        <Text style={styles.readMoreText}>Full Article ↗</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </GlassCard>
              );
            })}

            {filteredArticles.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="newspaper-outline" size={48} color={COLORS.text.faint} />
                <Text style={styles.emptyText}>No articles found</Text>
                <Text style={styles.emptySubtext}>Try a different category or search term</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg.base },
  scrollContainer: { padding: 20, paddingTop: 40 },

  header: { marginBottom: 20 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text.primary },
  subtitle: { fontSize: 13, color: COLORS.primary[500], marginTop: 4, fontWeight: '500' },
  headerBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.bg.surface, borderWidth: 1, borderColor: COLORS.glass.border,
  },
  tabBtnActive: { borderColor: COLORS.secondary[500], backgroundColor: 'rgba(0,229,255,0.08)' },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.text.muted },
  tabTextActive: { color: COLORS.secondary[500] },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.glass.border,
    paddingHorizontal: 12, height: 46, marginBottom: 14, gap: 8,
  },
  searchInput: { flex: 1, color: COLORS.text.primary, fontSize: 14 },

  categoryScroll: { marginBottom: 20 },
  categoryBtn: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glass.border,
    backgroundColor: COLORS.bg.surface, marginRight: 8,
  },
  categoryBtnSelected: { borderColor: COLORS.secondary[500], backgroundColor: 'rgba(0,229,255,0.1)' },
  categoryBtnText: { color: COLORS.text.muted, fontSize: 12, fontWeight: '600' },
  categoryBtnTextSelected: { color: COLORS.secondary[500] },

  articlesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeader: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  articleCount: { fontSize: 12, color: COLORS.text.muted },

  loadingContainer: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { color: COLORS.text.muted, fontSize: 14 },

  newsContainer: { gap: 12 },
  newsCard: { padding: 4 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sourcePill: {
    backgroundColor: 'rgba(0,229,255,0.08)', paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)',
  },
  newsSource: { color: COLORS.secondary[500], fontSize: 10, fontWeight: '700' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  newsTime: { color: COLORS.text.faint, fontSize: 10 },
  bookmarkBtn: { padding: 2 },

  newsTitle: { color: COLORS.text.primary, fontSize: 14, fontWeight: '800', lineHeight: 20 },

  summaryToggleBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  summaryToggleText: { color: COLORS.emerald[500], fontSize: 11, fontWeight: '700' },

  summaryBox: {
    backgroundColor: 'rgba(0,255,198,0.05)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(0,255,198,0.12)', padding: 12, marginTop: 10,
  },
  summaryText: { color: COLORS.text.primary, fontSize: 12, lineHeight: 18 },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  readMoreText: { color: COLORS.primary[500], fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: COLORS.text.muted, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: COLORS.text.faint, fontSize: 13 },
});
