'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, XCircle, AlertCircle, Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  requestNotificationPermission, 
  hasNotificationPermission,
  sendBrowserNotification 
} from '@/lib/notifications';

export default function TestNotificationsPage() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [testTitle, setTestTitle] = useState('🔔 Test Notification');
  const [testBody, setTestBody] = useState('This is a test notification from CareerLens!');
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [notificationLog, setNotificationLog] = useState<string[]>([]);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = () => {
    if (typeof window === 'undefined') {
      setPermission('unsupported');
      return;
    }

    if (!('Notification' in window)) {
      setPermission('unsupported');
      addLog('❌ Browser does not support notifications');
      return;
    }

    const currentPermission = Notification.permission as 'granted' | 'denied' | 'default';
    setPermission(currentPermission);
    addLog(`ℹ️ Current permission: ${currentPermission}`);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setNotificationLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleRequestPermission = async () => {
    addLog('🔄 Requesting notification permission...');
    const granted = await requestNotificationPermission();
    
    if (granted) {
      setPermission('granted');
      addLog('✅ Notification permission granted!');
    } else {
      setPermission('denied');
      addLog('❌ Notification permission denied');
    }
  };

  const handleSendTest = () => {
    if (!hasNotificationPermission()) {
      addLog('⚠️ Cannot send notification - permission not granted');
      return;
    }

    addLog('📤 Sending test notification...');
    
    const notification = sendBrowserNotification(testTitle, {
      body: testBody,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    });

    if (notification) {
      setLastSent(new Date());
      addLog('✅ Test notification sent successfully!');
      
      notification.onclick = () => {
        addLog('👆 User clicked notification');
        window.focus();
      };

      notification.onclose = () => {
        addLog('🔕 Notification closed');
      };

      notification.onerror = (error) => {
        addLog(`❌ Notification error: ${error}`);
      };
    } else {
      addLog('❌ Failed to send notification');
    }
  };

  const handleSendCalendarReminder = () => {
    if (!hasNotificationPermission()) {
      addLog('⚠️ Cannot send notification - permission not granted');
      return;
    }

    const eventTitle = 'React Interview Prep';
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 5);

    addLog('📅 Sending calendar reminder...');
    
    const notification = sendBrowserNotification(`Reminder: ${eventTitle}`, {
      body: `Starting in 5 minutes at ${startTime.toLocaleTimeString()}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'calendar-reminder',
      requireInteraction: true,
      data: {
        type: 'calendar_reminder',
        eventId: 'test-event-1',
        startTime: startTime.toISOString()
      }
    });

    if (notification) {
      setLastSent(new Date());
      addLog('✅ Calendar reminder sent!');
      
      notification.onclick = () => {
        addLog('👆 Opening calendar...');
        window.location.href = '/calendar';
      };
    } else {
      addLog('❌ Failed to send calendar reminder');
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          text: 'Notifications Enabled',
          color: 'bg-green-500/10 border-green-500/30 text-green-400'
        };
      case 'denied':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          text: 'Notifications Blocked',
          color: 'bg-red-500/10 border-red-500/30 text-red-400'
        };
      case 'unsupported':
        return {
          icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
          text: 'Not Supported',
          color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        };
      default:
        return {
          icon: <Bell className="w-6 h-6 text-slate-500" />,
          text: 'Permission Required',
          color: 'bg-slate-500/10 border-slate-500/30 text-slate-400'
        };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-500" />
            Notification System Test
          </h1>
          <p className="text-slate-400">
            Test browser notifications and calendar reminders
          </p>
        </div>

        {/* Permission Status */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              {status.icon}
              Notification Permission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge className={`${status.color} border px-4 py-2 text-sm font-medium`}>
              {status.text}
            </Badge>

            {permission === 'default' && (
              <Button 
                onClick={handleRequestPermission}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Bell className="w-4 h-4 mr-2" />
                Request Permission
              </Button>
            )}

            {permission === 'denied' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  ⚠️ Notifications are blocked. To enable:
                </p>
                <ol className="text-sm text-slate-400 mt-2 space-y-1 list-decimal list-inside">
                  <li>Click the lock/info icon in the address bar</li>
                  <li>Find "Notifications" in permissions</li>
                  <li>Change from "Block" to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}

            {permission === 'unsupported' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400">
                  ❌ Your browser doesn't support notifications. Try using Chrome, Firefox, or Edge.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Custom Notification */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Send Test Notification</CardTitle>
            <CardDescription className="text-slate-400">
              Customize and send a test browser notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Title</Label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Notification title"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Body</Label>
              <Input
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                placeholder="Notification body text"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSendTest}
                disabled={permission !== 'granted'}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>

              <Button 
                onClick={handleSendCalendarReminder}
                disabled={permission !== 'granted'}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Send Calendar Reminder
              </Button>
            </div>

            {lastSent && (
              <p className="text-xs text-slate-500">
                Last sent: {lastSent.toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Activity Log</CardTitle>
            <CardDescription className="text-slate-400">
              Real-time notification events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
              {notificationLog.length === 0 ? (
                <p className="text-slate-600">No activity yet...</p>
              ) : (
                notificationLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-slate-400"
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-400">1. Permission Required</h3>
              <p className="text-sm text-slate-400">
                Browser notifications require user permission. Click "Request Permission" to enable.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-400">2. Test Notifications</h3>
              <p className="text-sm text-slate-400">
                Once enabled, you can send test notifications with custom titles and messages.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-400">3. Calendar Integration</h3>
              <p className="text-sm text-slate-400">
                Calendar reminders work the same way - they'll appear before your events start.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-400">4. Cloud Functions</h3>
              <p className="text-sm text-slate-400">
                Firebase Cloud Functions can send push notifications when new content is added (reviews, courses, mentors).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
