
'use client';
import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Phone, Bot, User, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { getAiInterviewerResponse, getAiInterviewerFollowup } from '@/lib/actions';
import type { TranscriptItem } from '@/ai/schemas/ai-interviewer-flow';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

// --- SVG Avatar Component ---
const InterviewerAvatar = () => {
  const controls = useAnimation();
  const mouthControls = useAnimation();

  // Blinking animation
  useEffect(() => {
    controls.start({
      scaleY: [1, 1, 0.1, 1, 1],
      transition: { duration: 0.5, times: [0, 0.45, 0.5, 0.55, 1], repeat: Infinity, repeatDelay: 5 }
    });
  }, [controls]);
  
  // Mouth animation - listens for custom events
  useEffect(() => {
    const handleSpeechStart = () => {
        mouthControls.start({
            d: [
                "M 120 150 Q 150 150 180 150",
                "M 120 150 Q 150 170 180 150",
                "M 120 150 Q 150 155 180 150",
                "M 120 150 Q 150 180 180 150",
                "M 120 150 Q 150 150 180 150",
            ],
            transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
        });
    };
    const handleSpeechEnd = () => {
        mouthControls.start({
            d: "M 120 150 Q 150 150 180 150",
            transition: { duration: 0.2 }
        });
    };
    
    // Listen for the custom events dispatched from the speak function
    document.addEventListener('speech-start', handleSpeechStart);
    document.addEventListener('speech-end', handleSpeechEnd);

    return () => {
        document.removeEventListener('speech-start', handleSpeechStart);
        document.removeEventListener('speech-end', handleSpeechEnd);
    }
  }, [mouthControls]);


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
          initial={{ d: "M 120 150 Q 150 150 180 150" }}
          animate={mouthControls}
          stroke="#F2F9FF"
          strokeWidth="5"
          fill="transparent"
        />
      </svg>
    </div>
  );
};


