'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CareerEvent } from '@/lib/google-calendar-service';

interface CalendarGridProps {
  events: CareerEvent[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CareerEvent) => void;
  selectedDate?: Date;
}

export function CalendarGrid({
  events,
  currentMonth,
  onMonthChange,
  onDateSelect,
  onEventClick,
  selectedDate,
}: CalendarGridProps) {
  const [view, setView] = useState<'month' | 'week'>('month');

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start.dateTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if date is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'learning':
        return '📚';
      case 'interview':
        return '💼';
      case 'networking':
        return '🤝';
      case 'deadline':
        return '⏰';
      case 'meeting':
        return '📅';
      case 'task':
        return '✅';
      default:
        return '📌';
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">
            {currentMonth.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setView('month')}
              className={`text-xs ${
                view === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Month
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setView('week')}
              className={`text-xs ${
                view === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const prev = new Date(currentMonth);
              prev.setMonth(prev.getMonth() - 1);
              onMonthChange(prev);
            }}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMonthChange(new Date())}
            className="text-slate-400 hover:text-white hover:bg-slate-800 px-4"
          >
            Month
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const next = new Date(currentMonth);
              next.setMonth(next.getMonth() + 1);
              onMonthChange(next);
            }}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-slate-700/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-slate-400 bg-slate-800/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          <AnimatePresence mode="wait">
            {days.map((date, index) => {
              const dateEvents = getEventsForDate(date);
              const today = isToday(date);
              const selected = isSelected(date);

              return (
                <motion.div
                  key={date ? date.toISOString() : `empty-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.01 }}
                  className={`min-h-[120px] border-r border-b border-slate-700/50 p-2 ${
                    !date
                      ? 'bg-slate-800/20'
                      : 'hover:bg-slate-800/30 cursor-pointer transition-colors'
                  } ${selected ? 'bg-blue-900/20 ring-2 ring-blue-500/50' : ''}`}
                  onClick={() => date && onDateSelect(date)}
                >
                  {date && (
                    <>
                      {/* Date number */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            today
                              ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                              : date.getMonth() !== currentMonth.getMonth()
                              ? 'text-slate-600'
                              : 'text-slate-300'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dateEvents.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                          >
                            {dateEvents.length}
                          </Badge>
                        )}
                      </div>

                      {/* Events for this date */}
                      <div className="space-y-1">
                        {dateEvents.slice(0, 3).map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`text-xs p-1.5 rounded border cursor-pointer transition-all hover:scale-105 ${
                              event.completed
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-blue-500/50'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{getTypeEmoji(event.type)}</span>
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(
                                  event.priority
                                )}`}
                              />
                              <span className="truncate flex-1">
                                {event.summary}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(event.start.dateTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </motion.div>
                        ))}
                        {dateEvents.length > 3 && (
                          <div className="text-[10px] text-slate-500 text-center">
                            +{dateEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Low Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {new Date().getDate()}
          </div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
