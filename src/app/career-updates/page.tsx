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
import { collection, query, orderBy, limit, onSnapshot as firestoreOnSnapshot } from 'firebase/firestore';
import CareerUpdatesWidget from '@/components/CareerUpdatesWidget';

interface SummaryItem {
  title: string;
  summary: string;
  source?: string;
}

interface CareerSummary {
  trendingSkills: any[];
  certifications: any[];
  opportunities: any[];
  aiInsights: any[];
  hotJobs?: any[]; // New field
  metrics?: any;   // New field
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

    // Listen to the latest career update from our Real-Time Intel Engine
    const q = query(collection(db, 'careerUpdates'), orderBy('timestamp', 'desc'), limit(1));

    const unsubscribe = firestoreOnSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          if (data.summary) {
            // Map the new data structure to existing UI components
            const raw = data.summary;
            setSummary({
              trendingSkills: raw.trendingSkills?.map((s: any) => ({
                ...s,
                title: s.skill || s.title, // Ensure title exists
                summary: s.evidence?.[0] || s.summary || `${s.changePct}% growth`,
                source: s.source
              })) || [],
              certifications: raw.certifications?.map((c: any) => ({
                ...c,
                title: c.name || c.title,
                summary: c.summary || `${c.platform} - ${c.url || ''}`,
                source: c.platform
              })) || [],
              opportunities: raw.opportunities?.map((o: any) => ({
                ...o,
                title: o.title,
                summary: o.summary,
                source: o.source
              })) || [],
              aiInsights: raw.jobs?.map((j: any) => ({
                ...j,
                title: j.title,
                summary: `${j.count} openings in ${j.city}`,
                source: j.source
              })) || [],
              hotJobs: raw.hotJobs || raw.jobs || [],
              metrics: raw.metrics
            });
            setLastUpdate(data.timestamp?.toDate?.() || new Date());
            setError(null);
          }
        } else {
          console.log('No data in careerUpdates, using rich mock data');
          setSummary(getMockSummary());
          setLastUpdate(new Date());
          setError("Showing demo data. Click 'Refresh Now' to fetch live updates.");
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
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
      {
        skill: "Python",
        title: "Python",
        domain: "Tech",
        growthScore: 85,
        weeklyGrowth: 12,
        monthlyGrowth: 45,
        evidence: ["High demand"],
        summary: "45% growth in AI/ML roles",
        source: "LinkedIn",
        futureProof: "High",
        prediction: "Growing"
      },
      {
        skill: "Financial Analysis",
        title: "Financial Analysis",
        domain: "Finance",
        growthScore: 82,
        weeklyGrowth: 10,
        monthlyGrowth: 30,
        evidence: ["Banking sector hiring"],
        summary: "High demand in Fintech",
        source: "Naukri",
        futureProof: "High",
        prediction: "Steady"
      },
      {
        skill: "Patient Care",
        title: "Patient Care",
        domain: "Healthcare",
        growthScore: 75,
        weeklyGrowth: 5,
        monthlyGrowth: 20,
        evidence: ["Hospital expansion"],
        summary: "Critical need in metro cities",
        source: "Indeed",
        futureProof: "Very High",
        prediction: "Stable"
      }
    ],
    hotJobs: [
      {
        title: "Full Stack Developer",
        domain: "Tech",
        demandScore: 92,
        city: "Bengaluru",
        count: 2500,
        source: "LinkedIn",
        salaryRange: "₹8-15 LPA",
        requiredSkills: ["React", "Node.js", "MongoDB"],
        hiringIndustries: ["IT"],
        growthForecast: "High",
        automationRisk: "Low"
      },
      {
        title: "Chartered Accountant",
        domain: "Finance",
        demandScore: 88,
        city: "Mumbai",
        count: 1200,
        source: "Naukri",
        salaryRange: "₹9-18 LPA",
        requiredSkills: ["Audit", "Taxation", "Excel"],
        hiringIndustries: ["Banking", "Consulting"],
        growthForecast: "Stable",
        automationRisk: "Low"
      },
      {
        title: "Medical Officer",
        domain: "Healthcare",
        demandScore: 85,
        city: "Delhi/NCR",
        count: 800,
        source: "Medical Jobs",
        salaryRange: "₹6-12 LPA",
        requiredSkills: ["MBBS", "Patient Care"],
        hiringIndustries: ["Hospitals"],
        growthForecast: "Growing",
        automationRisk: "Very Low"
      }
    ],
    certifications: [
      { title: "AWS Solutions Architect", name: "AWS Solutions Architect", summary: "High demand cloud cert", platform: "AWS", url: "https://aws.amazon.com/" },
      { title: "Google Professional Cloud Architect", name: "Google Cloud Architect", summary: "Top paid cert", platform: "Google Cloud", url: "https://cloud.google.com/" }
    ],
    opportunities: [
      { title: "AI/ML Engineer Boom", summary: "300% increase in AI job postings", source: "LinkedIn" },
      { title: "Government Job Openings", summary: "SSC, UPSC exams announced", source: "SarkariResult" }
    ],
    aiInsights: [
      { title: "Remote Work Trends", summary: "Hybrid work is the new normal", source: "Forbes" }
    ],
    metrics: { aiMlGrowthPct: 45, reactOpenings: 2500, topCity: "Bengaluru" }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch('/api/career-updates/refresh', { method: 'POST' });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh data');
      }

      // Update state directly from response
      if (result.summary) {
        const raw = result.summary;
        setSummary({
          trendingSkills: raw.trendingSkills?.map((s: any) => ({
            ...s,
            title: s.skill || s.title, // Ensure title exists
            summary: s.evidence?.[0] || s.summary || `${s.changePct}% growth`,
            source: s.source
          })) || [],
          certifications: raw.certifications?.map((c: any) => ({
            ...c,
            title: c.name || c.title,
            summary: c.summary || `${c.platform} - ${c.url || ''}`,
            source: c.platform
          })) || [],
          opportunities: raw.opportunities?.map((o: any) => ({
            ...o,
            title: o.title,
            summary: o.summary,
            source: o.source
          })) || [],
          aiInsights: raw.jobs?.map((j: any) => ({
            ...j,
            title: j.title,
            summary: `${j.count} openings in ${j.city}`,
            source: j.source
          })) || [],
          hotJobs: raw.hotJobs || raw.jobs || [],
          metrics: raw.metrics
        });
        setLastUpdate(new Date());
      }
    } catch (err: any) {
      console.error("Refresh failed:", err);
      setError(`Refresh failed: ${err.message}. Using cached data.`);
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
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
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

        {/* Real-Time Intel Widget */}
        <section>
          <CareerUpdatesWidget initialData={summary} />
        </section>

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
      className={`bg-white/5 border border-${color}-500/20 rounded-xl p-5 hover:border-${color}-500/50 transition-all group relative overflow-hidden`}
    >
      {item.source && (
        <div className={`absolute top-0 right-0 px-2 py-1 bg-${color}-500/20 text-${color}-300 text-xs font-medium rounded-bl-lg`}>
          {item.source}
        </div>
      )}
      <h3 className={`text-white font-bold text-lg mb-2 group-hover:text-${color}-400 transition-colors pr-16`}>
        {item.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.summary}</p>
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(item.title + (item.source ? ' ' + item.source : ''))}`}
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