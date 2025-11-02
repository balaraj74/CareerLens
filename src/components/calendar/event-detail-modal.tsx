'use client';

import { motion } from 'framer-motion';
import { X, Clock, MapPin, Users, Edit, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CareerEvent } from '@/lib/google-calendar-service';

interface EventDetailModalProps {
  event: CareerEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CareerEvent) => void;
  onDelete?: (event: CareerEvent) => void;
  onToggleComplete?: (event: CareerEvent) => void;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
}: EventDetailModalProps) {
  if (!event) return null;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = () => {
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white">
            <span className="text-3xl">{getTypeIcon(event.type)}</span>
            {event.summary}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4"
        >
          {/* Status and Priority */}
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`${getPriorityColor(event.priority)} capitalize`}
            >
              {event.priority} Priority
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize"
            >
              {event.type}
            </Badge>
            {event.completed && (
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-400 border-green-500/20"
              >
                ✓ Completed
              </Badge>
            )}
            {event.aiSuggested && (
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-400 border-purple-500/20"
              >
                ✨ AI Suggested
              </Badge>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
              <p className="text-slate-300 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Date & Time</span>
              </div>
              <div className="text-white">
                <div className="font-medium">{formatDate(event.start.dateTime)}</div>
                <div className="text-sm text-slate-400 mt-1">
                  {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Duration: {getDuration()}
                </div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <div className="text-white">{event.location}</div>
              </div>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 md:col-span-2">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Attendees</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.attendees.map((attendee, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-slate-700/50 text-slate-300 border-slate-600"
                    >
                      {attendee.email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reminders */}
          {event.reminders && !event.reminders.useDefault && event.reminders.overrides && (
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <h3 className="text-sm font-medium text-purple-400 mb-2">🔔 Reminders</h3>
              <div className="flex flex-wrap gap-2">
                {event.reminders.overrides.map((reminder, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-purple-500/10 text-purple-300 border-purple-500/20"
                  >
                    {reminder.method}: {reminder.minutes} min before
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
            {onToggleComplete && (
              <Button
                onClick={() => onToggleComplete(event)}
                className={`flex-1 ${
                  event.completed
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                {event.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </Button>
            )}
            {onEdit && (
              <Button
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 border-blue-500"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => {
                  onDelete(event);
                  onClose();
                }}
                variant="outline"
                className="bg-red-600 hover:bg-red-700 border-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
