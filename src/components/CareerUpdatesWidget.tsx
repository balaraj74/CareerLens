"use client";

import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface CareerUpdate {
  timestamp: Timestamp;
  summary: {
    trendingSkills: Array<{ skill: string; changePct: number; evidence: string[] }>;
    jobs: Array<{ title: string; city: string; count: number; exampleLinks: string[] }>;
    certifications: Array<{ name: string; platform: string; url: string }>;
    opportunities: Array<{ title: string; summary: string }>;
    insights: string;
    metrics: { aiMlGrowthPct?: number; reactOpenings?: number; topCity?: string };
  };
}

export default function CareerUpdatesWidget() {
  const [update, setUpdate] = useState<CareerUpdate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the latest career update
    const q = query(collection(db, "careerUpdates"), orderBy("timestamp", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap: any) => {
      if (!snap.empty) {
        setUpdate(snap.docs[0].data() as CareerUpdate);
      }
      setLoading(false);
    }, (err: any) => {
      console.error("Error fetching career updates:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100/10 rounded-xl"></div>;
  if (!update || !update.summary) return <div className="p-4 text-gray-400">Waiting for live career intel...</div>;

  const { summary } = update;
  const skills = summary.trendingSkills || [];
  const jobs = summary.jobs || [];
  const insights = summary.insights || "Analyzing latest career trends...";

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Real-Time Career Intel
        </h3>
        <span className="flex items-center gap-2 text-xs text-green-400 px-2 py-1 bg-green-400/10 rounded-full animate-pulse">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          LIVE
        </span>
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
            {skills.length > 0 ? skills.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="font-medium text-gray-200">{s.skill}</span>
                <span className="text-green-400 text-sm font-bold">+{s.changePct || 0}%</span>
              </div>
            )) : <p className="text-gray-500 text-sm">No skills data yet</p>}
          </div>
        </div>

        {/* Hot Jobs */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Hot Jobs</h4>
          <div className="space-y-2">
            {jobs.length > 0 ? jobs.slice(0, 3).map((j, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">{j.title}</span>
                  <span className="text-xs text-gray-400">{j.city || 'Remote'}</span>
                </div>
                <div className="text-xs text-blue-400 mt-1">{(j.count || 0).toLocaleString()} openings</div>
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
        Updated: {update.timestamp?.toDate().toLocaleTimeString()}
      </div>
    </div>
  );
}
