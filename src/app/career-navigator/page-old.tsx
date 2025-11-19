'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  TrendingUp,
  Download,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  MapPin,
  DollarSign
} from 'lucide-react';

interface CareerPathData {
  next_academic_options: string[];
  subjects_or_streams: Record<string, string[]>;
  recommended_exams: string[];
  higher_study_paths: string[];
  career_paths: Array<{title: string; salary?: string; growth?: string}>;
  future_opportunities: string[];
  ai_insights: string[];
}

const GRADE_OPTIONS = [
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11-science', label: 'Grade 11 - Science' },
  { value: '11-commerce', label: 'Grade 11 - Commerce' },
  { value: '11-arts', label: 'Grade 11 - Arts' },
  { value: '12-science', label: 'Grade 12 - Science' },
  { value: '12-commerce', label: 'Grade 12 - Commerce' },
  { value: '12-arts', label: 'Grade 12 - Arts' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'ug', label: 'Undergraduate (Pursuing)' },
  { value: 'pg', label: 'Postgraduate (Pursuing)' },
];

export default function CareerNavigatorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentGrade, setCurrentGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [careerData, setCareerData] = useState<CareerPathData | null>(null);

  const fetchCareerPath = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/career-navigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentGrade,
          selectedStream,
          selectedSubjects
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setCareerData(result.data);
        setStep(step + 1);
      } else {
        alert('Failed to fetch career path. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && currentGrade) {
      fetchCareerPath();
    } else if (step === 2 && selectedStream) {
      fetchCareerPath();
    } else {
      setStep(step + 1);
    }
  };

  const exportToPDF = () => {
    alert('PDF export feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold text-white mb-4"
          >
            🎯 Career Path Navigator
          </motion.h1>
          <p className="text-xl text-gray-300">
            Your AI-powered journey from Grade 8 to Dream Career
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div
                    className={`h-1 w-16 md:w-32 transition-all ${
                      step > s ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Grade</span>
            <span>Stream</span>
            <span>Subjects</span>
            <span>Careers</span>
            <span>Plan</span>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Select Grade */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <GraduationCap size={36} />
                What is your current grade/education level?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {GRADE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCurrentGrade(option.value)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      currentGrade === option.value
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Academic Options */}
          {step === 2 && careerData && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen size={36} />
                Choose your stream
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {careerData.next_academic_options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedStream(option)}
                    className={`p-6 rounded-xl font-semibold transition-all ${
                      selectedStream === option
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Subjects */}
          {step === 3 && careerData && selectedStream && (
            <motion.div
              key="step3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Award size={36} />
                Subject Combinations
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {careerData.subjects_or_streams[selectedStream]?.map((subject) => (
                  <div
                    key={subject}
                    className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white"
                  >
                    <p className="font-semibold text-lg">{subject}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4">📝 Recommended Exams</h3>
                <div className="flex flex-wrap gap-3">
                  {careerData.recommended_exams.map((exam) => (
                    <div
                      key={exam}
                      className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-semibold"
                    >
                      {exam}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Career Paths */}
          {step === 4 && careerData && (
            <motion.div
              key="step4"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Briefcase size={36} />
                  Career Paths
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {careerData.career_paths.map((career, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                    >
                      <h3 className="text-xl font-bold text-white mb-2">
                        {typeof career === 'string' ? career : career.title}
                      </h3>
                      {typeof career === 'object' && career.salary && (
                        <p className="text-green-400 flex items-center gap-2">
                          <DollarSign size={16} />
                          {career.salary}
                        </p>
                      )}
                      {typeof career === 'object' && career.growth && (
                        <p className="text-blue-400 flex items-center gap-2">
                          <TrendingUp size={16} />
                          {career.growth}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">🎓 Higher Study Paths</h2>
                <div className="flex flex-wrap gap-3">
                  {careerData.higher_study_paths.map((path) => (
                    <div
                      key={path}
                      className="px-6 py-3 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-semibold"
                    >
                      {path}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Final Summary */}
          {step === 5 && careerData && (
            <motion.div
              key="step5"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Target size={36} />
                  Future Opportunities
                </h2>
                <div className="space-y-3">
                  {careerData.future_opportunities.map((opp, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white"
                    >
                      <p className="flex items-start gap-3">
                        <TrendingUp size={20} className="text-cyan-400 mt-1" />
                        {opp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Sparkles size={28} />
                  AI Insights
                </h2>
                <div className="space-y-2">
                  {careerData.ai_insights.map((insight, i) => (
                    <p key={i} className="text-white/90 text-lg">
                      💡 {insight}
                    </p>
                  ))}
                </div>
              </div>

              <button
                onClick={exportToPDF}
                className="w-full bg-white text-purple-900 font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-105 transition-transform"
              >
                <Download size={24} />
                Export My Career Plan (PDF)
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={20} />
              Previous
            </button>
          )}
          {step < 5 && (
            <button
              onClick={handleNextStep}
              disabled={loading || (step === 1 && !currentGrade) || (step === 2 && !selectedStream)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Analyzing...' : 'Next'}
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
