'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';
import type { HeatmapDay, CareerActivity } from '@/lib/types';

interface CareerHeatmapProps {
  heatmapData: HeatmapDay[];
  userName?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CareerHeatmap({ heatmapData, userName = 'You' }: CareerHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  // Group days into weeks
  const weeks = useMemo(() => {
    const weeksArray: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    heatmapData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);

      // Push last week
      if (index === heatmapData.length - 1) {
        weeksArray.push(currentWeek);
      }
    });

    return weeksArray;
  }, [heatmapData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalActivities = heatmapData.reduce((sum, day) => sum + day.count, 0);
    const activeDays = heatmapData.filter((day) => day.count > 0).length;
    const currentStreak = calculateCurrentStreak(heatmapData);
    const longestStreak = calculateLongestStreak(heatmapData);
    const avgPerDay = totalActivities / heatmapData.length;

    return {
      totalActivities,
      activeDays,
      currentStreak,
      longestStreak,
      avgPerDay: avgPerDay.toFixed(1),
    };
  }, [heatmapData]);

  const getColor = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return 'bg-white/5 border-white/10';
      case 1:
        return 'bg-emerald-500/20 border-emerald-500/30';
      case 2:
        return 'bg-emerald-500/40 border-emerald-500/50';
      case 3:
        return 'bg-emerald-500/60 border-emerald-500/70';
      case 4:
        return 'bg-emerald-500/80 border-emerald-500/90';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  const handleDayHover = (day: HeatmapDay | null, event?: React.MouseEvent) => {
    setHoveredDay(day);
    if (event && day) {
      setHoveredPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Get month labels for the heatmap
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth && weekIndex > 0) {
          labels.push({
            month: MONTHS[month],
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Activities"
          value={stats.totalActivities}
          icon="🎯"
        />
        <StatCard
          label="Active Days"
          value={stats.activeDays}
          icon="📅"
        />
        <StatCard
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          icon="🔥"
        />
        <StatCard
          label="Longest Streak"
          value={`${stats.longestStreak} days`}
          icon="⭐"
        />
        <StatCard
          label="Avg/Day"
          value={stats.avgPerDay}
          icon="📊"
        />
      </div>

      {/* Heatmap Title */}
      <div className="flex items-center gap-2 text-white">
        <Calendar className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold">
          {userName}'s Career Development Activity
        </h3>
      </div>

      {/* Heatmap Container */}
      <div className="relative bg-black/20 rounded-2xl p-6 border border-white/10">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month Labels */}
            <div className="flex mb-2 ml-8">
              {monthLabels.map((label) => (
                <div
                  key={`${label.month}-${label.weekIndex}`}
                  className="text-xs text-gray-400"
                  style={{
                    position: 'absolute',
                    left: `${label.weekIndex * 14 + 32}px`,
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1">
              {/* Day Labels */}
              <div className="flex flex-col justify-between pr-2 py-1">
                {['Mon', 'Wed', 'Fri'].map((day, index) => (
                  <div
                    key={day}
                    className="text-xs text-gray-400 h-3 flex items-center"
                    style={{ marginTop: index === 0 ? '0' : '8px' }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = week.find(
                      (d) => new Date(d.date).getDay() === dayIndex
                    );

                    if (!day) {
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}-empty`}
                          className="w-3 h-3"
                        />
                      );
                    }

                    return (
                      <motion.div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm border cursor-pointer transition-transform ${getColor(
                          day.intensity
                        )}`}
                        whileHover={{ scale: 1.3 }}
                        onMouseEnter={(e) => handleDayHover(day, e)}
                        onMouseLeave={() => handleDayHover(null)}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: weekIndex * 0.01 }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div
                  key={intensity}
                  className={`w-3 h-3 rounded-sm border ${getColor(intensity)}`}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed z-50 pointer-events-none"
              style={{
                left: hoveredPosition.x + 10,
                top: hoveredPosition.y + 10,
              }}
            >
              <div className="bg-gray-900 border border-white/20 rounded-lg p-3 shadow-2xl backdrop-blur-xl">
                <div className="text-sm font-semibold text-white mb-1">
                  {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-emerald-400 mb-2">
                  {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
                </div>
                {hoveredDay.activities.length > 0 && (
                  <div className="space-y-1 max-w-xs">
                    {hoveredDay.activities.slice(0, 5).map((activity, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-300 flex items-start gap-1"
                      >
                        <span className="text-emerald-400">•</span>
                        <span>
                          {formatActivityType(activity.type)}
                          {activity.metadata.skillName && `: ${activity.metadata.skillName}`}
                        </span>
                      </div>
                    ))}
                    {hoveredDay.activities.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        +{hoveredDay.activities.length - 5} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <motion.div
      className="bg-black/20 border border-white/10 rounded-xl p-4 hover:border-emerald-500/50 transition-colors"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <TrendingUp className="w-4 h-4 text-emerald-400 ml-auto" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </motion.div>
  );
}

function calculateCurrentStreak(days: HeatmapDay[]): number {
  let streak = 0;
  const sortedDays = [...days].reverse(); // Most recent first

  for (const day of sortedDays) {
    if (day.count > 0) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(days: HeatmapDay[]): number {
  let longestStreak = 0;
  let currentStreak = 0;

  for (const day of days) {
    if (day.count > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

function formatActivityType(type: CareerActivity['type']): string {
  const typeMap: Record<CareerActivity['type'], string> = {
    skill_added: 'Added skill',
    course_completed: 'Completed course',
    project_added: 'Added project',
    experience_added: 'Updated experience',
    profile_updated: 'Updated profile',
    interview_completed: 'Completed interview',
    learning_session: 'Learning session',
  };

  return typeMap[type] || type;
}
