'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Briefcase,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
  Brain,
  Zap,
  Newspaper,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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

export default function CareerUpdatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'certs' | 'jobs' | 'ai'>('skills');
  const [summary, setSummary] = useState<CareerSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const docRef = doc(db, 'careerIntelligence', 'latest');
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setSummary(data.summary);
          setLastUpdate(data.timestamp?.toDate() || new Date());
          setError(null);
        } else {
          // Show mock data immediately if no data exists
          console.log('No data in Firestore, using mock data');
          setSummary(getMockSummary());
          setLastUpdate(new Date());
          setError("Showing demo data. Click 'Refresh Now' to fetch live updates.");
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        // Show mock data on error
        setSummary(getMockSummary());
        setLastUpdate(new Date());
        setError(`Using demo data. ${err.message}`);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  const getMockSummary = (): CareerSummary => ({
    trendingSkills: [
      { title: "React & Next.js Frameworks", summary: "Modern web development continues to favor React ecosystem with Next.js gaining massive adoption for full-stack applications." },
      { title: "Python for AI/ML", summary: "Python remains the dominant language for artificial intelligence and machine learning applications across industries." },
      { title: "Cloud Computing (AWS/Azure/GCP)", summary: "Cloud infrastructure skills are essential, with multi-cloud expertise becoming increasingly valuable in enterprise environments." },
      { title: "TypeScript Adoption", summary: "TypeScript usage is growing rapidly, becoming the preferred choice for large-scale applications due to better type safety." }
    ],
    certifications: [
      { title: "AWS Solutions Architect", summary: "One of the most sought-after certifications, validating expertise in designing and deploying scalable cloud architectures." },
      { title: "Google Professional Cloud Architect", summary: "Demonstrates ability to design, develop, and manage robust Google Cloud solutions effectively." },
      { title: "Azure Developer Associate", summary: "Proves proficiency in developing and deploying cloud applications on Microsoft Azure platform." }
    ],
    opportunities: [
      { title: "Full Stack Developer Roles", summary: "High demand for developers skilled in both frontend and backend technologies, especially with modern frameworks." },
      { title: "DevOps Engineers", summary: "Companies actively hiring for CI/CD pipeline management and infrastructure automation expertise." },
      { title: "AI/ML Engineer Positions", summary: "Explosive growth in roles focused on machine learning model development, deployment, and MLOps." }
    ],
    aiInsights: [
      { title: "Remote Work is Here to Stay", summary: "Tech industry embracing permanent remote and hybrid work models, opening global opportunities." },
      { title: "AI Augmenting Developer Productivity", summary: "AI coding assistants like GitHub Copilot and ChatGPT transforming how developers write and review code." },
      { title: "Emphasis on Soft Skills", summary: "Communication, collaboration, and problem-solving skills becoming as important as technical abilities in hiring." }
    ]
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/refresh-career-updates');
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to refresh data.');
      }
      
      // The onSnapshot listener will automatically update the UI
      
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      setError(`Failed to refresh updates: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      );
    }

    if (error) {
        return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-yellow-300 font-semibold mb-1">Data not available</h3>
                  <p className="text-gray-300 text-sm">{error}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    💡 The system fetches fresh data every 12 hours, or you can manually trigger a refresh using the button above.
                  </p>
                </div>
              </div>
            </motion.div>
          );
    }

    return (
        <AnimatePresence mode="wait">
            {activeTab === 'skills' && <ContentTab items={summary?.trendingSkills} icon={TrendingUp} color="purple" />}
            {activeTab === 'certs' && <ContentTab items={summary?.certifications} icon={Award} color="green" />}
            {activeTab === 'jobs' && <ContentTab items={summary?.opportunities} icon={Briefcase} color="blue" />}
            {activeTab === 'ai' && <ContentTab items={summary?.aiInsights} icon={Sparkles} color="yellow" />}
        </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Career Intelligence Hub
                </h1>
                <p className="text-gray-400">Real-time career updates powered by Google AI</p>
                {lastUpdate && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Last updated: {lastUpdate.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-blue-500/30 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'skills', label: 'Trending Skills', icon: TrendingUp },
            { id: 'certs', label: 'Certifications', icon: Award },
            { id: 'jobs', label: 'Opportunities', icon: Briefcase },
            { id: 'ai', label: 'AI Insights', icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 border border-blue-500/30 text-gray-300 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {renderContent()}
        
      </div>
    </div>
  );
}

function ContentTab({ items, icon: Icon, color }: { items?: SummaryItem[], icon: React.ElementType, color: string }) {
    if (!items || items.length === 0) {
      return (
        <motion.div
          key="empty-tab"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Icon className={`w-16 h-16 text-gray-600 mx-auto mb-4`} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Data Available</h3>
          <p className="text-gray-500">Click "Refresh Now" to fetch the latest updates.</p>
        </motion.div>
      );
    }
  
    return (
      <motion.div
        key={color}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {items.map((item, idx) => (
          <ContentCard key={idx} item={item} delay={idx * 0.05} color={color} />
        ))}
      </motion.div>
    );
  }
  
  function ContentCard({ item, delay, color }: { item: SummaryItem; delay: number, color: string }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`bg-white/5 border border-${color}-500/20 rounded-xl p-5 hover:border-${color}-500/50 transition-all group`}
      >
        <h3 className={`text-white font-bold text-lg mb-2 group-hover:text-${color}-400 transition-colors`}>
          {item.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.summary}</p>
        <a
            href={`https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 px-4 py-2 bg-${color}-600 hover:bg-${color}-700 rounded-lg text-sm font-semibold flex items-center gap-2 w-full justify-center transition-all`}
        >
            Learn More
            <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>
    );
  }