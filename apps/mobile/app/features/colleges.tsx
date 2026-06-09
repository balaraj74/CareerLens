import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import gemini, { extractJSON } from '../../src/services/gemini';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

interface College {
  id: string;
  name: string;
  location: string;
  rank: number;
  fees: string;
  probability: number;
  redditSentiment: string; // e.g., "82% Positive"
}

export default function CollegeRecommendations() {
  const router = useRouter();
  const [rankInput, setRankInput] = useState('4500');
  const [exam, setExam] = useState('JEE Advanced');
  const [category, setCategory] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [compareList, setCompareList] = useState<College[]>([]);
  const [comparisonActive, setComparisonActive] = useState(false);

  const fetchRecommendations = async () => {
    const rankNum = parseInt(rankInput);
    if (isNaN(rankNum) || rankNum <= 0) {
      Alert.alert('Invalid Rank', 'Please enter a valid rank number.');
      return;
    }

    setIsLoading(true);
    setComparisonActive(false);
    setCompareList([]);

    try {
      const prompt = `
        You are an expert college admissions counselor for Indian engineering colleges.
        A student has achieved rank ${rankNum} in the ${exam} exam. Their category is ${category}.
        Recommend 4 realistic engineering colleges they can get into.
        Include realistic probability, fees, and Reddit sentiment.
        Return ONLY valid JSON in this format:
        [
          {
            "id": "unique-id",
            "name": "College Name - Branch",
            "location": "City, State",
            "rank": 50,
            "fees": "₹2.2 Lakhs/year",
            "probability": 85,
            "redditSentiment": "89% Positive (High placements)"
          }
        ]
      `;
      
      const data = extractJSON(await gemini.generateContent(prompt));

      if (Array.isArray(data) && data.length > 0) {
        setColleges(data);
      } else {
        throw new Error('Invalid generation format');
      }
    } catch (e) {
      console.error(e);
      // Fallback static recommendations if Gemini fails
      const fallbackColleges: College[] = [
        {
          id: 'iitb',
          name: 'IIT Bombay - Computer Science',
          location: 'Mumbai, Maharashtra',
          rank: 67,
          fees: '₹2.2 Lakhs/year',
          probability: rankNum < 200 ? 92 : rankNum < 500 ? 54 : 12,
          redditSentiment: '89% Positive (High placements focus)',
        },
        {
          id: 'iitm',
          name: 'IIT Madras - Electrical Engineering',
          location: 'Chennai, Tamil Nadu',
          rank: 120,
          fees: '₹2.1 Lakhs/year',
          probability: rankNum < 800 ? 88 : rankNum < 1500 ? 62 : 18,
          redditSentiment: '84% Positive (Research-driven campus life)',
        },
      ];
      setColleges(fallbackColleges.map(c => ({
        ...c,
        probability: Math.max(5, Math.min(98, Math.floor(100 - (rankNum / (c.rank * 10)) * 30))),
      })).sort((a, b) => b.probability - a.probability));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompare = (college: College) => {
    if (compareList.some(c => c.id === college.id)) {
      setCompareList(prev => prev.filter(c => c.id !== college.id));
    } else {
      if (compareList.length >= 2) {
        Alert.alert('Limit Reached', 'You can compare at most two colleges.');
        return;
      }
      setCompareList(prev => [...prev, college]);
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
          <Text style={styles.title}>College Recommendations</Text>
          <Text style={styles.subtitle}>AI predictor matching ranks to institution acceptances</Text>
        </View>

        {/* RANK PREDICTOR FORM */}
        <GlassCard style={styles.formCard}>
          <Text style={styles.formLabel}>Enter Your Entrance Exam Rank</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.rankInput}
              keyboardType="number-pad"
              value={rankInput}
              onChangeText={setRankInput}
              placeholder="e.g. 4500"
              placeholderTextColor={COLORS.text.faint}
            />
            <View style={styles.examPicker}>
              <TouchableOpacity onPress={() => setExam(exam === 'JEE Advanced' ? 'JEE Main' : 'JEE Advanced')}>
                <Text style={styles.examPickerText}>{exam} ⇅</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.predictBtn} onPress={fetchRecommendations} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.bg.base} />
            ) : (
              <Text style={styles.predictBtnText}>Predict Matching Colleges</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* COMPARISON BAR CONTROL */}
        {compareList.length > 0 && (
          <GlassCard style={styles.compareBar} gradientColors={GRADIENTS.cardNeutral as any}>
            <View style={styles.compareBarRow}>
              <Text style={styles.compareBarText}>
                Selected: {compareList.length}/2 colleges
              </Text>
              {compareList.length === 2 && (
                <TouchableOpacity style={styles.compareBtn} onPress={() => setComparisonActive(!comparisonActive)}>
                  <Text style={styles.compareBtnText}>
                    {comparisonActive ? 'Close Comparison' : 'Compare Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        )}

        {/* COMPARISON VIEW MATRIX */}
        {comparisonActive && compareList.length === 2 ? (
          <GlassCard style={styles.matrixCard} gradientColors={GRADIENTS.cardNeutral as any}>
            <Text style={styles.matrixHeader}>Comparison Matrix</Text>
            
            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Factor</Text>
              <Text style={styles.matrixColText}>{compareList[0]?.name.split(' - ')[0]}</Text>
              <Text style={styles.matrixColText}>{compareList[1]?.name.split(' - ')[0]}</Text>
            </View>

            <View style={styles.matrixDivider} />

            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Acceptance</Text>
              <Text style={[styles.matrixColText, { color: COLORS.emerald[500], fontWeight: 'bold' }]}>{compareList[0]?.probability}%</Text>
              <Text style={[styles.matrixColText, { color: COLORS.emerald[500], fontWeight: 'bold' }]}>{compareList[1]?.probability}%</Text>
            </View>

            <View style={styles.matrixDivider} />

            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Fees</Text>
              <Text style={styles.matrixColText}>{compareList[0]?.fees}</Text>
              <Text style={styles.matrixColText}>{compareList[1]?.fees}</Text>
            </View>

            <View style={styles.matrixDivider} />

            <View style={styles.matrixRow}>
              <Text style={styles.matrixLabel}>Sentiment</Text>
              <Text style={styles.matrixColText}>{compareList[0]?.redditSentiment.split(' (')[0]}</Text>
              <Text style={styles.matrixColText}>{compareList[1]?.redditSentiment.split(' (')[0]}</Text>
            </View>
          </GlassCard>
        ) : null}

        {/* RECOMMENDATIONS LIST */}
        {colleges.length > 0 && <Text style={styles.sectionHeader}>Predicted Admissions</Text>}
        
        <View style={styles.listContainer}>
          {colleges.map((college) => {
            const isSelectedForCompare = compareList.some(c => c.id === college.id);
            return (
              <GlassCard key={college.id} style={styles.collegeCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleInfo}>
                    <Text style={styles.collegeName}>{college.name}</Text>
                    <Text style={styles.collegeLoc}>{college.location}</Text>
                  </View>
                  <View style={[styles.probBadge, { backgroundColor: college.probability > 70 ? COLORS.emerald.subtle : college.probability > 40 ? COLORS.amber.subtle : COLORS.rose.subtle }]}>
                    <Text style={[styles.probText, { color: college.probability > 70 ? COLORS.emerald[500] : college.probability > 40 ? COLORS.amber[500] : COLORS.rose[500] }]}>{college.probability}%</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>Fees: {college.fees}</Text>
                </View>

                {/* Reddit Sentiment Analysis section */}
                <View style={styles.redditBox}>
                  <View style={styles.redditHeader}>
                    <Ionicons name="logo-reddit" size={14} color={COLORS.rose[500]} />
                    <Text style={styles.redditTitle}>Reddit Sentiment Analysis</Text>
                  </View>
                  <Text style={styles.redditBody}>{college.redditSentiment}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.compareCheckBtn, isSelectedForCompare && styles.compareCheckBtnSelected]}
                  onPress={() => toggleCompare(college)}
                >
                  <Ionicons
                    name={isSelectedForCompare ? 'checkmark-circle' : 'add-circle-outline'}
                    size={16}
                    color={isSelectedForCompare ? COLORS.bg.base : COLORS.primary[500]}
                  />
                  <Text style={[styles.compareCheckText, isSelectedForCompare && styles.compareCheckTextSelected]}>
                    {isSelectedForCompare ? 'Added to Compare' : 'Add to Compare'}
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            );
          })}
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
  formCard: {
    marginBottom: 24,
  },
  formLabel: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: 'System',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  rankInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.secondary[200],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    color: COLORS.text.primary,
    fontSize: 14,
    paddingHorizontal: 12,
    fontFamily: 'System',
  },
  examPicker: {
    width: 130,
    height: 44,
    backgroundColor: COLORS.secondary[200],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  examPickerText: {
    color: COLORS.secondary[500],
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'System',
  },
  predictBtn: {
    backgroundColor: COLORS.secondary[500],
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictBtnText: {
    color: COLORS.bg.base,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'System',
  },
  compareBar: {
    marginBottom: 12,
  },
  compareBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareBarText: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'System',
  },
  compareBtn: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  compareBtnText: {
    color: COLORS.bg.base,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'System',
  },
  matrixCard: {
    marginBottom: 20,
  },
  matrixHeader: {
    color: COLORS.emerald[500],
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily: 'System',
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  matrixLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    width: 80,
    fontFamily: 'System',
  },
  matrixColText: {
    color: COLORS.text.primary,
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'System',
  },
  matrixDivider: {
    height: 1,
    backgroundColor: COLORS.secondary[200],
    marginVertical: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    fontFamily: 'System',
  },
  listContainer: {
    gap: 12,
  },
  collegeCard: {
    padding: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleInfo: {
    flex: 1,
    marginRight: 10,
  },
  collegeName: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'System',
  },
  collegeLoc: {
    color: COLORS.text.muted,
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'System',
  },
  probBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  probText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
  },
  detailsRow: {
    marginTop: 8,
  },
  detailText: {
    color: COLORS.primary[500],
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  redditBox: {
    backgroundColor: COLORS.rose.subtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.rose.border,
    padding: 10,
    marginTop: 12,
  },
  redditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  redditTitle: {
    color: COLORS.rose[500],
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    fontFamily: 'System',
  },
  redditBody: {
    color: COLORS.text.primary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'System',
  },
  compareCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    borderRadius: 10,
    height: 32,
    marginTop: 12,
    gap: 6,
  },
  compareCheckBtnSelected: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  compareCheckText: {
    color: COLORS.primary[500],
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'System',
  },
  compareCheckTextSelected: {
    color: COLORS.bg.base,
  },
});
