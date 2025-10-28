
'use client';
import 'regenerator-runtime/runtime';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mic, Send, User, Loader2, Video, VideoOff, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { fetchProfile } from '@/lib/profile-service';
import type { UserProfile } from '@/lib/types';
import type { TranscriptItem } from '@/ai/schemas/ai-interviewer-flow';
import { getAiInterviewerResponse, getAiInterviewerFollowup } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { useFirebase } from '@/lib/firebase-provider';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

type InterviewState = 'uninitialized' | 'configuring' | 'in_progress' | 'finished';
type InterviewType = 'technical' | 'hr' | 'mixed';
type AvatarType = 'HR' | 'Mentor' | 'Robot';
type MicState = 'idle' | 'listening' | 'processing';

const AVATAR_IMAGES = {
    HR: 'https://cdn.d-id.com/avatars/fT47o6iKk2_SGS2A8m53I.png',
    Mentor: 'https://cdn.d-id.com/avatars/enhanced/o_jC4I2Aa0Cj8y0sBso_U.jpeg',
    Robot: 'https://cdn.d-id.com/avatars/enhanced/Cubs2gK3cDmF6xK2pGv01.jpeg',
};

export function AiInterviewerPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [interviewState, setInterviewState] = useState<InterviewState>('uninitialized');
  const [interviewType, setInterviewType] = useState<InterviewType>('hr');
  const [avatarType, setAvatarType] = useState<AvatarType>('HR');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [micState, setMicState] = useState<MicState>('idle');

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { transcript: speechTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      if (user && db) {
        setLoadingProfile(true);
        try {
          const profileData = await fetchProfile(db, user.uid);
          setProfile(profileData || null);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Could not load profile' });
        }
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user, db, toast]);

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);
      setIsCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
      toast({ variant: 'destructive', title: 'Media Access Denied', description: 'Please enable camera and microphone permissions.' });
      setHasCameraPermission(false);
    }
  };

  const handleStartInterview = async () => {
    if (!profile) {
      toast({ variant: 'destructive', title: 'Profile not loaded' });
      return;
    }
    if (!hasCameraPermission) {
      await getCameraPermission();
    }
    
    setIsGenerating(true);
    setInterviewState('in_progress');
    const response = await getAiInterviewerResponse({ 
      userProfile: profile, 
      interviewType,
      jobDescription: 'Software Engineer at a top tech company.',
      avatarType,
    });
    setIsGenerating(false);

    if (response.success && response.data) {
        const aiResponseText = response.data.firstQuestion;
        setTranscript([{ speaker: 'ai', text: aiResponseText, timestamp: new Date().toISOString() }]);
        
        // This initial question usually won't have audio, but we can add it if needed
        // For now, we wait for the user to speak first.
    } else {
        toast({ variant: 'destructive', title: 'Could not start interview', description: response.error });
        setInterviewState('configuring');
    }
  };
  
  const handleUserSubmit = async (userText: string) => {
    if (!profile || !userText.trim()) return;

    const newTranscript: TranscriptItem[] = [...transcript, { speaker: 'user', text: userText, timestamp: new Date().toISOString() }];
    setTranscript(newTranscript);
    setIsGenerating(true);
    
    const response = await getAiInterviewerFollowup({
        userProfile: profile,
        jobDescription: 'Software Engineer at a top tech company.',
        transcript: newTranscript,
        avatarType,
    });

    setIsGenerating(false);
     if (response.success && response.data) {
        setTranscript(prev => [...prev, { speaker: 'ai', text: response.data.followUp, timestamp: new Date().toISOString() }]);
        if (response.data.audioDataUri && audioRef.current) {
            audioRef.current.src = response.data.audioDataUri;
            audioRef.current.play();
        }
        if (response.data.isEndOfInterview) {
            setInterviewState('finished');
        }
    } else {
        toast({ variant: 'destructive', title: 'Error getting response', description: response.error });
    }
  };

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setMicState('processing');
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setMicState('listening');
    }
  };

  useEffect(() => {
    if (!listening && micState === 'processing' && speechTranscript) {
      handleUserSubmit(speechTranscript);
      resetTranscript();
      setMicState('idle');
    }
  }, [listening, speechTranscript, micState]);


  if (!browserSupportsSpeechRecognition) {
      return (
           <div className="p-8">
            <Alert variant="destructive">
                <AlertTitle>Browser Not Supported</AlertTitle>
                <AlertDescription>
                   This browser does not support speech recognition. Please use Google Chrome for the best experience.
                </AlertDescription>
            </Alert>
           </div>
      )
  }

  if (interviewState !== 'in_progress') {
     return (
        <div className="p-4 md:p-8 flex flex-col items-center justify-center space-y-8 min-h-[calc(100vh-10rem)]">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-3 font-headline text-glow">
                    <Bot className="w-8 h-8 text-primary"/> AI Interviewer
                </h1>
                <p className="text-muted-foreground">Practice with a conversational AI to hone your skills.</p>
            </motion.div>

            {interviewState === 'uninitialized' && (
                 <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Welcome!</CardTitle><CardDescription>{loadingProfile ? 'Loading your profile...' : (profile ? 'Get ready to practice.' : 'Please complete your profile first.')}</CardDescription></CardHeader>
                    <CardContent className="flex justify-center">
                        <Button size="lg" className="bg-gradient-to-r from-primary to-accent" onClick={() => setInterviewState('configuring')} disabled={loadingProfile || !profile}>Begin Setup</Button>
                    </CardContent>
                </Card>
            )}

            {interviewState === 'configuring' && (
                <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Configure Your Interview</CardTitle><CardDescription>Choose the type of interview and avatar persona.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <p className="text-sm font-medium">Interview Type</p>
                            <Select onValueChange={(v: InterviewType) => setInterviewType(v)} defaultValue={interviewType}>
                                <SelectTrigger><SelectValue placeholder="Select interview type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hr">HR / Behavioral</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="mixed">Mixed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <p className="text-sm font-medium">Avatar Persona</p>
                            <Select onValueChange={(v: AvatarType) => setAvatarType(v)} defaultValue={avatarType}>
                                <SelectTrigger><SelectValue placeholder="Select an avatar" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HR">HR Professional</SelectItem>
                                    <SelectItem value="Mentor">Senior Mentor</SelectItem>
                                    <SelectItem value="Robot">Technical Bot</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={getCameraPermission} disabled={hasCameraPermission}>Enable Mic & Video</Button>
                            {!hasCameraPermission && <span className="text-xs text-muted-foreground">Camera and Mic access is required.</span>}
                         </div>
                        <Button size="lg" className="w-full" onClick={handleStartInterview} disabled={isGenerating || !hasCameraPermission}>
                            {isGenerating ? <Loader2 className="animate-spin"/> : 'Start Interview'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {interviewState === 'finished' && (
                <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Interview Complete!</CardTitle></CardHeader>
                     <CardContent className="flex flex-col gap-4">
                       <p className="text-muted-foreground">The full performance report feature is coming soon! For now, review the transcript for feedback.</p>
                        <Button size="lg" className="flex-1" variant="outline" onClick={() => { setInterviewState('uninitialized'); setTranscript([]); }}>Start a New Interview</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full text-white p-4 gap-4">
        {/* Main View */}
        <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-2xl overflow-hidden relative">
            <img src={AVATAR_IMAGES[avatarType]} alt="AI Avatar" className="w-64 h-64 rounded-full object-cover border-4 border-primary shadow-2xl shadow-primary/20"/>
            <h2 className="text-2xl font-bold mt-4">AI Interviewer: Alex</h2>
            <p className="text-muted-foreground">{avatarType} Persona</p>

            <div className="absolute bottom-6 right-6 w-48 h-36">
                 <video ref={videoRef} className={`w-full h-full rounded-md object-cover transition-opacity ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} autoPlay muted />
                 {!isCameraOn && <div className="w-full h-full bg-black rounded-md flex items-center justify-center"><VideoOff className="text-muted-foreground" /></div>}
            </div>
             <audio ref={audioRef} hidden />
        </div>

        {/* Transcript & Controls */}
        <div className="w-96 bg-card rounded-2xl flex flex-col p-4">
            <h2 className="text-xl font-bold mb-4 font-headline text-glow">Live Transcript</h2>
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                    {transcript.map((item, index) => (
                        <div key={index} className={`flex gap-2 ${item.speaker === 'user' ? 'justify-end' : ''}`}>
                             {item.speaker === 'ai' && <Bot className="w-5 h-5 text-primary shrink-0"/>}
                             <div className={`max-w-xs p-3 rounded-xl ${item.speaker === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                                <p className="text-sm">{item.text}</p>
                             </div>
                             {item.speaker === 'user' && <User className="w-5 h-5 text-green-400 shrink-0"/>}
                        </div>
                    ))}
                     {listening && <p className="text-sm text-muted-foreground italic">{speechTranscript}...</p>}
                    {isGenerating && <Loader2 className="animate-spin mx-auto text-primary"/>}
                </div>
            </ScrollArea>
             <div className="mt-4 flex items-center justify-center gap-4">
                <Button onClick={handleMicClick} size="icon" className={`rounded-full h-16 w-16 transition-colors ${micState === 'listening' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary'}`} disabled={isGenerating}>
                    {micState === 'listening' ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={() => setIsCameraOn(!isCameraOn)} size="icon" variant="outline">
                    {isCameraOn ? <Video /> : <VideoOff />}
                </Button>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">
                {micState === 'idle' && 'Click the mic to speak'}
                {micState === 'listening' && 'Listening... Click mic to stop'}
                {micState === 'processing' && 'Processing your response...'}
            </div>
        </div>
    </div>
  );
}
