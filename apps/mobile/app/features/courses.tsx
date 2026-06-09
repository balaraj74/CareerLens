import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import gemini, { extractJSON } from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

interface Course {
  id: string;
  title: string;
  provider: 'NPTEL' | 'Coursera' | 'AWS Educate' | 'Google Cloud' | 'YouTube';
  rating: string;
  duration: string;
  link: string;
  bookmarked?: boolean;
}

export default function CourseDiscovery() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('React Native');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'nptel-1',
      title: 'Introduction to Mobile Application Development',
      provider: 'NPTEL',
      rating: '4.8',
      duration: '8 Weeks',
      link: 'https://nptel.ac.in',
    },
    {
      id: 'coursera-1',
      title: 'React Native Multiplatform Mobile App Development',
      provider: 'Coursera',
      rating: '4.7',
      duration: '4 Weeks',
      link: 'https://coursera.org',
    },
    {
      id: 'aws-1',
      title: 'AWS Cloud Practitioner Essentials',
      provider: 'AWS Educate',
      rating: '4.9',
      duration: '6 Hours',
      link: 'https://aws.amazon.com/education',
    },
    {
      id: 'google-1',
      title: 'Google Cloud Computing Foundations',
      provider: 'Google Cloud',
      rating: '4.8',
      duration: '15 Hours',
      link: 'https://cloud.google.com/training',
    },
    {
      id: 'yt-1',
      title: 'React Native Reanimated & Skia Masterclass',
      provider: 'YouTube',
      rating: '4.9',
      duration: '2 Hours',
      link: 'https://youtube.com',
    },
  ]);

  const providers = ['All', 'NPTEL', 'Coursera', 'AWS Educate', 'Google Cloud', 'YouTube'];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const prompt = `
        You are a learning path curator. Generate 4 recommended online courses for the topic: "${searchQuery}".
        Return ONLY valid JSON in this format:
        [
          {
            "id": "unique-id",
            "title": "Course Title",
            "provider": "NPTEL", // MUST be one of: "NPTEL", "Coursera", "AWS Educate", "Google Cloud", "YouTube"
            "rating": "4.8",
            "duration": "8 Weeks",
            "link": "https://example.com"
          }
        ]
      `;
      
      const results = extractJSON(await gemini.generateContent(prompt));

      if (Array.isArray(results) && results.length > 0) {
        setCourses(results);
      } else {
        throw new Error('Invalid format');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Search Failed', 'Could not fetch dynamic courses. Using mock results.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (id: string) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, bookmarked: !c.bookmarked } : c))
    );
  };

  const filteredCourses = courses.filter((c) => {
    const matchesProvider = selectedProvider === 'All' || c.provider === selectedProvider;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

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
          <Text style={styles.title}>Course Discovery</Text>
          <Text style={styles.subtitle}>Curated learning catalog across top platforms</Text>
        </View>

        {/* SEARCH BOX */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses (e.g., Cloud, PyTorch)..."
            placeholderTextColor={COLORS.text.faint}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.bg.base} />
            ) : (
              <Ionicons name="search" size={20} color={COLORS.bg.base} />
            )}
          </TouchableOpacity>
        </View>

        {/* PROVIDER SELECTOR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {providers.map((p) => {
            const isSelected = selectedProvider === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.filterBtn, isSelected && styles.filterBtnSelected]}
                onPress={() => setSelectedProvider(p)}
              >
                <Text style={[styles.filterBtnText, isSelected && styles.filterBtnTextSelected]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* COURSES LIST */}
        <Text style={styles.sectionHeader}>Matching Courses ({filteredCourses.length})</Text>
        <View style={styles.coursesGrid}>
          {filteredCourses.map((course) => (
            <GlassCard key={course.id} style={styles.courseCard}>
              <View style={styles.cardHeader}>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerBadgeText}>{course.provider}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleBookmark(course.id)}>
                  <Ionicons
                    name={course.bookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={COLORS.secondary[500]}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.courseTitle}>{course.title}</Text>

              <View style={styles.metadataRow}>
                <View style={styles.metaCol}>
                  <Ionicons name="star" size={12} color={COLORS.amber[500]} />
                  <Text style={styles.metaText}>{course.rating}</Text>
                </View>
                <View style={[styles.metaCol, { marginLeft: 16 }]}>
                  <Ionicons name="hourglass-outline" size={12} color={COLORS.text.muted} />
                  <Text style={styles.metaText}>{course.duration}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.learnBtn} onPress={() => Linking.openURL(course.link)}>
                <Text style={styles.learnBtnText}>Open Platform</Text>
                <Ionicons name="open-outline" size={14} color={COLORS.bg.base} />
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>

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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[200],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    paddingLeft: 12,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 13,
    fontFamily: 'System',
  },
  searchBtn: {
    backgroundColor: COLORS.secondary[500],
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    backgroundColor: COLORS.secondary[200],
    marginRight: 8,
  },
  filterBtnSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: 'rgba(165, 124, 255, 0.1)',
  },
  filterBtnText: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  filterBtnTextSelected: {
    color: COLORS.primary[500],
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    fontFamily: 'System',
  },
  coursesGrid: {
    gap: 12,
  },
  courseCard: {
    padding: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerBadge: {
    backgroundColor: 'rgba(165, 124, 255, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  providerBadgeText: {
    color: COLORS.primary[500],
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  courseTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 10,
    fontFamily: 'System',
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginLeft: 4,
    fontFamily: 'System',
  },
  learnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary[500],
    borderRadius: 12,
    height: 38,
    gap: 6,
  },
  learnBtnText: {
    color: COLORS.bg.base,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
  },
});
