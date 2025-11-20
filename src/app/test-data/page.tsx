'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestDataPage() {
  const [latestData, setLatestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'careerUpdates'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setLatestData(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          🔍 Firestore Data Diagnostic
        </h1>

        {latestData ? (
          <div className="space-y-6">
            {/* Timestamp */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📅 Timestamp</h2>
              <p className="text-gray-300">
                {new Date(latestData.timestamp?.toDate()).toLocaleString()}
              </p>
            </div>

            {/* Data Sources */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Data Sources</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-white">
                    {latestData.dataSources?.google || 0}
                  </div>
                  <div className="text-gray-300">Google Results</div>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-white">
                    {latestData.dataSources?.reddit || 0}
                  </div>
                  <div className="text-gray-300">Reddit Posts</div>
                </div>
                <div className="bg-indigo-500/20 rounded-lg p-4">
                  <div className="text-3xl font-bold text-white">
                    {latestData.dataSources?.news || 0}
                  </div>
                  <div className="text-gray-300">News Articles</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {latestData.summary && (
              <>
                {/* Trending Skills */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">🔥 Trending Skills</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {latestData.summary.trendingSkills?.map((skill: any, i: number) => (
                      <div key={i} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-300/30">
                        <div className="text-lg font-bold text-white">{skill.skill}</div>
                        <div className="text-green-400 text-sm">+{skill.growth}% growth</div>
                        {skill.avgSalary && (
                          <div className="text-gray-300 text-sm">${skill.avgSalary}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hot Jobs */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">💼 Hot Jobs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {latestData.summary.hotJobs?.map((job: any, i: number) => (
                      <div key={i} className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-300/30">
                        <div className="text-lg font-bold text-white">{job.title}</div>
                        <div className="text-gray-300 text-sm">
                          📍 {job.city} • {job.openings} openings
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">💡 Key Insights</h2>
                  <ul className="space-y-2">
                    {latestData.summary.insights?.map((insight: string, i: number) => (
                      <li key={i} className="text-gray-300 flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">📈 Metrics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">
                        {latestData.summary.metrics?.aiMlGrowth || 0}%
                      </div>
                      <div className="text-gray-300 text-sm">AI/ML Growth</div>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">
                        {latestData.summary.metrics?.remoteJobs || 0}%
                      </div>
                      <div className="text-gray-300 text-sm">Remote Jobs</div>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">
                        {latestData.summary.metrics?.topCity || 'N/A'}
                      </div>
                      <div className="text-gray-300 text-sm">Top City</div>
                    </div>
                    <div className="bg-pink-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">
                        {latestData.summary.metrics?.avgSalaryIncrease || 0}%
                      </div>
                      <div className="text-gray-300 text-sm">Salary Increase</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Raw Data */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🔧 Raw JSON</h2>
              <pre className="bg-black/30 rounded-lg p-4 overflow-auto max-h-96 text-xs text-gray-300">
                {JSON.stringify(latestData, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-red-500/20 backdrop-blur-lg rounded-lg p-6 border border-red-300/30">
            <p className="text-red-300 text-lg">No data found in Firestore</p>
          </div>
        )}
      </div>
    </div>
  );
}
