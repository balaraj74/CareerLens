import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import gemini, { extractJSON } from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

interface Certification {
  id: string;
  name: string;
  provider: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  cost: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  bookmark?: boolean;
}

export default function CertificationHub() {
  const router = useRouter();
  const mockCerts: Certification[] = [
    {
      id: 'cert1',
      name: 'Google Cloud Associate Cloud Engineer',
      provider: 'Google Cloud',
      difficulty: 'Intermediate',
      cost: '$125',
      status: 'In Progress',
      bookmark: true,
    },
    {
      id: 'cert2',
      name: 'AWS Solutions Architect Associate',
      provider: 'Amazon Web Services',
      difficulty: 'Intermediate',
      cost: '$150',
      status: 'Not Started',
    },
    {
      id: 'cert3',
      name: 'Meta Front-End Developer Professional Certificate',
      provider: 'Meta',
      difficulty: 'Beginner',
      cost: 'Subscription',
      status: 'Completed',
    },
  ];

  const [certs, setCerts] = useState<Certification[]>(mockCerts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCerts = async () => {
      setIsLoading(true);
      try {
        const prompt = `
          Recommend 3 professional certifications for a software engineer.
          Return ONLY valid JSON in this format:
          [
            {
              "id": "unique-id",
              "name": "Cert Name",
              "provider": "Provider Name",
              "difficulty": "Intermediate", // Must be Beginner, Intermediate, or Expert
              "cost": "$100",
              "status": "Not Started", // Must be Not Started
              "bookmark": false
            }
          ]
        `;
        const results = extractJSON(await gemini.generateContent(prompt));

        if (Array.isArray(results) && results.length > 0) {
          setCerts(results);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const toggleBookmark = (id: string) => {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, bookmark: !c.bookmark } : c));
  };

  const toggleStatus = (id: string) => {
    setCerts(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'Not Started' ? 'In Progress' : c.status === 'In Progress' ? 'Completed' : 'Not Started';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

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
          <Text style={styles.title}>Certification Hub</Text>
          <Text style={styles.subtitle}>Track and plan your cloud & engineering credentials</Text>
        </View>

        {/* ACTIVE CREDENTIALS PROGRESS */}
        <Text style={styles.sectionHeader}>In Progress</Text>
        <View style={styles.inProgressContainer}>
          {certs.filter(c => c.status === 'In Progress').map((cert) => (
            <GlassCard key={cert.id} style={styles.certProgressCard} gradientColors={GRADIENTS.cardNeutral as any}>
              <View style={styles.certProgressHeader}>
                <View>
                  <Text style={styles.certProgressTitle}>{cert.name}</Text>
                  <Text style={styles.certProgressSub}>{cert.provider}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleBookmark(cert.id)}>
                  <Ionicons name="bookmark" size={18} color={COLORS.secondary[500]} />
                </TouchableOpacity>
              </View>

              {/* Progress visualizer */}
              <View style={styles.progBarRow}>
                <Text style={styles.progBarLabel}>Estimated Study: 45% complete</Text>
              </View>
              <View style={styles.progBarBg}>
                <View style={[styles.progBarFill, { width: '45%' }]} />
              </View>

              <TouchableOpacity style={styles.statusCycleBtn} onPress={() => toggleStatus(cert.id)}>
                <Text style={styles.statusCycleBtnText}>Update Readiness Status</Text>
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>

        {/* COMPREHENSIVE CERTIFICATIONS CATALOG */}
        <Text style={styles.sectionHeader}>Available Credentials</Text>
        <View style={styles.listContainer}>
          {certs.map((cert) => (
            <GlassCard key={cert.id} style={styles.certCard}>
              <View style={styles.certTopRow}>
                <View style={styles.certTitleCol}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certProvider}>{cert.provider} • {cert.cost}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleBookmark(cert.id)}>
                  <Ionicons
                    name={cert.bookmark ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={COLORS.secondary[500]}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{cert.difficulty}</Text>
                </View>
                <TouchableOpacity style={styles.statusBadge} onPress={() => toggleStatus(cert.id)}>
                  <Text style={[styles.statusText, { color: cert.status === 'Completed' ? COLORS.emerald[500] : cert.status === 'In Progress' ? COLORS.primary[500] : COLORS.text.muted }]}>
                    {cert.status}
                  </Text>
                </TouchableOpacity>
              </View>
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    marginTop: 16,
    fontFamily: 'System',
  },
  inProgressContainer: {
    marginBottom: 16,
  },
  certProgressCard: {
    padding: 2,
  },
  certProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  certProgressTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'System',
  },
  certProgressSub: {
    color: COLORS.primary[500],
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'System',
  },
  progBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progBarLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    fontFamily: 'System',
  },
  progBarBg: {
    height: 4,
    backgroundColor: COLORS.secondary[200],
    borderRadius: 2,
    marginBottom: 14,
  },
  progBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
    borderRadius: 2,
  },
  statusCycleBtn: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.secondary[500],
    borderRadius: 10,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCycleBtnText: {
    color: COLORS.secondary[500],
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'System',
  },
  listContainer: {
    gap: 10,
  },
  certCard: {
    padding: 2,
  },
  certTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  certTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  certName: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'System',
  },
  certProvider: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'System',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
  },
  difficultyBadge: {
    backgroundColor: COLORS.secondary[200],
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  difficultyText: {
    color: COLORS.text.muted,
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  statusBadge: {
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'System',
  },
});