export function AiInterviewerPage() {
    const { user } = useAuth();
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
    
    // Refs for media elements
    const userVideoRef = useRef<HTMLVideoElement>(null);
    
    const { transcript: speechTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    
    // --- Effects ---

    useEffect(() => {
        // This effect ensures the video stream is correctly attached to the video element.
        if (stream && userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
        }
    }, [stream]);
    
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
            avatarType: 'HR', // Added missing property
        });
        setIsAwaitingAI(false);

        if (response.success && response.data) {
            setTranscript([{ speaker: 'ai', text: response.data.firstQuestion, timestamp: new Date().toISOString() }]);
            speak(response.data.firstQuestion, () => {
                 // After the first question is spoken, start listening for the user's answer
                 if (!listening) {
                     SpeechRecognition.startListening({ continuous: true });
                 }
            });
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
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            document.dispatchEvent(new Event('speech-start'));
        };

        utterance.onend = () => {
            document.dispatchEvent(new Event('speech-end'));
            if (onEndCallback) {
                onEndCallback();
            }
        };
        
        utterance.onerror = (e) => {
            document.dispatchEvent(new Event('speech-end'));
             toast({
                variant: 'destructive',
                title: 'Text-to-Speech Error',
                description: `Could not play audio: ${e.error}`
            });
            // Still run callback to potentially restart listening
            if (onEndCallback) {
                onEndCallback();
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleUserResponse = async () => {
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
            avatarType: 'HR', // Added missing property
        });
        
        setIsAwaitingAI(false);

        if (response.success && response.data) {
             setTranscript(prev => [...prev, { speaker: 'ai', text: response.data.followUp, timestamp: new Date().toISOString() }]);
             
             if (response.data.isEndOfInterview) {
                 speak(response.data.followUp, endInterview);
             } else {
                 speak(response.data.followUp, () => {
                    if (!listening) SpeechRecognition.startListening({ continuous: true });
                 });
             }
        } else {
            toast({ variant: 'destructive', title: 'Error getting response', description: response.error });
            // If AI fails, start listening again
            if (!listening) SpeechRecognition.startListening({ continuous: true });
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
        speechSynthesis.cancel();
        SpeechRecognition.stopListening();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setHasPermission(false);
        setInterviewState('finished');
    };
    
    // --- Render Logic ---
    
    if (!browserSupportsSpeechRecognition) {
        return (
             <div className="p-8"><Alert variant="destructive"><AlertTitle>Browser Not Supported</AlertTitle><AlertDescription>This feature requires a browser that supports the Web Speech API, like Google Chrome.</AlertDescription></Alert></div>
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
                <Card className="glass-card w-full max-w-2xl text-center">
                    <CardHeader>
                        <CardTitle>Interview Complete!</CardTitle>
                        <CardDescription>Great job! You've completed the mock interview. Here is your transcript.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-96 overflow-y-auto text-left p-4 bg-background/50 rounded-lg">
                        {transcript.map((item, index) => (
                             <div key={index} className={`flex gap-2 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl ${item.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="font-bold capitalize">{item.speaker}</p>
                                    <p>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardContent>
                        <Button size="lg" variant="outline" onClick={() => { setInterviewState('idle'); setTranscript([]); }}>Start a New Interview</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] w-full text-white p-4 gap-4">
            {/* Left side: AI Interviewer */}
            <div className="flex-1 flex flex-col items-center justify-center bg-black rounded-2xl relative overflow-hidden">
                <InterviewerAvatar />
                <div className="absolute top-4 left-4 p-2 bg-black/50 rounded-lg max-w-sm">
                    <p className="font-bold text-lg">AI Interviewer</p>
                    <p className="text-sm text-muted-foreground break-words">{transcript.findLast(t => t.speaker === 'ai')?.text}</p>
                </div>
                 {isAwaitingAI && (
                    <div className="absolute bottom-10 flex items-center gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin"/> Thinking...
                    </div>
                 )}
            </div>
            
            {/* Right side: User Video & Controls */}
            <div className="w-1/3 flex flex-col space-y-4">
                <div className="flex-1 bg-black rounded-2xl overflow-hidden relative">
                    {!hasPermission ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                           <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                           <p>Starting camera...</p>
                        </div>
                    ) : (
                        <video ref={userVideoRef} autoPlay muted className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOff ? 'hidden' : 'block'}`}></video>
                    )}
                    {isCameraOff && <div className="w-full h-full flex items-center justify-center"><VideoOff className="w-16 h-16 text-muted-foreground"/></div>}
                     <div className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg">
                        <p className="font-bold text-lg text-right">{user?.displayName || "You"}</p>
                        <p className={`text-sm text-right ${listening ? 'text-green-400' : 'text-muted-foreground'}`}>{listening ? 'Listening...' : 'Not Listening'}</p>
                    </div>
                    {listening && speechTranscript && <p className="absolute bottom-4 left-4 bg-black/50 p-2 rounded-lg text-sm max-w-[90%]">{speechTranscript}</p>}
                </div>
                
                <div className="bg-card/50 rounded-2xl p-4 flex justify-center items-center gap-4">
                    <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" className="w-14 h-14 rounded-full" onClick={toggleMute}>
                        {isMuted ? <MicOff/> : <Mic/>}
                    </Button>
                    <Button variant={isCameraOff ? 'destructive' : 'secondary'} size="icon" className="w-14 h-14 rounded-full" onClick={toggleCamera}>
                        {isCameraOff ? <VideoOff/> : <Video/>}
                    </Button>
                     <Button variant="secondary" size="icon" className="w-14 h-14 rounded-full" onClick={handleUserResponse} disabled={!speechTranscript || listening || isAwaitingAI}>
                        { isAwaitingAI ? <Loader2 className="animate-spin" /> : <Send /> }
                    </Button>
                    <Button variant='destructive' size="icon" className="w-14 h-14 rounded-full" onClick={endInterview}>
                        <Phone/>
                    </Button>
                </div>
            </div>
        </div>
    );
}

    

    