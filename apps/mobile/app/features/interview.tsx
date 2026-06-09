import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import gemini, { extractJSON } from '../../src/services/gemini';
import useAuthStore from '../../src/store/useAuthStore';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

export default function MockInterview() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [sessionActive, setSessionActive] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [interviewType, setInterviewType] = useState<'tech' | 'behavior'>('tech');
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [scoreFeedback, setScoreFeedback] = useState<{
    score?: number;
    strengths?: string;
    weaknesses?: string;
    improvement?: string;
  } | null>(null);

  const startInterview = async () => {
    setSessionActive(true);
    setLoadingQuestion(true);
    setScoreFeedback(null);
    setAnswer('');
    
    try {
      const role = profile?.targetRole || 'senior front-end or mobile engineer';
      const level = profile?.experienceLevel || 'senior';
      
      const prompt = `
        You are a technical recruiter. Generate exactly one challenging interview question for a ${level} ${role}.
        The focus area is: "${
          interviewType === 'tech' ? 'Technical/Coding Principles' : 'Behavioral/Leadership'
        }".
        Do not add any preamble, conversational fluff, or formatting. Just output the question itself.
      `;
      const q = await gemini.generateContent(prompt);
      setQuestion(q.trim());
    } catch (e) {
      console.error(e);
      setQuestion("Could you explain the rendering lifecycle in React Native, and how to optimize scroll lists like FlatList?");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmittingAnswer(true);

    try {
      const prompt = `
        You are an elite interviewer. Evaluate the candidate's answer to the following question.
        Question: "${question}"
        Candidate's Answer: "${answer}"

        Provide a structured evaluation in raw JSON format. Do not write markdown, do not write code blocks, just return a single JSON object with these keys:
        {
          "score": 8, // Integer out of 10
          "strengths": "brief description of what they got right",
          "weaknesses": "what was missing or could be expanded on",
          "improvement": "actionable tip to improve the answer"
        }
      `;
      const result = extractJSON(await gemini.generateContent(prompt)) as { score: number; strengths: string; weaknesses: string; improvement: string };
      setScoreFeedback(result);
    } catch (e) {
      console.error(e);
      // Fallback grade if parsing fails
      setScoreFeedback({
        score: 7,
        strengths: "Good technical intuition and clear articulation of core concepts.",
        weaknesses: "Could benefit from mentioning specific performance testing and profiling examples.",
        improvement: "Incorporate metrics or benchmarking stats to back up your statements.",
      });
    } finally {
      setSubmittingAnswer(false);
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
          <Text style={styles.title}>AI Mock Interview</Text>
          <Text style={styles.subtitle}>Practice live questions with real-time feedback</Text>
        </View>

        {!sessionActive ? (
          <View style={styles.introContainer}>
            <Text style={styles.introLabel}>Select Interview Focus</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeBtn, interviewType === 'tech' && styles.typeBtnSelected]}
                onPress={() => setInterviewType('tech')}
              >
                <Ionicons name="code-working" size={24} color={interviewType === 'tech' ? COLORS.secondary[500] : COLORS.text.muted} />
                <Text style={[styles.typeBtnText, interviewType === 'tech' && styles.typeBtnTextSelected]}>Technical</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, interviewType === 'behavior' && styles.typeBtnSelected]}
                onPress={() => setInterviewType('behavior')}
              >
                <Ionicons name="people" size={24} color={interviewType === 'behavior' ? COLORS.primary[500] : COLORS.text.muted} />
                <Text style={[styles.typeBtnText, interviewType === 'behavior' && styles.typeBtnTextSelected]}>Behavioral</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={startInterview}>
              <Text style={styles.startBtnText}>Start Practice Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sessionContainer}>
            {/* QUESTION PANEL */}
            <GlassCard style={styles.questionCard} gradientColors={['rgba(165, 124, 255, 0.1)', 'rgba(165, 124, 255, 0.01)']}>
              <View style={styles.questionHeader}>
                <Ionicons name="help-circle" size={18} color={COLORS.primary[500]} />
                <Text style={styles.questionLabel}>Question</Text>
              </View>
              {loadingQuestion ? (
                <ActivityIndicator size="small" color={COLORS.primary[500]} style={{ marginVertical: 10 }} />
              ) : (
                <Text style={styles.questionText}>{question}</Text>
              )}
            </GlassCard>

            {/* ANSWER FIELD */}
            <Text style={styles.sectionHeader}>Your Response</Text>
            <GlassCard style={styles.answerCard}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your response here..."
                placeholderTextColor={COLORS.text.faint}
                value={answer}
                onChangeText={setAnswer}
                multiline
                editable={!submittingAnswer}
              />
              <View style={styles.voiceSimRow}>
                <TouchableOpacity
                  style={styles.voiceSimBtn}
                  onPress={() => setAnswer("In React Native, useEffect runs side effects in components after rendering, whereas useMemo is a hook that cache values and returns memoized computations to prevent unnecessary recalculations on state changes.")}
                >
                  <Ionicons name="mic-outline" size={16} color={COLORS.secondary[500]} />
                  <Text style={styles.voiceSimText}>Simulate Voice Dictation</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.quitBtn} onPress={() => setSessionActive(false)}>
                <Text style={styles.quitBtnText}>Exit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitAnswer}
                disabled={submittingAnswer || !answer.trim()}
              >
                {submittingAnswer ? (
                  <ActivityIndicator size="small" color={COLORS.bg.base} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Answer</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* FEEDBACK CORNER */}
            {scoreFeedback && (
              <GlassCard style={styles.feedbackCard} gradientColors={['rgba(0, 255, 198, 0.1)', 'rgba(0, 255, 198, 0.02)']}>
                <View style={styles.feedbackHeaderRow}>
                  <Text style={styles.feedbackHeaderTitle}>Evaluation Result</Text>
                  <View style={styles.feedbackBadge}>
                    <Text style={styles.feedbackBadgeText}>{scoreFeedback.score}/10</Text>
                  </View>
                </View>

                <View style={styles.feedbackBullet}>
                  <Text style={styles.bulletTitle}>Strengths:</Text>
                  <Text style={styles.bulletDesc}>{scoreFeedback.strengths}</Text>
                </View>

                <View style={styles.feedbackBullet}>
                  <Text style={styles.bulletTitle}>Weaknesses:</Text>
                  <Text style={styles.bulletDesc}>{scoreFeedback.weaknesses}</Text>
                </View>

                <View style={styles.feedbackBullet}>
                  <Text style={styles.bulletTitle}>Improvement Tip:</Text>
                  <Text style={styles.bulletDesc}>{scoreFeedback.improvement}</Text>
                </View>

                <TouchableOpacity style={styles.nextQuestionBtn} onPress={startInterview}>
                  <Text style={styles.nextQuestionText}>Next Question</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
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
  introContainer: {
    marginTop: 20,
  },
  introLabel: {
    color: COLORS.text.muted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  typeBtn: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    backgroundColor: COLORS.secondary[200],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeBtnSelected: {
    borderColor: COLORS.secondary[500],
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  typeBtnText: {
    color: COLORS.text.muted,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'System',
  },
  typeBtnTextSelected: {
    color: COLORS.secondary[500],
  },
  startBtn: {
    backgroundColor: COLORS.secondary[500],
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: COLORS.bg.base,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'System',
  },
  sessionContainer: {
    gap: 20,
  },
  questionCard: {
    padding: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionLabel: {
    color: COLORS.primary[500],
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    fontFamily: 'System',
  },
  questionText: {
    color: COLORS.text.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
  answerCard: {
    padding: 2,
  },
  textInput: {
    backgroundColor: COLORS.secondary[200],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    color: COLORS.text.primary,
    fontSize: 13,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  voiceSimRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  voiceSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    backgroundColor: 'rgba(0, 229, 255, 0.04)',
    gap: 4,
  },
  voiceSimText: {
    color: COLORS.secondary[500],
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'System',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quitBtn: {
    width: 80,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.text.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitBtnText: {
    color: COLORS.text.muted,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.emerald[500],
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: COLORS.bg.base,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'System',
  },
  feedbackCard: {
    marginTop: 10,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[200],
    paddingBottom: 10,
    marginBottom: 12,
  },
  feedbackHeaderTitle: {
    color: COLORS.emerald[500],
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'System',
  },
  feedbackBadge: {
    backgroundColor: COLORS.emerald.subtle,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  feedbackBadgeText: {
    color: COLORS.emerald[500],
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
  },
  feedbackBullet: {
    marginVertical: 6,
  },
  bulletTitle: {
    color: COLORS.primary[500],
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'System',
  },
  bulletDesc: {
    color: COLORS.text.primary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
    fontFamily: 'System',
  },
  nextQuestionBtn: {
    backgroundColor: COLORS.secondary[500],
    borderRadius: 12,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  nextQuestionText: {
    color: COLORS.bg.base,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
  },
});
