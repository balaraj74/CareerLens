'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Sparkles, TrendingUp, Target, Award, CheckCircle2, Circle, Plus, RefreshCw, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { CareerEvent } from '@/lib/google-calendar-service';
import type { EventSuggestion } from '@/lib/ai-calendar-suggestions';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { EventDetailModal } from '@/components/calendar/event-detail-modal';

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [todayTasks, setTodayTasks] = useState<CareerEvent[]>([]);
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CareerEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [stats, setStats] = useState({
    completedToday: 0,
    totalToday: 0,
    streak: 0,
    productivityScore: 0,
  });

  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      // Simulate loading calendar events
      // In production, these would call the actual services
      const mockEvents: CareerEvent[] = [
        {
          id: '1',
          summary: 'React Interview Prep',
          description: 'Practice common React interview questions',
          type: 'interview',
          priority: 'high',
          completed: false,
          start: {
            dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
            timeZone: 'UTC',
          },
        },
        {
          id: '2',
          summary: 'Learn TypeScript Advanced Types',
          description: 'Study generics, conditional types, and mapped types',
          type: 'learning',
          priority: 'medium',
          completed: false,
          start: {
            dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
            timeZone: 'UTC',
          },
        },
        {
          id: '3',
          summary: 'Networking Coffee Chat',
          description: 'Virtual coffee with senior developer',
          type: 'networking',
          priority: 'high',
          completed: true,
          start: {
            dateTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
            timeZone: 'UTC',
          },
        },
      ];

      const mockSuggestions: EventSuggestion[] = [
        {
          summary: 'Practice LeetCode Problems',
          description: 'Solve 3 medium-level algorithm problems',
          type: 'learning',
          priority: 'high',
          duration: 60,
          suggestedTime: 'morning',
          reasoning: 'Regular coding practice improves problem-solving skills',
        },
        {
          summary: 'Update Portfolio Website',
          description: 'Add recent projects and update skills section',
          type: 'task',
          priority: 'medium',
          duration: 120,
          suggestedTime: 'afternoon',
          reasoning: 'An updated portfolio attracts recruiters',
        },
      ];

      setEvents(mockEvents);
      setTodayTasks(mockEvents.filter((e) => !e.completed));
      setSuggestions(mockSuggestions);
      setStats({
        completedToday: mockEvents.filter((e) => e.completed).length,
        totalToday: mockEvents.length,
        streak: 7,
        productivityScore: 85,
      });
    } catch (error) {
      console.error('Error loading calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTodayTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    setStats((prev) => ({
      ...prev,
      completedToday: prev.completedToday + 1,
    }));
  };

  const addSuggestionToCalendar = (suggestion: EventSuggestion) => {
    // Calculate event time based on suggestion
    const now = new Date();
    let startTime = new Date(now);
    
    // Set time based on suggested time
    if (suggestion.suggestedTime === 'morning') {
      startTime.setHours(9, 0, 0, 0);
    } else if (suggestion.suggestedTime === 'afternoon') {
      startTime.setHours(14, 0, 0, 0);
    } else if (suggestion.suggestedTime === 'evening') {
      startTime.setHours(18, 0, 0, 0);
    } else {
      // Default to next available hour
      startTime.setHours(now.getHours() + 1, 0, 0, 0);
    }
    
    // If time has passed today, schedule for tomorrow
    if (startTime < now) {
      startTime.setDate(startTime.getDate() + 1);
    }
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + suggestion.duration);
    
    // Create new event from suggestion
    const newEvent: CareerEvent = {
      id: `event-${Date.now()}`,
      summary: suggestion.summary,
      description: suggestion.description + '\n\n[AI Suggested] ' + suggestion.reasoning,
      type: suggestion.type,
      priority: suggestion.priority,
      completed: false,
      aiSuggested: true,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
    };
    
    // Add to events list
    console.log('Adding AI suggestion to calendar:', newEvent);
    setEvents((prev) => {
      const updated = [...prev, newEvent].sort((a, b) => 
        new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
      );
      console.log('Updated events list:', updated.length, 'events');
      return updated;
    });
    
    // If it's for today, add to today's tasks
    const isToday = startTime.toDateString() === new Date().toDateString();
    if (isToday) {
      console.log('Event is for today, adding to today\'s tasks');
      setTodayTasks((prev) => [...prev, newEvent]);
      setStats((prev) => ({
        ...prev,
        totalToday: prev.totalToday + 1,
      }));
    }
    
    // Remove from suggestions
    setSuggestions((sug) => sug.filter((s) => s !== suggestion));
    
    toast({
      title: 'Event Added ✅',
      description: `${suggestion.summary} scheduled for ${startTime.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`,
    });
  };

  const handleEventClick = (event: CareerEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventEdit = (event: CareerEvent) => {
    toast({
      title: 'Edit Event',
      description: 'Event editing functionality coming soon!',
    });
  };

  const handleEventDelete = (event: CareerEvent) => {
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    setTodayTasks((prev) => prev.filter((e) => e.id !== event.id));
    toast({
      title: 'Event Deleted',
      description: `${event.summary} has been removed`,
      variant: 'destructive',
    });
  };

  const handleToggleComplete = (event: CareerEvent) => {
    const updatedEvent = { ...event, completed: !event.completed };
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? updatedEvent : e))
    );
    setTodayTasks((prev) =>
      prev.map((e) => (e.id === event.id ? updatedEvent : e))
    );
    setSelectedEvent(updatedEvent);
    
    if (updatedEvent.completed) {
      setStats((prev) => ({
        ...prev,
        completedToday: prev.completedToday + 1,
      }));
    } else {
      setStats((prev) => ({
        ...prev,
        completedToday: Math.max(0, prev.completedToday - 1),
      }));
    }
  };

  const handleCreateNewEvent = () => {
    // Create a new event at the selected date or today
    const startTime = new Date(selectedDate);
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(10, 0, 0, 0);
    
    const newEvent: CareerEvent = {
      id: `event-${Date.now()}`,
      summary: 'New Event',
      description: 'Click to add description',
      type: 'task',
      priority: 'medium',
      completed: false,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
    };
    
    console.log('Creating new manual event:', newEvent);
    setEvents((prev) => {
      const updated = [...prev, newEvent].sort((a, b) => 
        new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
      );
      console.log('Updated events list:', updated.length, 'events');
      return updated;
    });
    
    // If it's for today, add to today's tasks
    const isToday = startTime.toDateString() === new Date().toDateString();
    if (isToday) {
      console.log('New event is for today, adding to today\'s tasks');
      setTodayTasks((prev) => [...prev, newEvent]);
      setStats((prev) => ({
        ...prev,
        totalToday: prev.totalToday + 1,
      }));
    }
    
    // Open the event modal for editing
    setSelectedEvent(newEvent);
    setIsEventModalOpen(true);
    
    toast({
      title: 'Event Created ✅',
      description: 'Click the event to edit details',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-blue-400" />
              AI Career Calendar
            </h1>
            <p className="text-slate-400 mt-1">
              Smart scheduling powered by Gemini AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => loadCalendarData()}
              variant="outline"
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button 
              onClick={handleCreateNewEvent}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {stats.completedToday}/{stats.totalToday}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Tasks completed</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
                <Progress
                  value={(stats.completedToday / stats.totalToday) * 100}
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.streak}</p>
                    <p className="text-xs text-slate-400 mt-1">Days active</p>
                  </div>
                  <Award className="w-12 h-12 text-orange-400" />
                </div>
                <div className="flex gap-1 mt-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded ${
                        i < stats.streak ? 'bg-orange-400' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Productivity Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {stats.productivityScore}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">This week</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-400" />
                </div>
                <Progress value={stats.productivityScore} className="mt-3 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {suggestions.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">New ideas</p>
                  </div>
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                  size="sm"
                >
                  View All
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="w-5 h-5 text-blue-400" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {todayTasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-3" />
                      <p className="text-slate-400">All tasks completed! 🎉</p>
                    </motion.div>
                  ) : (
                    todayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          task.completed
                            ? 'bg-green-500/10 border-green-500/20'
                            : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50'
                        }`}
                        onClick={() => toggleTaskComplete(task.id)}
                      >
                        <div className="flex items-start gap-3">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getTypeIcon(task.type)}</span>
                              <h3
                                className={`font-medium ${
                                  task.completed
                                    ? 'text-slate-400 line-through'
                                    : 'text-white'
                                }`}
                              >
                                {task.summary}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(task.start.dateTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="mt-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">
                          {suggestion.summary}
                        </h3>
                        <p className="text-sm text-slate-400 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                          >
                            {suggestion.priority}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {suggestion.duration} min
                          </span>
                          <span className="text-xs text-slate-500">
                            {suggestion.suggestedTime}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addSuggestionToCalendar(suggestion)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-purple-400 italic">
                      💡 {suggestion.reasoning}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Calendar View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <CalendarGrid
                  events={events}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  onDateSelect={setSelectedDate}
                  onEventClick={handleEventClick}
                  selectedDate={selectedDate}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Event Detail Modal */}
        <EventDetailModal
          event={selectedEvent}
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedEvent(null);
          }}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
          onToggleComplete={handleToggleComplete}
        />
      </div>
    </div>
  );
}
