'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Volume2,
  Settings,
  Play,
  Pause,
  BarChart3,
  BookOpen,
  Award,
  TrendingUp,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Languages,
  Briefcase,
  Plane,
  Code,
  MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

type ProficiencyLevel = 'basic' | 'intermediate' | 'advanced';
type ConversationTopic = 'daily' | 'interview' | 'travel' | 'technical' | 'idioms' | 'debate';
type Accent = 'american' | 'british' | 'australian' | 'neutral';

interface FeedbackItem {
  type: 'grammar' | 'pronunciation' | 'vocabulary' | 'fluency';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface SessionStats {
  duration: number;
  wordsSpoken: number;
  vocabularyUsed: string[];
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  overallScore: number;
}

export default function EnglishHelperPage() {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const isRecognitionRunning = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTextRef = useRef<string>('');

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // User settings
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('intermediate');
  const [topic, setTopic] = useState<ConversationTopic>('daily');
  const [accent, setAccent] = useState<Accent>('american');
  const [showSettings, setShowSettings] = useState(false);

  // Conversation state
  const [transcript, setTranscript] = useState<Array<{ speaker: 'user' | 'ai'; text: string; timestamp: Date }>>([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    duration: 0,
    wordsSpoken: 0,
    vocabularyUsed: [],
    grammarScore: 85,
    pronunciationScore: 78,
    fluencyScore: 82,
    overallScore: 82,
  });

  // UI state
  const [showSummary, setShowSummary] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Request camera and microphone permissions
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionsGranted(true);
      setIsCameraActive(true);
      setIsMicActive(true);
    } catch (error) {
      console.error('Permission denied:', error);
      alert('Camera and microphone access is required for this feature.');
    }
  };

  // Initialize speech recognition with hands-free auto-submit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          isRecognitionRunning.current = true;
          console.log('Speech recognition started');
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          // Separate final and interim results for better UX
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update displayed text with both final and interim
          const fullText = (finalTranscript + interimTranscript).trim();
          setCurrentUserText(fullText);
          currentTextRef.current = fullText;
          
          // If we got final results, set up auto-submit timer (2 seconds of silence)
          if (finalTranscript.trim()) {
            // Clear any existing timer
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            
            // Set new timer for 2 seconds of silence
            silenceTimerRef.current = setTimeout(() => {
              const textToSubmit = currentTextRef.current;
              if (textToSubmit.trim()) {
                // Trigger submit via state update
                setCurrentUserText(prev => {
                  if (prev.trim()) {
                    // Create a flag to trigger submission
                    window.dispatchEvent(new CustomEvent('autosubmit', { detail: prev }));
                  }
                  return prev;
                });
              }
            }, 2000);
          }
        };

        recognitionRef.current.onend = () => {
          isRecognitionRunning.current = false;
          console.log('Speech recognition ended');
          // Auto-restart if mic is active, session is running, and AI is not speaking
          if (isMicActive && isSessionActive && !isAISpeaking) {
            setTimeout(() => {
              try {
                if (!isRecognitionRunning.current) {
                  recognitionRef.current.start();
                  console.log('Restarting recognition...');
                }
              } catch (error) {
                console.log('Recognition restart failed:', error);
              }
            }, 100);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          isRecognitionRunning.current = false;
          // Clear timer on error
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Auto-restart on certain errors
          if (event.error === 'no-speech' || event.error === 'aborted') {
            if (isMicActive && isSessionActive && !isAISpeaking) {
              setTimeout(() => {
                try {
                  if (!isRecognitionRunning.current) {
                    recognitionRef.current.start();
                    console.log('Restarting after error...');
                  }
                } catch (error) {
                  console.log('Could not restart after error:', error);
                }
              }, 500);
            }
          }
        };
      }
    }
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [isMicActive, isSessionActive, isAISpeaking]);

  // Start/stop speech recognition
  useEffect(() => {
    if (recognitionRef.current) {
      if (isMicActive && isSessionActive) {
        if (!isRecognitionRunning.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.log('Recognition start error:', error);
          }
        }
      } else {
        if (isRecognitionRunning.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            console.log('Recognition stop error:', error);
          }
        }
      }
    }
  }, [isMicActive, isSessionActive]);

  // Toggle microphone
  const toggleMic = () => {
    setIsMicActive(!isMicActive);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMicActive;
      });
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isCameraActive;
      });
    }
  };

  // Start session
  const startSession = async () => {
    if (!permissionsGranted) {
      await requestPermissions();
    }
    setIsSessionActive(true);
    setTranscript([{
      speaker: 'ai',
      text: `Hello! I'm your English practice assistant. Let's work on your ${topic} conversation skills. How are you doing today?`,
      timestamp: new Date(),
    }]);
    speakText(`Hello! I'm your English practice assistant. Let's work on your ${topic} conversation skills. How are you doing today?`);
  };

  // End session
  const endSession = () => {
    setIsSessionActive(false);
    setIsMicActive(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowSummary(true);
  };

  // Text-to-speech for AI responses
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop speech recognition while AI is speaking
      setIsAISpeaking(true);
      if (recognitionRef.current && isRecognitionRunning.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping recognition:', error);
        }
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent === 'american' ? 'en-US' : accent === 'british' ? 'en-GB' : 'en-AU';
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsAISpeaking(false);
        // Resume speech recognition after AI finishes speaking
        if (isMicActive && isSessionActive && recognitionRef.current) {
          setTimeout(() => {
            try {
              if (!isRecognitionRunning.current) {
                recognitionRef.current.start();
              }
            } catch (error) {
              console.log('Error restarting recognition after AI speech:', error);
            }
          }, 500);
        }
      };
      speechSynthesis.speak(utterance);
    }
  };

  // Submit user speech for AI response
  const submitSpeech = useCallback(async (textOverride?: string) => {
    const textToSubmit = textOverride || currentUserText;
    if (!textToSubmit.trim() || isAISpeaking) return;

    setCurrentUserText(''); // Clear immediately to prevent double submission
    currentTextRef.current = '';

    const userMessage = {
      speaker: 'user' as const,
      text: textToSubmit,
      timestamp: new Date(),
    };
    setTranscript(prev => [...prev, userMessage]);

    // Simulate AI response (in production, call your AI API)
    setTimeout(() => {
      const aiResponse = generateAIResponse(textToSubmit, topic);
      const aiMessage = {
        speaker: 'ai' as const,
        text: aiResponse,
        timestamp: new Date(),
      };
      setTranscript(prev => [...prev, aiMessage]);
      speakText(aiResponse);

      // Generate feedback
      const newFeedback = generateFeedback(textToSubmit);
      setFeedback(newFeedback);

      // Update stats
      setSessionStats(prev => ({
        ...prev,
        wordsSpoken: prev.wordsSpoken + textToSubmit.split(' ').length,
      }));
    }, 1000);
  }, [currentUserText, isAISpeaking, topic]);

  // Listen for autosubmit events
  useEffect(() => {
    const handleAutoSubmit = (event: any) => {
      const textToSubmit = event.detail;
      if (textToSubmit && !isAISpeaking) {
        submitSpeech(textToSubmit);
      }
    };

    window.addEventListener('autosubmit', handleAutoSubmit);
    return () => {
      window.removeEventListener('autosubmit', handleAutoSubmit);
    };
  }, [submitSpeech, isAISpeaking]);

  // Generate AI response (mock - replace with actual AI API)
  const generateAIResponse = (userText: string, topic: ConversationTopic): string => {
    const responses: Record<ConversationTopic, string[]> = {
      daily: [
        "That's interesting! Can you tell me more about your daily routine?",
        "I see. How do you usually spend your weekends?",
        "Great! What's your favorite activity during the day?",
      ],
      interview: [
        "Excellent point! Now, can you describe a challenging situation you've overcome?",
        "That's a strong answer. What are your greatest strengths?",
        "Good! How do you handle pressure in the workplace?",
      ],
      travel: [
        "Sounds exciting! What's your dream travel destination?",
        "Interesting! How do you usually prepare for a trip?",
        "Great! What's the most memorable place you've visited?",
      ],
      technical: [
        "Good explanation. Can you elaborate on the technical details?",
        "I understand. How would you explain this to a non-technical person?",
        "Excellent! What challenges did you face in this project?",
      ],
      idioms: [
        "Perfect use of that idiom! Can you use 'break the ice' in a sentence?",
        "Great! Now try using 'piece of cake' in context.",
        "Wonderful! Let's practice 'hit the nail on the head'.",
      ],
      debate: [
        "Interesting perspective! What evidence supports your argument?",
        "I see your point. However, have you considered the opposing view?",
        "Strong argument! Can you provide an example?",
      ],
    };

    const topicResponses = responses[topic];
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  };

  // Generate feedback (mock - replace with actual analysis)
  const generateFeedback = (text: string): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    // Grammar check (simplified)
    if (text.toLowerCase().includes('i is') || text.toLowerCase().includes('he go')) {
      feedback.push({
        type: 'grammar',
        message: 'Subject-verb agreement error detected',
        severity: 'error',
      });
    }

    // Vocabulary
    const advancedWords = ['consequently', 'furthermore', 'nevertheless', 'moreover'];
    const hasAdvancedVocab = advancedWords.some(word => text.toLowerCase().includes(word));
    if (hasAdvancedVocab) {
      feedback.push({
        type: 'vocabulary',
        message: 'Great use of advanced vocabulary!',
        severity: 'info',
      });
    }

    // Fluency
    if (text.split(' ').length > 20) {
      feedback.push({
        type: 'fluency',
        message: 'Good sentence length and fluency',
        severity: 'info',
      });
    }

    return feedback;
  };

  const topics = [
    { value: 'daily' as ConversationTopic, label: 'Daily Life', icon: MessageSquare },
    { value: 'interview' as ConversationTopic, label: 'Interview Prep', icon: Briefcase },
    { value: 'travel' as ConversationTopic, label: 'Travel', icon: Plane },
    { value: 'technical' as ConversationTopic, label: 'Technical', icon: Code },
    { value: 'idioms' as ConversationTopic, label: 'Idioms', icon: BookOpen },
    { value: 'debate' as ConversationTopic, label: 'Debate', icon: MessageCircle },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                English Helper
              </h1>
              <p className="text-muted-foreground">Practice English with AI-powered conversation</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video and Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                {/* Video Preview */}
                <div className="relative aspect-video bg-black/90 rounded-xl overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <VideoOff className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  {isAISpeaking && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-blue-500/90 rounded-full">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">AI Speaking...</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!isSessionActive ? (
                    <Button
                      size="lg"
                      onClick={startSession}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Practice Session
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={isMicActive ? 'default' : 'outline'}
                        size="lg"
                        onClick={toggleMic}
                        className={isMicActive ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant={isCameraActive ? 'default' : 'outline'}
                        size="lg"
                        onClick={toggleCamera}
                      >
                        {isCameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={endSession}
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        End Session
                      </Button>
                    </>
                  )}
                </div>

                {/* Current Speech */}
                {currentUserText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-primary/10 rounded-lg"
                  >
                    <p className="text-sm text-muted-foreground mb-1">You're saying:</p>
                    <p className="font-medium">{currentUserText}</p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Will submit automatically when you pause...
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transcript.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.speaker === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.speaker === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {msg.speaker === 'user' ? 'You' : 'AI Assistant'}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Topic Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Practice Topic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topics.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={topic === value ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setTopic(value)}
                    disabled={isSessionActive}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Live Feedback */}
            {feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Live Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {feedback.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-3 rounded-lg border ${
                        item.severity === 'error'
                          ? 'bg-red-500/10 border-red-500/50'
                          : item.severity === 'warning'
                          ? 'bg-yellow-500/10 border-yellow-500/50'
                          : 'bg-green-500/10 border-green-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {item.severity === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-medium capitalize">{item.type}</p>
                          <p className="text-sm">{item.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Session Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Session Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Grammar</span>
                    <span className="font-medium">{sessionStats.grammarScore}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${sessionStats.grammarScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Pronunciation</span>
                    <span className="font-medium">{sessionStats.pronunciationScore}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${sessionStats.pronunciationScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fluency</span>
                    <span className="font-medium">{sessionStats.fluencyScore}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${sessionStats.fluencyScore}%` }}
                    />
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Words Spoken</span>
                    <span className="text-lg font-bold">{sessionStats.wordsSpoken}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 max-w-md w-full border-2 border-primary/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Proficiency Level */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Proficiency Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['basic', 'intermediate', 'advanced'] as ProficiencyLevel[]).map((level) => (
                        <Button
                          key={level}
                          variant={proficiency === level ? 'default' : 'outline'}
                          onClick={() => setProficiency(level)}
                          className="capitalize"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Preference */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Preferred Accent</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['american', 'british', 'australian', 'neutral'] as Accent[]).map((acc) => (
                        <Button
                          key={acc}
                          variant={accent === acc ? 'default' : 'outline'}
                          onClick={() => setAccent(acc)}
                          className="capitalize"
                        >
                          {acc}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Privacy Note:</strong> All audio/video processing is done locally in your browser.
                    Your data is not stored or shared.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Modal */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSummary(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 max-w-2xl w-full border-2 border-primary/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-500" />
                    Session Summary
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowSummary(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                    <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                    <p className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {sessionStats.overallScore}%
                    </p>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-500/10 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Grammar</p>
                      <p className="text-2xl font-bold text-green-500">{sessionStats.grammarScore}%</p>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Pronunciation</p>
                      <p className="text-2xl font-bold text-blue-500">{sessionStats.pronunciationScore}%</p>
                    </div>
                    <div className="text-center p-4 bg-purple-500/10 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Fluency</p>
                      <p className="text-2xl font-bold text-purple-500">{sessionStats.fluencyScore}%</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Words Spoken</p>
                      <p className="text-2xl font-bold">{sessionStats.wordsSpoken}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="text-2xl font-bold">{Math.floor(sessionStats.duration / 60)} min</p>
                    </div>
                  </div>

                  {/* Improvement Tips */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Improvement Tips
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Practice speaking more slowly for better pronunciation</li>
                      <li>• Use more advanced vocabulary to improve your score</li>
                      <li>• Work on subject-verb agreement in complex sentences</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowSummary(false);
                      startSession();
                    }}
                  >
                    Start New Session
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
