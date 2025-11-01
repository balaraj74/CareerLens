
'use client';
import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/hooks/use-auth';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { getAiInterviewerResponse, getAiInterviewerFollowup } from '@/lib/actions';
import { logCareerActivity } from '@/lib/career-graph-service';
import type { TranscriptItem } from '@/ai/schemas/ai-interviewer-flow';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { InterviewPanel } from './InterviewPanel';
import { ControlBar } from './ControlBar';
import { ChatBubble } from './ChatBubble';
import { ScrollArea } from '@/components/ui/scroll-area';


export function AiInterviewerPage() {
    const { user } = useAuth();
    const { db } = useFirebase();
    const { toast } = useToast();
    
    // Component State
    const [interviewState, setInterviewState] = useState<'idle' | 'starting' | 'in_progress' | 'finished'>('idle');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    
    // Media & Permissions
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isAwaitingAI, setIsAwaitingAI] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Refs for media elements
    const userVideoRef = useRef<HTMLVideoElement>(null);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const { transcript: speechTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    
    // --- Effects ---

    useEffect(() => {
        // This effect ensures the video stream is correctly attached to the video element.
        if (stream && userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    // This effect handles automatically sending the user's response after a pause in speech.
    useEffect(() => {
        if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
        }

        // Only auto-send if we have some speech and we're actively listening
        if (speechTranscript && listening && !isAwaitingAI && !isSpeaking) {
            speechTimeoutRef.current = setTimeout(() => {
                handleUserResponse();
            }, 1500); // Reduced to 1.5 seconds for faster response
        }

        return () => {
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speechTranscript, listening, isAwaitingAI, isSpeaking]);

    // --- Core Functions ---
    
    const startInterview = async () => {
        setInterviewState('starting');
        // 1. Get Camera/Mic Permissions
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
            setStream(mediaStream);
            setHasPermission(true);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Camera and microphone access is required.' });
            setInterviewState('idle');
            return;
        }
        
        // 2. Set state and get first question
        setInterviewState('in_progress');
        setIsAwaitingAI(true);
        const response = await getAiInterviewerResponse({
            interviewType: 'mixed', // Example
            jobDescription: 'Software Engineer',
            avatarType: 'HR',
        });
        setIsAwaitingAI(false);

        if (response.success && response.data) {
            setTranscript([{ speaker: 'ai', text: response.data.firstQuestion, timestamp: new Date().toISOString() }]);
            speak(response.data.firstQuestion);
        } else {
            toast({ variant: 'destructive', title: 'Could not start interview.', description: response.error });
            setInterviewState('idle');
        }
    };

    const speak = (text: string, onEndCallback?: () => void) => {
        // Stop listening while AI is speaking
        if (listening) {
          SpeechRecognition.stopListening();
        }
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice properties for faster, more natural speech
        utterance.rate = 1.1; // Slightly faster
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            // Immediately start listening again after AI finishes speaking
            setTimeout(() => {
                if (browserSupportsSpeechRecognition && !listening) {
                    SpeechRecognition.startListening({ continuous: true });
                }
                if (onEndCallback) {
                    onEndCallback();
                }
            }, 300); // Small delay to ensure smooth transition
        };
        
        utterance.onerror = (e) => {
            setIsSpeaking(false);
             toast({
                variant: 'destructive',
                title: 'Text-to-Speech Error',
                description: `Could not play audio: ${e.error}`
            });
            // Still restart listening on error
            setTimeout(() => {
                if (browserSupportsSpeechRecognition && !listening) {
                    SpeechRecognition.startListening({ continuous: true });
                }
                if (onEndCallback) {
                    onEndCallback();
                }
            }, 300);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleUserResponse = async () => {
        if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
        }
        if (!speechTranscript.trim() || isAwaitingAI) return;

        SpeechRecognition.stopListening();
        setIsAwaitingAI(true);

        const userResponseText = speechTranscript.trim();
        resetTranscript();

        const newTranscript: TranscriptItem[] = [...transcript, { speaker: 'user', text: userResponseText, timestamp: new Date().toISOString() }];
        setTranscript(newTranscript);

        const response = await getAiInterviewerFollowup({
            transcript: newTranscript,
            jobDescription: 'Software Engineer',
            avatarType: 'HR',
        });
        
        setIsAwaitingAI(false);

        if (response.success && response.data) {
             setTranscript(prev => [...prev, { speaker: 'ai', text: response.data!.followUp, timestamp: new Date().toISOString() }]);
             
             if (response.data.isEndOfInterview) {
                 speak(response.data.followUp, endInterview);
             } else {
                 speak(response.data.followUp);
             }
        } else {
            toast({ variant: 'destructive', title: 'Error getting response', description: response.error });
            // If AI fails, restart listening
            setTimeout(() => {
                if (!listening && browserSupportsSpeechRecognition) {
                    SpeechRecognition.startListening({ continuous: true });
                }
            }, 500);
        }
    };
    
    // --- Control Handlers ---

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };
    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsCameraOff(!isCameraOff);
        }
    };
     const endInterview = async () => {
        speechSynthesis.cancel();
        SpeechRecognition.stopListening();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setHasPermission(false);
        setInterviewState('finished');
        
        // Log interview completion activity
        if (user && db) {
            const duration = transcript.length * 2; // Approximate minutes
            await logCareerActivity(db, user.uid, {
                type: 'interview_completed',
                metadata: { duration },
                impact: 8,
            }).catch(console.error);
        }
    };
    
    // --- Render Logic ---
    
    if (!browserSupportsSpeechRecognition) {
        return (
             <div className="p-8"><Alert variant="destructive"><AlertTitle>Browser Not Supported</AlertTitle><AlertDescription>This feature requires a browser that supports the Web Speech API, like Google Chrome.</AlertDescription></Alert></div>
        );
    }
    
    if (interviewState === 'idle') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="glass-card border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
                        <CardHeader className="text-center space-y-4">
                            <motion.div
                                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/50"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    boxShadow: [
                                        '0 0 20px rgba(139, 92, 246, 0.5)',
                                        '0 0 40px rgba(139, 92, 246, 0.8)',
                                        '0 0 20px rgba(139, 92, 246, 0.5)',
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Bot className="w-10 h-10 text-white" />
                            </motion.div>
                            <CardTitle className="text-4xl font-bold font-headline bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                AI Interview Studio
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-lg">
                                Step into a virtual interview room powered by advanced AI.
                                <br />
                                Practice with confidence in an immersive, professional environment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-3xl mb-2">🎯</div>
                                    <h4 className="font-semibold text-white mb-1">Real-Time</h4>
                                    <p className="text-xs text-gray-400">Voice-activated responses</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-3xl mb-2">🧠</div>
                                    <h4 className="font-semibold text-white mb-1">AI-Powered</h4>
                                    <p className="text-xs text-gray-400">Intelligent follow-ups</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-3xl mb-2">📊</div>
                                    <h4 className="font-semibold text-white mb-1">Feedback</h4>
                                    <p className="text-xs text-gray-400">Detailed transcript</p>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-lg shadow-violet-500/50 h-14 text-lg"
                                    onClick={startInterview}
                                >
                                    <Sparkles className="mr-2" />
                                    Start Interview Session
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }
    
    if (interviewState === 'finished') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl"
                >
                    <Card className="glass-card border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
                        <CardHeader className="text-center">
                            <motion.div
                                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <Sparkles className="w-10 h-10 text-white" />
                            </motion.div>
                            <CardTitle className="text-3xl font-bold text-white">Interview Complete!</CardTitle>
                            <CardDescription className="text-gray-400">
                                Great job! Here's your full conversation transcript.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96 rounded-2xl bg-black/40 p-6">
                                <div className="space-y-4">
                                    {transcript.map((item, index) => (
                                        <ChatBubble
                                            key={index}
                                            speaker={item.speaker}
                                            text={item.text}
                                            timestamp={item.timestamp}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="mt-6 flex gap-4">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="flex-1 border-white/20 hover:bg-white/10"
                                    onClick={() => { setInterviewState('idle'); setTranscript([]); }}
                                >
                                    Start New Interview
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#090E24] via-[#1A1F40] to-[#0F1629] p-4 md:p-8">
            <InterviewPanel
                transcript={transcript}
                isAISpeaking={isSpeaking}
                isAIThinking={isAwaitingAI}
                isUserSpeaking={listening}
                userVideoRef={userVideoRef}
                isCameraOff={isCameraOff}
                userName={user?.displayName || 'You'}
                currentUserText={speechTranscript}
            />

            <ControlBar
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                onToggleMute={toggleMute}
                onToggleCamera={toggleCamera}
                onEndInterview={endInterview}
                onSendMessage={() => {
                    if (speechTranscript.trim()) {
                        handleUserResponse();
                    }
                }}
                canSendMessage={!!speechTranscript.trim() && !isAwaitingAI && !isSpeaking}
            />
        </div>
    );
}

    