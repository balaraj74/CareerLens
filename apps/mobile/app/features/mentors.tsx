import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import gemini, { extractJSON } from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  domain: string;
  linkedin: string;
  skills: string[];
}

export default function MentorDiscovery() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

  const mockMentors: Mentor[] = [
    {
      id: '1',
      name: 'Aditi Sharma',
      role: 'Staff Mobile Engineer',
      company: 'Google',
      location: 'Bengaluru, India',
      domain: 'Mobile Dev',
      linkedin: 'https://linkedin.com',
      skills: ['React Native', 'Swift', 'Kotlin', 'EAS Build'],
    },
    {
      id: '2',
      name: 'Rohan Verma',
      role: 'Principal Architect',
      company: 'Stripe',
      location: 'San Francisco, CA',
      domain: 'Architecture',
      linkedin: 'https://linkedin.com',
      skills: ['Microservices', 'GraphQL', 'System Design'],
    },
    {
      id: '3',
      name: 'Vikram Sen',
      role: 'Lead ML Researcher',
      company: 'OpenAI',
      location: 'Seattle, WA',
      domain: 'AI / ML',
      linkedin: 'https://linkedin.com',
      skills: ['PyTorch', 'LLMs', 'Vertex AI', 'Prompt Eng'],
    },
  ];

  const domains = ['All', 'Mobile Dev', 'Architecture', 'AI / ML'];

  const [mentors, setMentors] = useState<Mentor[]>(mockMentors);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const prompt = `
        Find 3 real-world tech leaders or mentors who match the criteria: 
        Domain: "${selectedDomain}", Search Query: "${searchQuery}".
        Return ONLY valid JSON in this format:
        [
          {
            "id": "unique-id",
            "name": "Name",
            "role": "Current Role",
            "company": "Company Name",
            "location": "City, Country",
            "domain": "Domain Name",
            "linkedin": "https://linkedin.com/in/profile",
            "skills": ["Skill1", "Skill2"]
          }
        ]
      `;
      const results = extractJSON(await gemini.generateContent(prompt));

      if (Array.isArray(results) && results.length > 0) {
        setMentors(results);
      } else {
        setMentors(mockMentors);
      }
    } catch (e) {
      console.error(e);
      setMentors(mockMentors);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only search automatically on domain change or debounce. Let's do it on domain change, but if user types we should wait for a button or debounce.
    // For simplicity, fetch immediately when domain changes, but only if empty search.
    const delayDebounceFn = setTimeout(() => {
      fetchMentors();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedDomain]);

  const filteredMentors = mentors; // No local filtering, trust the AI

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
          <Text style={styles.title}>Mentor Discovery</Text>
          <Text style={styles.subtitle}>Connect with top industry leads on LinkedIn</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={COLORS.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, skills..."
            placeholderTextColor={COLORS.text.faint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* DOMAIN HORIZONTAL FILTER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.domainScroll}>
          {domains.map((d) => {
            const isSelected = selectedDomain === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.domainBtn, isSelected && styles.domainBtnSelected]}
                onPress={() => setSelectedDomain(d)}
              >
                <Text style={[styles.domainBtnText, isSelected && styles.domainBtnTextSelected]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* MENTORS LIST */}
        <Text style={styles.sectionHeader}>Verified Mentors ({filteredMentors.length})</Text>
        <View style={styles.mentorsContainer}>
          {filteredMentors.map((mentor) => (
            <GlassCard key={mentor.id} style={styles.mentorCard}>
              <View style={styles.mentorTopRow}>
                <View style={styles.avatarMock}>
                  <Ionicons name="person" size={24} color={COLORS.text.faint} />
                </View>
                <View style={styles.mentorInfo}>
                  <Text style={styles.mentorName}>{mentor.name}</Text>
                  <Text style={styles.mentorRole}>{mentor.role} @ {mentor.company}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color={COLORS.text.muted} />
                    <Text style={styles.mentorLocation}>{mentor.location}</Text>
                  </View>
                </View>
              </View>

              {/* Skills chips inside cards */}
              <View style={styles.skillsRow}>
                {mentor.skills.map((skill) => (
                  <View key={skill} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => Linking.openURL(mentor.linkedin)}
              >
                <Ionicons name="logo-linkedin" size={16} color={COLORS.bg.base} />
                <Text style={styles.connectText}>Connect on LinkedIn</Text>
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
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 13,
    fontFamily: 'System',
  },
  domainScroll: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  domainBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    backgroundColor: COLORS.secondary[200],
    marginRight: 8,
  },
  domainBtnSelected: {
    borderColor: COLORS.secondary[500],
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  domainBtnText: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  domainBtnTextSelected: {
    color: COLORS.secondary[500],
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    fontFamily: 'System',
  },
  mentorsContainer: {
    gap: 12,
  },
  mentorCard: {
    padding: 2,
  },
  mentorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMock: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  mentorName: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
  },
  mentorRole: {
    color: COLORS.primary[500],
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'System',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mentorLocation: {
    color: COLORS.text.muted,
    fontSize: 10,
    marginLeft: 4,
    fontFamily: 'System',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 12,
  },
  skillChip: {
    backgroundColor: COLORS.secondary[200],
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  skillText: {
    color: COLORS.text.muted,
    fontSize: 10,
    fontFamily: 'System',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary[500],
    borderRadius: 12,
    height: 38,
    gap: 6,
  },
  connectText: {
    color: COLORS.bg.base,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
  },
});
