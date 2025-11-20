"use client";

import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface CareerUpdate {
  timestamp: Timestamp;
  summary: {
    trendingSkills: Array<{
      skill: string;
      changePct?: number;
      evidence: string[];
      domain?: string;
      growthScore?: number;
      weeklyGrowth?: number;
      monthlyGrowth?: number;
      source?: string;
      futureProof?: string;
      prediction?: string;
    }>;
    hotJobs?: Array<{
      title: string;
      city: string;
      count: number;
      exampleLinks: string[];
      domain?: string;
      demandScore?: number;
      salaryRange?: string;
      requiredSkills?: string[];
      hiringIndustries?: string[];
      growthForecast?: string;
      automationRisk?: string;
      source?: string;
    }>;
    jobs?: Array<any>; // Backward compatibility
    certifications: Array<{ name: string; platform: string; url: string }>;
    opportunities: Array<{ title: string; summary: string }>;
    insights: string;
    metrics: { aiMlGrowthPct?: number; reactOpenings?: number; topCity?: string };
  };
}

export default function CareerUpdatesWidget({ initialData }: { initialData?: any }) {
  const [update, setUpdate] = useState<CareerUpdate | null>({
    timestamp: Timestamp.now(),
    summary: {
      trendingSkills: [
        {
          skill: "Python",
          domain: "Tech",
          growthScore: 85,
          weeklyGrowth: 12,
          monthlyGrowth: 45,
          evidence: ["High demand"],
          source: "LinkedIn",
          futureProof: "High",
          prediction: "Growing"
        },
        {
          skill: "Financial Analysis",
          domain: "Finance",
          growthScore: 82,
          weeklyGrowth: 10,
          monthlyGrowth: 30,
          evidence: ["Banking hiring"],
          source: "Naukri",
          futureProof: "High",
          prediction: "Steady"
        },
        {
          skill: "Patient Care",
          domain: "Healthcare",
          growthScore: 75,
          weeklyGrowth: 5,
          monthlyGrowth: 20,
          evidence: ["Hospital expansion"],
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
          automationRisk: "Low",
          exampleLinks: []
        },
        {
          title: "Chartered Accountant",
          domain: "Finance",
          demandScore: 88,
          city: "Mumbai",
          count: 1200,
          source: "Naukri",
          salaryRange: "₹9-18 LPA",
          requiredSkills: ["Audit", "Taxation"],
          hiringIndustries: ["Banking"],
          growthForecast: "Stable",
          automationRisk: "Low",
          exampleLinks: []
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
          automationRisk: "Very Low",
          exampleLinks: []
        }
      ],
      certifications: [],
      opportunities: [],
      insights: "Real-time analysis active.",
      metrics: { aiMlGrowthPct: 45, reactOpenings: 2500, topCity: "Bengaluru" }
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("Widget received initialData:", initialData);
    if (initialData) {
      setUpdate({
        timestamp: Timestamp.now(),
        summary: initialData
      });
      setLoading(false);
    }
  }, [initialData]);

  const handleRefresh = async () => {
    console.log("Refreshing data...");
    setRefreshing(true);
    try {
      const res = await fetch('/api/career-updates/refresh', { method: 'POST' });
      const data = await res.json();
      console.log("API Response:", data);

      if (data.success && data.summary) {
        console.log("Setting new summary:", data.summary);
        setUpdate({
          timestamp: Timestamp.now(),
          summary: data.summary
        });
      } else {
        console.error("API returned success:false or missing summary");
      }
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Listen to the latest career update
    const q = query(collection(db, "careerUpdates"), orderBy("timestamp", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap: any) => {
      if (!snap.empty) {
        setUpdate(snap.docs[0].data() as CareerUpdate);
      } else if (!initialData) {
        // Only set loading false if we don't have initial data either
        setLoading(false);
      }
    }, (err: any) => {
      console.error("Error fetching career updates:", err);
      if (!initialData) setLoading(false);
    });
    return () => unsub();
  }, []);

  const currentSummary = update?.summary || initialData;

  if (loading && !currentSummary) return <div className="animate-pulse h-64 bg-gray-100/10 rounded-xl"></div>;
  if (!currentSummary) return <div className="p-4 text-gray-400">Waiting for live career intel...</div>;

  const summary = currentSummary;
  const skills = summary.trendingSkills || [];
  const jobs = summary.hotJobs || summary.jobs || [];
  const insights = summary.insights || "Analyzing latest career trends...";

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Real-Time Career Intel
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-full transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Fetching...' : 'Refresh Data'}
          </button>
          <span className="flex items-center gap-2 text-xs text-green-400 px-2 py-1 bg-green-400/10 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            LIVE
          </span>
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-200 text-sm font-medium">💡 Insight</p>
        <p className="text-gray-200 mt-1">{insights}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trending Skills */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Trending Skills</h4>
          <div className="space-y-2">
            {skills.length > 0 ? skills.map((s: any, i: number) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-200">{s.skill}</span>
                    {s.domain && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.domain === 'Tech' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                        {s.domain}
                      </span>
                    )}
                  </div>
                  <span className="text-green-400 text-sm font-bold">
                    {s.growthScore ? `${s.growthScore}/100` : `+${s.changePct || 0}%`}
                  </span>
                </div>
                {s.futureProof && (
                  <div className="text-xs text-gray-400">
                    Future-proof: <span className={s.futureProof === 'High' ? 'text-green-400' : 'text-yellow-400'}>{s.futureProof}</span>
                    {s.monthlyGrowth && <span className="ml-2">📈 +{s.monthlyGrowth}% this month</span>}
                  </div>
                )}
              </div>
            )) : <p className="text-gray-500 text-sm">No skills data yet</p>}
          </div>
        </div>

        {/* Hot Jobs */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Hot Jobs</h4>
          <div className="space-y-2">
            {jobs.length > 0 ? jobs.slice(0, 3).map((j: any, i: number) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-200">{j.title}</span>
                      {j.domain && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${j.domain === 'Tech' ? 'bg-blue-500/20 text-blue-300' :
                          j.domain === 'Government' ? 'bg-green-500/20 text-green-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                          {j.domain}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{j.city || 'Remote'}</span>
                  </div>
                  {j.demandScore && (
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                      🔥 {j.demandScore}/100
                    </span>
                  )}
                </div>
                <div className="text-xs text-blue-400">{(j.count || 0).toLocaleString()} openings</div>
                {j.salaryRange && (
                  <div className="text-xs text-green-400 mt-1">💰 {j.salaryRange}</div>
                )}
                {j.requiredSkills && j.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {j.requiredSkills.slice(0, 3).map((skill: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )) : <p className="text-gray-500 text-sm">No jobs data yet</p>}
          </div>
        </div>
      </div>

      {/* Metrics Ticker */}
      <div className="flex gap-4 overflow-x-auto pb-2 pt-2 border-t border-white/10">
        {summary.metrics?.aiMlGrowthPct && (
          <div className="flex-shrink-0 text-xs">
            <span className="text-gray-400">AI/ML Growth:</span>
            <span className="ml-1 text-green-400 font-bold">+{summary.metrics.aiMlGrowthPct}%</span>
          </div>
        )}
        {summary.metrics?.reactOpenings && (
          <div className="flex-shrink-0 text-xs">
            <span className="text-gray-400">React Jobs:</span>
            <span className="ml-1 text-blue-400 font-bold">{summary.metrics.reactOpenings.toLocaleString()}</span>
          </div>
        )}
        {summary.metrics?.topCity && (
          <div className="flex-shrink-0 text-xs">
            <span className="text-gray-400">Top Hub:</span>
            <span className="ml-1 text-purple-400 font-bold">{summary.metrics.topCity}</span>
          </div>
        )}
      </div>

      <div className="text-right text-[10px] text-gray-500">
        Updated: {update?.timestamp?.toDate().toLocaleTimeString() || new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
