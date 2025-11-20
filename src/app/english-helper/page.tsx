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
import { getEnglishHelperStarterPrompt, getEnglishHelperFollowupResponse } from '@/lib/actions';

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
  const isAISpeakingRef = useRef(false);
  const isSessionActiveRef = useRef(false);
  const isMicActiveRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // User settings
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('intermediate');
  const [topic, setTopic] = useState<ConversationTopic>('daily');
  const [accent, setAccent] = useState<Accent>('american');
  const [showSettings, setShowSettings] = useState(false);

  // Persist settings to localStorage so options survive reloads/restarts
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('english-helper-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.proficiency) setProficiency(parsed.proficiency);
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.accent) setAccent(parsed.accent);
      }
    } catch (e) {
      console.warn('Could not read saved settings', e);
    }
  }, []);

  useEffect(() => {
    try {
      const toSave = { proficiency, topic, accent };
      window.localStorage.setItem('english-helper-settings', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  }, [proficiency, topic, accent]);

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
  const [browserSupported, setBrowserSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Sync refs with state for use in event handlers
  useEffect(() => {
    isAISpeakingRef.current = isAISpeaking;
  }, [isAISpeaking]);

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    isMicActiveRef.current = isMicActive;
  }, [isMicActive]);

  // Helper function to safely restart recognition with debouncing
  const safeRestartRecognition = useCallback((delayMs: number = 500) => {
    // Clear any pending restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    // Check conditions
    if (!isMicActiveRef.current || !isSessionActiveRef.current || isAISpeakingRef.current) {
      console.log('⏭️ Skipping restart - conditions not met');
      return;
    }
    
    // Schedule restart
    restartTimeoutRef.current = setTimeout(() => {
      try {
        if (!isRecognitionRunning.current && !isAISpeakingRef.current && isMicActiveRef.current && isSessionActiveRef.current) {
          recognitionRef.current?.start();
          console.log('🔄 Recognition safely restarted');
        }
      } catch (error: any) {
        // Ignore "already started" errors
        if (!error.message?.includes('already started')) {
          console.log('⚠️ Restart error:', error.message);
        }
      }
      restartTimeoutRef.current = null;
    }, delayMs);
  }, []);

  // Request camera and microphone permissions
  const requestPermissions = async () => {
    try {
      // Stop any existing stream first
      if (mediaStreamRef.current) {
        console.log('🔄 Stopping existing media stream...');
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      
      // Check if running in secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        throw new Error('This feature requires a secure context (HTTPS). Please access the site via HTTPS.');
      }
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access. Please use Chrome, Edge, or Safari.');
      }
      
      console.log('🎥 Requesting camera and microphone permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log('✅ Permissions granted!');
      console.log('🎤 Microphone track:', stream.getAudioTracks()[0]?.label);
      console.log('📹 Camera track:', stream.getVideoTracks()[0]?.label);
      
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionsGranted(true);
      setIsCameraActive(true);
      setIsMicActive(true);
      isMicActiveRef.current = true;
      
      console.log('🎬 Media devices ready for session');
    } catch (error: any) {
      console.error('❌ Permission denied:', error);
      let errorMsg = 'Camera and microphone access is required for this feature.';
      
      if (error.name === 'NotAllowedError') {
        errorMsg += ' Please allow access in your browser settings and reload the page.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += ' No camera or microphone found. Please connect a device.';
      } else if (error.name === 'NotReadableError') {
        errorMsg += ' Your camera or microphone is already in use by another application.';
      } else if (error.message?.includes('secure')) {
        errorMsg = 'This feature requires HTTPS. Please access the site via a secure connection.';
      }
      
      alert(errorMsg);
      throw error; // Re-throw to prevent session from starting
    }
  };

  // Initialize speech recognition with hands-free auto-submit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for secure context (HTTPS)
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setBrowserSupported(false);
        setErrorMessage('⚠️ This feature requires HTTPS. Please access the site via a secure connection.');
        console.error('❌ Not a secure context - HTTPS required');
        return;
      }
      
      // Check for Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setBrowserSupported(false);
        setErrorMessage('⚠️ Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
        console.error('❌ Web Speech API not supported in this browser');
        return;
      }
      
      // Check for getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setBrowserSupported(false);
        setErrorMessage('⚠️ Your browser does not support camera/microphone access. Please use a modern browser.');
        console.error('❌ getUserMedia not supported');
        return;
      }
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          isRecognitionRunning.current = true;
          setIsListening(true);
          console.log('✅ Speech recognition started - LISTENING TO YOU NOW');
        };

        recognitionRef.current.onresult = (event: any) => {
          // Skip if AI is currently speaking to avoid picking up AI voice
          if (isAISpeakingRef.current) {
            console.log('Ignoring recognition during AI speech');
            return;
          }

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
          console.log('Speech recognized:', fullText);
          setCurrentUserText(fullText);
          currentTextRef.current = fullText;
          
          // If we got final results, set up auto-submit timer (2 seconds of silence)
          if (finalTranscript.trim()) {
            console.log('Final transcript received:', finalTranscript);
            // Clear any existing timer
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            
            // Set new timer for 2 seconds of silence
            silenceTimerRef.current = setTimeout(() => {
              const textToSubmit = currentTextRef.current;
              if (textToSubmit.trim()) {
                console.log('Auto-submitting after silence:', textToSubmit);
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
          setIsListening(false);
          console.log('⏸️ Speech recognition ended');
          console.log('📊 State - Mic:', isMicActiveRef.current, 'Session:', isSessionActiveRef.current, 'AI Speaking:', isAISpeakingRef.current);
          
          // Clear any pending auto-restart
          if (autoRestartTimeoutRef.current) {
            clearTimeout(autoRestartTimeoutRef.current);
            autoRestartTimeoutRef.current = null;
          }
          
          // Only restart if session is active and we're not in the middle of something
          if (isMicActiveRef.current && isSessionActiveRef.current && !isAISpeakingRef.current) {
            // Schedule auto-restart with delay to prevent rapid loops
            autoRestartTimeoutRef.current = setTimeout(() => {
              // Double-check conditions before actually restarting
              if (isMicActiveRef.current && isSessionActiveRef.current && !isAISpeakingRef.current && !isRecognitionRunning.current) {
                try {
                  recognitionRef.current?.start();
                  console.log('🔄 Recognition auto-restarted');
                } catch (error: any) {
                  if (!error.message?.includes('already started')) {
                    console.log('⚠️ Auto-restart error:', error.message);
                  }
                }
              } else {
                console.log('⏭️ Auto-restart cancelled - conditions changed');
              }
            }, 300);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          // Don't log "aborted" as error - it's normal when stopping/restarting
          if (event.error !== 'aborted') {
            console.error('Speech recognition error:', event.error);
          } else {
            console.log('ℹ️ Recognition aborted (normal during restart)');
          }
          
          isRecognitionRunning.current = false;
          setIsListening(false);
          
          // Clear timer on error
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Only restart on no-speech error (user didn't speak)
          // Don't restart on abort (happens during normal stop/start cycle)
          if (event.error === 'no-speech') {
            console.log('🔄 No speech detected, restarting...');
            safeRestartRecognition(500); // Use safe restart with debouncing
          } else if (event.error === 'aborted') {
            // Aborted is normal during restart - don't restart again
            console.log('⏭️ Aborted - waiting for manual restart');
          }
        };
      }
    }
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [isMicActive, isSessionActive, isAISpeaking, safeRestartRecognition]);

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
    console.log('🎬 Starting new session...');
    
    // Always request fresh permissions (even if previously granted)
    // This ensures camera and mic are properly initialized
    try {
      await requestPermissions();
      console.log('✅ Permissions granted, starting session');
    } catch (error) {
      console.error('❌ Failed to get permissions:', error);
      return; // Don't start session if permissions denied
    }
    
    setIsSessionActive(true);
    isSessionActiveRef.current = true;
    
    // Get AI-generated greeting from Gemini
    console.log('🤖 Requesting AI greeting from Gemini...');
    const response = await getEnglishHelperStarterPrompt({
      topic,
      proficiency,
      accent,
    });
    
    if (response.success && response.data) {
      console.log('✅ AI greeting received:', response.data.greeting);
      setTranscript([{
        speaker: 'ai',
        text: response.data.greeting,
        timestamp: new Date(),
      }]);
      speakText(response.data.greeting);
    } else {
      console.error('❌ Failed to get AI greeting:', response.error);
      // Fallback to default greeting
      const fallbackGreeting = `Hello! I'm your English practice assistant. Let's work on your ${topic} conversation skills. How are you doing today?`;
      setTranscript([{
        speaker: 'ai',
        text: fallbackGreeting,
        timestamp: new Date(),
      }]);
      speakText(fallbackGreeting);
    }
  };

  // End session
  const endSession = () => {
    console.log('🛑 Ending session and releasing media resources');
    
    // Clear all timeouts
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (autoRestartTimeoutRef.current) {
      clearTimeout(autoRestartTimeoutRef.current);
      autoRestartTimeoutRef.current = null;
      console.log('Cleared auto-restart timeout');
    }
    
    // Stop speech recognition
    if (recognitionRef.current && isRecognitionRunning.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
    
    // Stop all media tracks (camera and microphone)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track:`, track.label);
      });
      mediaStreamRef.current = null;
    }
    
    // Reset all states
    setIsSessionActive(false);
    setIsMicActive(false);
    setIsCameraActive(false);
    setPermissionsGranted(false); // IMPORTANT: Reset permissions so they're requested again
    setIsAISpeaking(false);
    
    // Update refs
    isSessionActiveRef.current = false;
    isMicActiveRef.current = false;
    isAISpeakingRef.current = false;
    isRecognitionRunning.current = false;
    
    console.log('✅ Session ended, all resources released');
    setShowSummary(true);
  };

  // Text-to-speech for AI responses
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      console.log('AI starting to speak:', text.substring(0, 50) + '...');
      
      // Stop speech recognition while AI is speaking
      setIsAISpeaking(true);
      if (recognitionRef.current && isRecognitionRunning.current) {
        try {
          recognitionRef.current.stop();
          console.log('Recognition stopped for AI speech');
        } catch (error) {
          console.log('Error stopping recognition:', error);
        }
      }

      // Temporarily mute microphone to prevent echo/feedback
      const wasMicActive = isMicActive;
      if (mediaStreamRef.current && wasMicActive) {
        mediaStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang =
        accent === 'american' ? 'en-US' : accent === 'british' ? 'en-GB' : accent === 'australian' ? 'en-AU' : 'en-US';
      utterance.rate = 0.9;
      
      utterance.onstart = () => {
        console.log('AI speech started');
      };

      utterance.onend = () => {
        console.log('✅ AI speech ended');
        
        // Re-enable microphone IMMEDIATELY
        if (mediaStreamRef.current && wasMicActive) {
          mediaStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = true;
          });
          console.log('🎤 Microphone re-enabled');
        }

        setIsAISpeaking(false);
        isAISpeakingRef.current = false;
        
        console.log('📊 State after AI speech - Mic:', isMicActiveRef.current, 'Session:', isSessionActiveRef.current);
        
        // Immediate aggressive restart for smooth hands-free experience
        setTimeout(() => {
          if (isMicActiveRef.current && isSessionActiveRef.current && !isAISpeakingRef.current) {
            try {
              // Force stop any existing recognition first
              if (isRecognitionRunning.current) {
                recognitionRef.current?.stop();
              }
              
              // Use safe restart to prevent rapid restart loops
              safeRestartRecognition(400);
            } catch (error: any) {
              console.log('⚠️ Restart attempt:', error.message);
            }
          }
        }, 200); // Minimal delay for smooth transition
      };

      utterance.onerror = (error) => {
        console.error('❌ Speech synthesis error:', error);
        setIsAISpeaking(false);
        isAISpeakingRef.current = false;
        
        // Re-enable microphone on error
        if (mediaStreamRef.current && wasMicActive) {
          mediaStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = true;
          });
          console.log('🎤 Microphone re-enabled after error');
        }
        
        // Restart after AI speech ends using safe restart
        safeRestartRecognition(400);
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

    // Call Gemini AI for real conversation and feedback
    console.log('🤖 Sending to Gemini AI:', textToSubmit);
    const transcriptForAI = [...transcript, userMessage].map(item => ({
      speaker: item.speaker,
      text: item.text,
      timestamp: item.timestamp.toISOString(),
    }));

    const response = await getEnglishHelperFollowupResponse({
      transcript: transcriptForAI,
      topic,
      proficiency,
    });

    if (response.success && response.data) {
      console.log('✅ AI response received:', response.data.response);
      console.log('📊 Feedback:', response.data.feedback);
      
      const aiMessage = {
        speaker: 'ai' as const,
        text: response.data.response,
        timestamp: new Date(),
      };
      setTranscript(prev => [...prev, aiMessage]);
      speakText(response.data.response);

      // Convert AI feedback to FeedbackItem format
      const newFeedback: FeedbackItem[] = [
        ...response.data.feedback.grammar.issues.map(issue => ({
          type: 'grammar' as const,
          message: issue,
          severity: 'error' as const,
        })),
        ...response.data.feedback.vocabulary.suggestions.map(suggestion => ({
          type: 'vocabulary' as const,
          message: suggestion,
          severity: 'info' as const,
        })),
        ...response.data.feedback.pronunciation.tips.map(tip => ({
          type: 'pronunciation' as const,
          message: tip,
          severity: 'info' as const,
        })),
        ...response.data.feedback.fluency.observations.map(obs => ({
          type: 'fluency' as const,
          message: obs,
          severity: 'info' as const,
        })),
      ];
      
      setFeedback(newFeedback);

      // Update stats with real AI scores
      const feedback = response.data!.feedback;
      setSessionStats(prev => ({
        ...prev,
        wordsSpoken: prev.wordsSpoken + textToSubmit.split(' ').length,
        grammarScore: feedback.grammar.score,
        pronunciationScore: feedback.pronunciation.score,
        fluencyScore: feedback.fluency.score,
        overallScore: Math.round((
          feedback.grammar.score +
          feedback.pronunciation.score +
          feedback.fluency.score
        ) / 3),
      }));

      // Check if session should end
      if (response.data.isEndOfSession) {
        console.log('🏁 AI indicated session should end');
        setTimeout(() => {
          endSession();
        }, 3000); // Give time for last AI response to finish speaking
      }
    } else {
      console.error('❌ AI response failed:', response.error);
      // Fallback to mock response if AI fails
      const aiResponse = generateAIResponse(textToSubmit, topic);
      const aiMessage = {
        speaker: 'ai' as const,
        text: aiResponse,
        timestamp: new Date(),
      };
      setTranscript(prev => [...prev, aiMessage]);
      speakText(aiResponse);

      const newFeedback = generateFeedback(textToSubmit);
      setFeedback(newFeedback);

      setSessionStats(prev => ({
        ...prev,
        wordsSpoken: prev.wordsSpoken + textToSubmit.split(' ').length,
      }));
    }
  }, [currentUserText, isAISpeaking, topic, proficiency, transcript]);

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

  // Cleanup all resources on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up English Helper component...');
      
      // Clear all timeouts
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (autoRestartTimeoutRef.current) clearTimeout(autoRestartTimeoutRef.current);
      
      // Stop recognition
      if (recognitionRef.current && isRecognitionRunning.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      
      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
        {/* Browser Compatibility Warning */}
        {!browserSupported && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border-2 border-destructive/50 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">Feature Not Available</h3>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Requirements:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>HTTPS connection (or localhost for development)</li>
                    <li>Modern browser (Chrome, Edge, or Safari recommended)</li>
                    <li>Microphone and camera permissions</li>
                  </ul>
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
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
                      disabled={!browserSupported}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {browserSupported ? 'Start Practice Session' : 'Browser Not Supported'}
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

                {/* Listening Indicator */}
                {isListening && !currentUserText && !isAISpeaking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-green-500 rounded-full"
                      />
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        🎤 Listening... Speak now!
                      </p>
                    </div>
                  </motion.div>
                )}

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
