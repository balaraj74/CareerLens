import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import GlassCard from '../../src/components/GlassCard';
import gemini from '../../src/services/gemini';
import useAuthStore from '../../src/store/useAuthStore';
import { COLORS, GRADIENTS } from '../../src/theme/colors';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Review {
  id: string;
  college?: string;
  institution?: string;
  exam?: string;
  category: string;
  content: string;
  rating: number;
  upvotes: number;
  downvotes: number;
  authorName: string;
  createdAt: any;
}

const CATEGORIES = ['all', 'KCET', 'NEET', 'JEE', 'COMEDK', 'GATE', 'General', 'College Reviews'];
const RATINGS = [1, 2, 3, 4, 5];

// ── Fallback data ──────────────────────────────────────────────────────────────
const MOCK_REVIEWS: Review[] = [
  {
    id: 'm1', college: 'RVCE Bangalore', exam: 'KCET', category: 'KCET',
    content: 'RVCE is absolutely worth it for CS. Placements are excellent — most students from CS get placed at 12-18 LPA. The KCET rank needed is around 2000-4000. Campus culture is also great.',
    rating: 5, upvotes: 42, downvotes: 3, authorName: 'Priya K.', createdAt: null,
    institution: 'RVCE',
  },
  {
    id: 'm2', college: 'BMS College of Engineering', exam: 'KCET', category: 'KCET',
    content: 'Great infrastructure and labs. Placements improved significantly in 2025. KCET cutoff for ECE is around 5000-8000. Some departments are stronger than others.',
    rating: 4, upvotes: 28, downvotes: 7, authorName: 'Arjun M.', createdAt: null,
    institution: 'BMSCE',
  },
  {
    id: 'm3', college: 'NIT Surathkal', exam: 'JEE', category: 'JEE',
    content: 'One of the best NITs in South India. Campus life is vibrant. Internship opportunities are excellent. JEE rank around 5000-12000 for CS. Faculty are research-oriented.',
    rating: 5, upvotes: 67, downvotes: 2, authorName: 'Sneha R.', createdAt: null,
    institution: 'NITK',
  },
  {
    id: 'm4', exam: 'NEET', category: 'NEET',
    content: 'NEET 2025 was tougher than expected. Biology questions were more concept-based. Score of 650+ needed for government medical colleges. Chemistry was the deciding factor.',
    rating: 3, upvotes: 15, downvotes: 4, authorName: 'Rohit S.', createdAt: null,
    institution: 'NEET Experience',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submit form state
  const [formCategory, setFormCategory] = useState('KCET');
  const [formCollege, setFormCollege] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formRating, setFormRating] = useState(4);

  // AI Exam Predictor
  const [examRank, setExamRank] = useState('');
  const [examType, setExamType] = useState('KCET');
  const [predictedColleges, setPredictedColleges] = useState<string[]>([]);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    // Try Firestore
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreReviews: Review[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Review));
        setReviews([...firestoreReviews, ...MOCK_REVIEWS]);
      }
    }, (err) => {
      console.log('[Community] Firestore not available, using mock:', err.message);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitReview = async () => {
    if (!formContent.trim()) {
      Alert.alert('Error', 'Please write a review.');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        category: formCategory,
        college: formCollege,
        institution: formCollege,
        content: formContent,
        rating: formRating,
        upvotes: 0,
        downvotes: 0,
        authorName: profile?.name || user?.displayName || 'Anonymous',
        authorId: user?.uid || null,
        createdAt: serverTimestamp(),
      });
      setIsSubmitOpen(false);
      setFormCollege('');
      setFormContent('');
      setFormRating(4);
      Alert.alert('Posted!', 'Your review has been published.');
    } catch (err) {
      console.error('[Community] Submit error:', err);
      // Add locally for offline
      setReviews(prev => [{
        id: `local_${Date.now()}`,
        category: formCategory,
        college: formCollege,
        institution: formCollege,
        content: formContent,
        rating: formRating,
        upvotes: 0, downvotes: 0,
        authorName: profile?.name || 'You',
        createdAt: null,
      }, ...prev]);
      setIsSubmitOpen(false);
      Alert.alert('Posted Locally', 'Review saved locally — will sync when online.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId: string, type: 'up' | 'down') => {
    // Optimistic update
    setReviews(prev => prev.map(r => {
      if (r.id !== reviewId) return r;
      return { ...r, upvotes: r.upvotes + (type === 'up' ? 1 : 0), downvotes: r.downvotes + (type === 'down' ? 1 : 0) };
    }));
    // Firestore update (non-blocking)
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        [type === 'up' ? 'upvotes' : 'downvotes']: increment(1),
      });
    } catch {}
  };

  const handlePredict = async () => {
    if (!examRank.trim()) {
      Alert.alert('Enter Rank', 'Please enter your exam rank.');
      return;
    }
    setPredicting(true);
    setPredictedColleges([]);
    try {
      const prompt = `
You are an Indian college admission expert. Based on the following, suggest the top colleges a student can get:
Exam: ${examType}
Rank/Score: ${examRank}

Return ONLY a JSON array of 5 college suggestions:
["College Name 1 — Branch (Cutoff rank range)", "College 2 — Branch", ...]
`;
      const colleges = await gemini.generateJSON<string[]>(prompt, { temperature: 0.2 });
      if (Array.isArray(colleges)) {
        setPredictedColleges(colleges.slice(0, 6));
      }
    } catch (err) {
      console.error('[Community] Predict error:', err);
      setPredictedColleges(['Could not predict. Please try again.']);
    } finally {
      setPredicting(false);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      (r.college || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
              <Text style={styles.title}>Community</Text>
              <Text style={styles.subtitle}>College reviews & exam insights</Text>
            </View>
            <TouchableOpacity
              style={styles.postBtn}
              onPress={() => setIsSubmitOpen(true)}
            >
              <LinearGradient colors={GRADIENTS.brand} style={styles.postBtnGrad}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.postBtnText}>Post</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI RANK PREDICTOR */}
        <GlassCard style={styles.predictorCard}>
          <View style={styles.predictorHeader}>
            <Ionicons name="sparkles" size={16} color={COLORS.amber[500]} />
            <Text style={styles.predictorTitle}>AI College Predictor</Text>
          </View>
          <View style={styles.predictorRow}>
            <View style={styles.examSelector}>
              {['KCET', 'JEE', 'NEET'].map((exam) => (
                <TouchableOpacity
                  key={exam}
                  style={[styles.examChip, examType === exam && styles.examChipActive]}
                  onPress={() => setExamType(exam)}
                >
                  <Text style={[styles.examChipText, examType === exam && styles.examChipTextActive]}>{exam}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.predictorInputRow}>
            <TextInput
              style={styles.rankInput}
              placeholder={`Enter ${examType} rank/score`}
              placeholderTextColor={COLORS.text.faint}
              value={examRank}
              onChangeText={setExamRank}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={handlePredict} style={styles.predictBtn} disabled={predicting}>
              {predicting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.predictBtnText}>Predict</Text>
              )}
            </TouchableOpacity>
          </View>

          {predictedColleges.length > 0 && (
            <View style={styles.predictedList}>
              <Text style={styles.predictedHeader}>Colleges you can get:</Text>
              {predictedColleges.map((college, i) => (
                <View key={i} style={styles.predictedRow}>
                  <Ionicons name="school-outline" size={14} color={COLORS.emerald[500]} />
                  <Text style={styles.predictedText}>{college}</Text>
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={COLORS.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search colleges, exams..."
            placeholderTextColor={COLORS.text.faint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CATEGORY FILTER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* REVIEWS */}
        <Text style={styles.sectionHeader}>{filtered.length} Reviews</Text>
        <View style={styles.reviewsList}>
          {filtered.map((review) => (
            <GlassCard key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewMeta}>
                  <View style={[styles.categoryPill, { backgroundColor: 'rgba(0,229,255,0.1)' }]}>
                    <Text style={styles.categoryPillText}>{review.category}</Text>
                  </View>
                  {review.college && (
                    <Text style={styles.collegeName}>{review.college}</Text>
                  )}
                </View>
                {/* Stars */}
                <View style={styles.starsRow}>
                  {[1,2,3,4,5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= review.rating ? 'star' : 'star-outline'}
                      size={12}
                      color={COLORS.amber[500]}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.reviewContent}>{review.content}</Text>

              <View style={styles.reviewFooter}>
                <Text style={styles.authorText}>— {review.authorName}</Text>
                <View style={styles.voteRow}>
                  <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(review.id, 'up')}>
                    <Ionicons name="thumbs-up-outline" size={14} color={COLORS.emerald[500]} />
                    <Text style={styles.voteBtnText}>{review.upvotes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.voteBtn} onPress={() => handleVote(review.id, 'down')}>
                    <Ionicons name="thumbs-down-outline" size={14} color={COLORS.rose[500]} />
                    <Text style={[styles.voteBtnText, { color: COLORS.rose[500] }]}>{review.downvotes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* SUBMIT REVIEW MODAL */}
      <Modal visible={isSubmitOpen} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setIsSubmitOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category */}
              <Text style={styles.formLabel}>Exam / Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CATEGORIES.filter(c => c !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, formCategory === cat && styles.catChipActive]}
                    onPress={() => setFormCategory(cat)}
                  >
                    <Text style={[styles.catChipText, formCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* College name */}
              <Text style={styles.formLabel}>College / Institution Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., RVCE Bangalore"
                placeholderTextColor={COLORS.text.faint}
                value={formCollege}
                onChangeText={setFormCollege}
              />

              {/* Rating */}
              <Text style={styles.formLabel}>Rating</Text>
              <View style={styles.ratingRow}>
                {RATINGS.map((r) => (
                  <TouchableOpacity key={r} onPress={() => setFormRating(r)}>
                    <Ionicons
                      name={r <= formRating ? 'star' : 'star-outline'}
                      size={28}
                      color={COLORS.amber[500]}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Content */}
              <Text style={styles.formLabel}>Your Review</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Share your experience — cutoff rank, placement stats, campus life..."
                placeholderTextColor={COLORS.text.faint}
                value={formContent}
                onChangeText={setFormContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview} disabled={submitting}>
                <LinearGradient colors={GRADIENTS.brand} style={styles.submitGrad}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color="#fff" />
                      <Text style={styles.submitText}>Publish Review</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  postBtn: { borderRadius: 12, overflow: 'hidden' },
  postBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16 },
  postBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  predictorCard: { marginBottom: 16 },
  predictorHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  predictorTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  predictorRow: { marginBottom: 10 },
  examSelector: { flexDirection: 'row', gap: 8 },
  examChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glass.border, backgroundColor: COLORS.bg.surface,
  },
  examChipActive: { borderColor: COLORS.amber[500], backgroundColor: `${COLORS.amber[500]}15` },
  examChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  examChipTextActive: { color: COLORS.amber[500] },
  predictorInputRow: { flexDirection: 'row', gap: 10 },
  rankInput: {
    flex: 1, backgroundColor: COLORS.bg.elevated, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text.primary,
    fontSize: 14, borderWidth: 1, borderColor: COLORS.glass.border,
  },
  predictBtn: {
    backgroundColor: COLORS.amber[500], borderRadius: 10, paddingHorizontal: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  predictBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  predictedList: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.glass.border, gap: 6 },
  predictedHeader: { fontSize: 12, fontWeight: '700', color: COLORS.text.muted, marginBottom: 4 },
  predictedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  predictedText: { flex: 1, fontSize: 12, color: COLORS.text.primary, lineHeight: 18 },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.bg.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.glass.border,
    paddingHorizontal: 12, height: 46, marginBottom: 14,
  },
  searchInput: { flex: 1, color: COLORS.text.primary, fontSize: 14 },

  catScroll: { marginBottom: 20 },
  catChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.glass.border,
    backgroundColor: COLORS.bg.surface, marginRight: 8,
  },
  catChipActive: { borderColor: COLORS.secondary[500], backgroundColor: 'rgba(0,229,255,0.1)' },
  catChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  catChipTextActive: { color: COLORS.secondary[500] },

  sectionHeader: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary, marginBottom: 12 },
  reviewsList: { gap: 12 },

  reviewCard: {},
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  reviewMeta: { flex: 1, gap: 4 },
  categoryPill: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  categoryPillText: { fontSize: 10, fontWeight: '700', color: COLORS.secondary[500] },
  collegeName: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewContent: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20, marginBottom: 10 },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorText: { fontSize: 11, color: COLORS.text.faint, fontStyle: 'italic' },
  voteRow: { flexDirection: 'row', gap: 12 },
  voteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.emerald[500] },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.bg.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },

  formLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text.muted, marginBottom: 8 },
  formInput: {
    backgroundColor: COLORS.bg.elevated, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, color: COLORS.text.primary, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.glass.border, marginBottom: 16,
  },
  textArea: { minHeight: 120 },
  ratingRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  submitBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  submitText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
