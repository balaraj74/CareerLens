import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import gemini, { extractJSON } from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

export default function ProjectGenerator() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [stack, setStack] = useState<'frontend' | 'backend' | 'mobile'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<{
    title: string;
    description: string;
    architecture: string;
    steps: string[];
  } | null>(null);

  const generateProject = async () => {
    setIsLoading(true);
    setProject(null);
    try {
      const prompt = `
        You are an expert software architect. Design a mock project proposal for a software engineering portfolio.
        Difficulty Level: "${difficulty}"
        Development Stack Focus: "${stack}"

        Return exactly a structured raw JSON string with these keys:
        {
          "title": "Project Name",
          "description": "Short explanation of what the app does.",
          "architecture": "Describe the architecture (e.g. Model-View-ViewModel with local cache, server endpoints, db schemas)",
          "steps": [
            "Step 1: Set up repository and build configuration",
            "Step 2: Design core layout systems",
            "Step 3: Implement services and API wrappers",
            "Step 4: Integrate AI capabilities and verify flows"
          ]
        }
      `;
      const data = extractJSON(await gemini.generateContent(prompt)) as { title: string; description: string; architecture: string; steps: string[] };
      setProject(data);
    } catch (e) {
      console.error(e);
      // Fallback data structure if JSON parsing fails
      setProject({
        title: 'Glassmorphic Budget Tracker',
        description: 'A mobile-first offline-ready budget dashboard featuring local database caching, beautiful animated SVG progress bars, and automated transaction scanning notifications.',
        architecture: 'Expo SDK, React Native, SQLite for local caching, custom Reanimated panels, and NativeWind styling.',
        steps: [
          'Scaffold database schemas and initialize AsyncStore wrappers.',
          'Build reusable Glassmorphism panel cards and animated progress circles.',
          'Connect transaction log feeds and implement automated local calculations.',
          'Verify FPS performance and package using EAS Android builds.'
        ]
      });
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.title}>Project Generator</Text>
          <Text style={styles.subtitle}>AI project proposals tailored to fill your resume gaps</Text>
        </View>

        {/* CONTROLS */}
        <Text style={styles.sectionHeader}>Choose Project Specifications</Text>
        <GlassCard style={styles.controlCard}>
          <Text style={styles.controlLabel}>Difficulty Level</Text>
          <View style={styles.btnRow}>
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.optionBtn,
                  difficulty === lvl && styles.optionBtnSelected,
                ]}
                onPress={() => setDifficulty(lvl as any)}
              >
                <Text style={[styles.optionText, difficulty === lvl && styles.optionTextSelected]}>
                  {lvl.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.controlLabel, { marginTop: 16 }]}>Stack Type</Text>
          <View style={styles.btnRow}>
            {['frontend', 'backend', 'mobile'].map((stk) => (
              <TouchableOpacity
                key={stk}
                style={[
                  styles.optionBtn,
                  stack === stk && styles.optionBtnSelected,
                ]}
                onPress={() => setStack(stk as any)}
              >
                <Text style={[styles.optionText, stack === stk && styles.optionTextSelected]}>
                  {stk.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.generateBtn} onPress={generateProject} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.bg.base} />
            ) : (
              <Text style={styles.generateBtnText}>Generate Custom Project</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* GENERATED CONTENT */}
        {project && (
          <View style={styles.projectContainer}>
            <GlassCard style={styles.projectCard} gradientColors={['rgba(0, 255, 198, 0.12)', 'rgba(0, 255, 198, 0.02)']}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectDesc}>{project.description}</Text>
            </GlassCard>

            <Text style={styles.sectionHeader}>System Architecture</Text>
            <GlassCard style={styles.archCard}>
              <View style={styles.archHeader}>
                <Ionicons name="git-network-outline" size={18} color={COLORS.primary[500]} />
                <Text style={styles.archTitle}>Tech Blueprint</Text>
              </View>
              <Text style={styles.archText}>{project.architecture}</Text>
            </GlassCard>

            <Text style={styles.sectionHeader}>Implementation Steps</Text>
            <View style={styles.stepsList}>
              {project.steps.map((step, idx) => (
                <View key={idx} style={styles.stepNode}>
                  <View style={styles.stepIndicator}>
                    <Text style={styles.stepNum}>{idx + 1}</Text>
                  </View>
                  <GlassCard style={styles.stepCard}>
                    <Text style={styles.stepText}>{step}</Text>
                  </GlassCard>
                </View>
              ))}
            </View>
          </View>
        )}

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
  controlCard: {
    marginBottom: 24,
  },
  controlLabel: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: 'System',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    backgroundColor: COLORS.secondary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnSelected: {
    borderColor: COLORS.secondary[500],
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  optionText: {
    color: COLORS.text.muted,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'System',
  },
  optionTextSelected: {
    color: COLORS.secondary[500],
  },
  generateBtn: {
    backgroundColor: COLORS.secondary[500],
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  generateBtnText: {
    color: COLORS.bg.base,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'System',
  },
  projectContainer: {
    gap: 16,
  },
  projectCard: {
    padding: 2,
  },
  projectTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'System',
  },
  projectDesc: {
    color: COLORS.text.primary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    fontFamily: 'System',
  },
  archCard: {
    padding: 2,
  },
  archHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  archTitle: {
    color: COLORS.primary[500],
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    fontFamily: 'System',
  },
  archText: {
    color: COLORS.text.primary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'System',
  },
  stepsList: {
    gap: 10,
  },
  stepNode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.emerald[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNum: {
    color: COLORS.bg.base,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'System',
  },
  stepCard: {
    flex: 1,
    padding: 12,
  },
  stepText: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontFamily: 'System',
  },
});
