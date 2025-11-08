'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, FileText, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CareerEvent } from '@/lib/google-calendar-service';

interface EventEditModalProps {
  event: CareerEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CareerEvent) => void;
}

export function EventEditModal({
  event,
  isOpen,
  onClose,
  onSave,
}: EventEditModalProps) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    type: 'task' as CareerEvent['type'],
    priority: 'medium' as CareerEvent['priority'],
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  useEffect(() => {
    if (event) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);

      setFormData({
        summary: event.summary === 'New Event' ? '' : (event.summary || ''),
        description: event.description === 'Click to add description' ? '' : (event.description || ''),
        type: event.type || 'task',
        priority: event.priority || 'medium',
        location: event.location || '',
        startDate: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end.toISOString().split('T')[0],
        endTime: end.toTimeString().slice(0, 5),
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    const updatedEvent: CareerEvent = {
      ...event,
      summary: formData.summary,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      location: formData.location,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: event.start.timeZone || 'UTC',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: event.end.timeZone || 'UTC',
      },
    };

    onSave(updatedEvent);
    onClose();
  };

  if (!event) return null;

  // Check if this is a new event (default "New Event" title means it's new)
  const isNewEvent = event.summary === 'New Event' || event.summary === '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            {isNewEvent ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-slate-300">
              Event Title *
            </Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="e.g., Team Meeting"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: CareerEvent['type']) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="task">✅ Task</SelectItem>
                  <SelectItem value="learning">📚 Learning</SelectItem>
                  <SelectItem value="interview">💼 Interview</SelectItem>
                  <SelectItem value="networking">🤝 Networking</SelectItem>
                  <SelectItem value="deadline">⏰ Deadline</SelectItem>
                  <SelectItem value="meeting">📅 Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-300">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: CareerEvent['priority']) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this event..."
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-300">
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Add location or meeting link"
                className="bg-slate-800 border-slate-700 text-white pl-10"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Date & Time
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-slate-400 text-xs">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-slate-400 text-xs">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-slate-400 text-xs">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-slate-400 text-xs">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isNewEvent ? 'Add Event' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
