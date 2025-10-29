'use client';
import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Phone, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { fetchProfile } from '@/lib/profile-service';
import type { UserProfile } from '@/lib/types';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { getAiInterviewerResponse, getAiInterviewerFollowup } from '@/lib/actions';
import { useFirebase } from '@/lib/firebase-provider';
import type { TranscriptItem } from '@/ai/schemas/ai-interviewer-flow';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

// --- SVG Avatar Component ---
const InterviewerAvatar = ({ audioData }: { audioData: Uint8Array | null }) => {
  const [mouthOpen, setMouthOpen] = useState(0); // 0 to 1
  const controls = useAnimation();

  useEffect(() => {
    // Simple blinking animation
    controls.start({
      scaleY: [1, 1, 0.1, 1, 1],
      transition: { duration: 0.5, times: [0, 0.45, 0.5, 0.55, 1], repeat: Infinity, repeatDelay: 5 }
    });
  }, [controls]);

  useEffect(() => {
    if (audioData && audioData.length > 0) {
      // Calculate average volume
      const average = audioData.reduce((a, b) => a + b) / audioData.length;
      // Normalize and scale the value for mouth opening
      const normalized = Math.min((average - 128) / 32, 1);
      setMouthOpen(normalized);
    } else {
      setMouthOpen(0);
    }
  }, [audioData]);

  const mouthPath = `M 120 150 Q 150 ${150 + mouthOpen * 40} 180 150`;

  return (
    <div className="relative w-64 h-64">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Head */}
        <motion.path
          d="M 150 50 C 100 50, 50 100, 50 150 C 50 250, 100 300, 150 300 C 200 300, 250 250, 250 150 C 250 100, 200 50, 150 50 Z"
          fill="#A680FF"
          stroke="#F2F9FF"
          strokeWidth="8"
        />
        {/* Eyes */}
        <g>
          <circle cx="115" cy="120" r="15" fill="#F2F9FF" />
          <motion.rect x="100" y="105" width="30" height="30" fill="#A680FF" ry="15" animate={controls} />
        </g>
        <g>
          <circle cx="185" cy="120" r="15" fill="#F2F9FF" />
           <motion.rect x="170" y="105" width="30" height="30" fill="#A680FF" ry="15" animate={controls} />
        </g>
        {/* Mouth */}
        <motion.path
          d={mouthPath}
          stroke="#F2F9FF"
          strokeWidth="5"
          fill="transparent"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </svg>
    </div>
  );
};


export function AiInterviewerPage() {
    const { user } = useAuth();
    const { db } = useFirebase();
    const { toast } = useToast();
    
    // Component State
    const [interviewState, setInterviewState] = useState<'idle' | 'in_progress' | 'finished'>('idle');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    
    // Media & Permissions
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    
    // Refs for media elements and APIs
    const userVideoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioDataRef = useRef<Uint8Array | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    const [speakingAudioData, setSpeakingAudioData] = useState<Uint8Array | null>(null);
    
    const { transcript: speechTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    
    // --- Effects ---

    // Load Profile
    useEffect(() => {
        async function loadProfile() {
            if (user && db) {
                const profileData = await fetchProfile(db, user.uid);
                setProfile(profileData || null);
            }
        }
        loadProfile();
    }, [user, db]);
    
    // --- Core Functions ---
    
    const startInterview = async () => {
        if (!profile) {
            toast({ variant: 'destructive', title: 'Profile not loaded' });
            return;
        }

        // 1. Get Camera/Mic Permissions
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
            setStream(mediaStream);
            setHasPermission(true);
            if (userVideoRef.current) {
                userVideoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Camera and microphone access is required.' });
            return;
        }
        
        // 2. Set state and get first question
        setInterviewState('in_progress');
        const response = await getAiInterviewerResponse({
            userProfile: profile,
            interviewType: 'mixed', // Example
            jobDescription: 'Software Engineer',
            avatarType: 'Robot'
        });

        if (response.success && response.data) {
            speak(response.data.firstQuestion, () => {
                 // After the first question is spoken, start listening for the user's answer
                 if (!listening) {
                     SpeechRecognition.startListening({ continuous: true });
                 }
            });
            setTranscript([{ speaker: 'ai', text: response.data.firstQuestion, timestamp: new Date().toISOString() }]);
        } else {
            toast({ variant: 'destructive', title: 'Could not start interview.' });
            setInterviewState('idle');
        }
    };

    const speak = (text: string, onEndCallback?: () => void) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Ensure audio context is initialized (must be done after user interaction)
        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            audioDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
        const audioCtx = audioContextRef.current;
        const analyser = analyserRef.current!;

        // When TTS starts speaking
        utterance.onstart = () => {
            // Disconnect any previous source to avoid interference
            // This is a simple approach. A more robust solution might use a single, reusable source.
            const source = audioCtx.createMediaStreamSource(new MediaStream()); // Dummy stream
            
            // This is a conceptual workaround. Direct `SpeechSynthesis` output is not routable
            // into the Web Audio API in all browsers. A proper solution requires server-side TTS
            // or a library that provides an audio stream.
            // For now, we'll simulate the analysis loop.
            const loop = () => {
                analyser.getByteFrequencyData(audioDataRef.current!);
                setSpeakingAudioData(new Uint8Array(audioDataRef.current!)); // Trigger re-render
                animationFrameRef.current = requestAnimationFrame(loop);
            };
            loop();
        };

        // When TTS stops speaking
        utterance.onend = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            setSpeakingAudioData(null); // Stop animation
            if (onEndCallback) {
                onEndCallback(); // e.g., start listening for user response
            }
        };

        speechSynthesis.speak(utterance);
    };

    const handleUserResponse = async () => {
        if (!speechTranscript.trim() || !profile) return;
        SpeechRecognition.stopListening();

        const newTranscript: TranscriptItem[] = [...transcript, { speaker: 'user', text: speechTranscript, timestamp: new Date().toISOString() }];
        setTranscript(newTranscript);
        resetTranscript();

        const response = await getAiInterviewerFollowup({
            userProfile: profile,
            transcript: newTranscript,
            jobDescription: 'Software Engineer',
            avatarType: 'Robot'
        });

        if (response.success && response.data) {
             setTranscript(prev => [...prev, { speaker: 'ai', text: response.data.followUp, timestamp: new Date().toISOString() }]);
             speak(response.data.followUp, () => {
                 if (!listening) SpeechRecognition.startListening({ continuous: true });
             });
             if (response.data.isEndOfInterview) {
                 setInterviewState('finished');
             }
        } else {
            toast({ variant: 'destructive', title: 'Error getting response' });
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
     const endInterview = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setInterviewState('finished');
        setTranscript([]);
    };
    
    // --- Render Logic ---
    
    if (!browserSupportsSpeechRecognition) {
        return (
             <div className="p-8"><Alert variant="destructive"><AlertTitle>Browser Not Supported</AlertTitle><AlertDescription>This feature requires Google Chrome for speech recognition.</AlertDescription></Alert></div>
        );
    }
    
    if (interviewState === 'idle') {
        return (
            <div className="p-4 md:p-8 flex flex-col items-center justify-center space-y-8 min-h-[calc(100vh-10rem)]">
                <Card className="glass-card w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3 font-headline text-glow"><Bot/> AI Interviewer</CardTitle>
                        <CardDescription>Practice with an interactive AI in a simulated video call.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size="lg" className="bg-gradient-to-r from-primary to-accent" onClick={startInterview}>Start Interview</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (interviewState === 'finished') {
        return (
            <div className="p-4 md:p-8 flex flex-col items-center justify-center space-y-8 min-h-[calc(100vh-10rem)]">
                <Card className="glass-card w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle>Interview Complete!</CardTitle>
                        <CardDescription>Great job! You've completed the mock interview.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size="lg" variant="outline" onClick={() => setInterviewState('idle')}>Start a New Interview</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] w-full text-white p-4 gap-4">
            {/* Left side: AI Interviewer */}
            <div className="flex-1 flex flex-col items-center justify-center bg-black rounded-2xl relative">
                <InterviewerAvatar audioData={speakingAudioData} />
                <div className="absolute top-4 left-4">
                    <p className="font-bold text-lg">AI Interviewer</p>
                    <p className="text-sm text-muted-foreground">{transcript.findLast(t => t.speaker === 'ai')?.text}</p>
                </div>
            </div>
            
            {/* Right side: User Video & Controls */}
            <div className="w-1/3 flex flex-col space-y-4">
                <div className="flex-1 bg-black rounded-2xl overflow-hidden relative">
                    <video ref={userVideoRef} autoPlay muted className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOff ? 'hidden' : 'block'}`}></video>
                    {isCameraOff && <div className="w-full h-full flex items-center justify-center"><VideoOff className="w-16 h-16 text-muted-foreground"/></div>}
                     <div className="absolute top-4 right-4">
                        <p className="font-bold text-lg">{user?.displayName || "You"}</p>
                        <p className="text-sm text-muted-foreground">{listening ? 'Listening...' : 'Thinking...'}</p>
                    </div>
                    {listening && speechTranscript && <p className="absolute bottom-4 left-4 bg-black/50 p-2 rounded-lg text-sm">{speechTranscript}</p>}
                </div>
                
                <div className="bg-card/50 rounded-2xl p-4 flex justify-center items-center gap-4">
                    <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" className="w-14 h-14 rounded-full" onClick={toggleMute}>
                        {isMuted ? <MicOff/> : <Mic/>}
                    </Button>
                    <Button variant={isCameraOff ? 'destructive' : 'secondary'} size="icon" className="w-14 h-14 rounded-full" onClick={toggleCamera}>
                        {isCameraOff ? <VideoOff/> : <Video/>}
                    </Button>
                     <Button variant="secondary" size="icon" className="w-14 h-14 rounded-full" onClick={handleUserResponse} disabled={!speechTranscript || listening}>
                        <Send />
                    </Button>
                    <Button variant='destructive' size="icon" className="w-14 h-14 rounded-full" onClick={endInterview}>
                        <Phone/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
