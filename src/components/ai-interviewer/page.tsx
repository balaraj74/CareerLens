

'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Webcam, Mic, PhoneOff, Send, User, BrainCircuit, Sparkles, Loader2, Video, VideoOff, MicOff } from 'lucide-react';
import 'webrtc-adapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/lib/use-firebase';
import { fetchProfile } from '@/lib/profile-service';
import { getAiInterviewerResponse, generateAvatarVideo } from '@/lib/actions';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

type InterviewState = 'uninitialized' | 'configuring' | 'ready' | 'in_progress' | 'finished';
type Interviewer = 'male' | 'female';
type InterviewType = 'technical' | 'hr' | 'mixed';
type TranscriptItem = {
  speaker: 'ai' | 'user';
  text: string;
};

export function AiInterviewerPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [interviewState, setInterviewState] = useState<InterviewState>('uninitialized');
  const [interviewer, setInterviewer] = useState<Interviewer>('female');
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
     async function loadProfile() {
      if (user && db) {
        setLoadingProfile(true);
        try {
          const profileData = await fetchProfile(db, user.uid);
          if (profileData) {
            setProfile(profileData);
          } else {
            toast({ variant: 'destructive', title: 'Profile Not Found', description: 'Please complete your profile first.'})
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'Could not load profile', description: 'Please try again later.'})
        }
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user, db, toast]);

  const setupMedia = async () => {
    try {
      // Request both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);

      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing camera/mic:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera & Mic Access Denied',
        description: 'Please enable permissions in your browser to use this feature.',
      });
      return null;
    }
  };

  useEffect(() => {
    if (interviewState === 'in_progress' && userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = isCameraEnabled);
      stream.getAudioTracks().forEach(track => track.enabled = isMicEnabled);
    }
  }, [isCameraEnabled, isMicEnabled, interviewState]);

  useEffect(() => {
    if (avatarVideoUrl && avatarVideoRef.current) {
        avatarVideoRef.current.load();
        avatarVideoRef.current.play().catch(error => console.error("Video autoplay failed:", error));
    }
  }, [avatarVideoUrl]);


  const cleanupMedia = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      userVideoRef.current.srcObject = null;
    }
    setHasCameraPermission(false);
    setAvatarVideoUrl(null);
  };
  
  const startInterview = async () => {
    if (!profile) {
        toast({ variant: 'destructive', title: 'Profile not loaded', description: 'Cannot start interview without user profile.'});
        return;
    }
    
    const stream = await setupMedia();
    if (!stream) {
        setInterviewState('uninitialized');
        return;
    }
    
    setIsStarting(true);
    setInterviewState('in_progress');
    
    try {
        const response = await getAiInterviewerResponse({
            userProfile: profile,
            interviewType: interviewType,
        });

        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to get first question.');
        }
        
        const firstQuestion = response.data.firstQuestion;
        setTranscript([{ speaker: 'ai', text: firstQuestion }]);
        
        toast({
            title: 'Interview Started!',
            description: 'Generating the AI interviewer avatar. This may take a moment...'
        });
        
        setIsGeneratingVideo(true);
        const videoResponse = await generateAvatarVideo({
            text: firstQuestion,
            character: `A professional, friendly ${interviewer} HR interviewer.`
        });
        
        if (videoResponse.success && videoResponse.data?.videoUrl) {
            setAvatarVideoUrl(videoResponse.data.videoUrl);
        } else {
            throw new Error(videoResponse.error || 'Could not create the video for the AI interviewer.');
        }

    } catch (error: any) {
        setInterviewState('configuring'); // Revert state
        toast({
            variant: 'destructive',
            title: 'Failed to start interview',
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsStarting(false);
        setIsGeneratingVideo(false);
    }
  }

  const handleEndInterview = () => {
    setInterviewState('finished');
    setTranscript([]);
    cleanupMedia();
    toast({
        title: 'Interview Finished',
        description: 'You can review your feedback shortly (feature coming soon).'
    });
  }

  if (interviewState === 'uninitialized' || interviewState === 'configuring' || interviewState === 'finished') {
    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-3 font-headline text-glow">
                <Bot className="w-8 h-8 text-primary"/> AI Interviewer
                </h1>
                <p className="text-muted-foreground">Practice your interviews with a hyper-realistic AI avatar.</p>
            </motion.div>

            {interviewState === 'uninitialized' && (
                <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Welcome!</CardTitle><CardDescription>{loadingProfile ? 'Loading your profile...' : (profile ? 'Get ready to practice.' : 'Please complete your profile first.')}</CardDescription></CardHeader>
                    <CardContent className="flex justify-center">
                        {loadingProfile ? <Skeleton className="h-12 w-36" /> : <Button size="lg" className="bg-gradient-to-r from-primary to-accent" onClick={() => setInterviewState('configuring')} disabled={!profile}>Begin Setup</Button>}
                    </CardContent>
                </Card>
            )}

            {interviewState === 'configuring' && (
                <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Configure Your Interview</CardTitle><CardDescription>Choose your settings to begin.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <RadioGroup defaultValue="female" onValueChange={(v) => setInterviewer(v as Interviewer)} className="flex gap-4">
                            <Label htmlFor="female" className="flex-1 p-4 border rounded-lg cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all"><RadioGroupItem value="female" id="female" className="sr-only" />Female Avatar</Label>
                            <Label htmlFor="male" className="flex-1 p-4 border rounded-lg cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all"><RadioGroupItem value="male" id="male" className="sr-only" />Male Avatar</Label>
                        </RadioGroup>
                        <RadioGroup defaultValue="mixed" onValueChange={(v) => setInterviewType(v as InterviewType)} className="grid grid-cols-3 gap-4">
                            <Label htmlFor="technical" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all"><RadioGroupItem value="technical" id="technical" className="sr-only" />Technical</Label>
                            <Label htmlFor="hr" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all"><RadioGroupItem value="hr" id="hr" className="sr-only" />HR</Label>
                            <Label htmlFor="mixed" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all"><RadioGroupItem value="mixed" id="mixed" className="sr-only" />Mixed</Label>
                        </RadioGroup>
                        <Button size="lg" className="w-full" onClick={startInterview} disabled={isStarting}>
                            {isStarting ? <><Loader2 className="animate-spin mr-2"/> Preparing interview...</> : 'Start Interview'}
                        </Button>
                    </CardContent>
                </Card>
            )}
             {interviewState === 'finished' && (
                <Card className="glass-card w-full max-w-lg">
                    <CardHeader><CardTitle>Interview Complete!</CardTitle><CardDescription>What would you like to do next?</CardDescription></CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="flex-1" variant="outline" onClick={() => { setInterviewState('uninitialized'); setTranscript([]); }}>Start a New Interview</Button>
                        <Button size="lg" className="flex-1 bg-gradient-to-r from-primary to-accent" disabled>View Feedback (Soon)</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
  }


  return (
    <div className="fixed inset-0 bg-background flex flex-col md:flex-row h-screen w-screen overflow-hidden">
        {/* Main Content: Avatar Video */}
        <div className="flex-1 relative flex items-center justify-center bg-black/50 overflow-hidden">
             {isGeneratingVideo && !avatarVideoUrl && (
                <div className="z-10 text-white text-center p-4">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary"/>
                    <p className="font-bold text-xl">Generating AI Avatar...</p>
                    <p className="text-sm text-muted-foreground">(This may take up to a minute)</p>
                </div>
            )}
            
            {avatarVideoUrl && (
                <video ref={avatarVideoRef} src={avatarVideoUrl} className="w-full h-full object-cover" autoPlay loop playsInline key={avatarVideoUrl} />
            )}

            {!isGeneratingVideo && !avatarVideoUrl && (
                    <div className="z-10 text-white text-center">
                    <Bot className="w-24 h-24 mx-auto mb-4 text-muted-foreground"/>
                    <p className="text-muted-foreground">AI Avatar will appear here.</p>
                </div>
            )}

            {/* User Video Thumbnail */}
             <motion.div drag dragMomentum={false} className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 rounded-xl overflow-hidden glass-card cursor-grab active:cursor-grabbing">
                <AnimatePresence>
                {(hasCameraPermission && isCameraEnabled) ? (
                    <motion.video 
                        ref={userVideoRef} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        muted 
                        playsInline
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                ) : (
                     <motion.div 
                        className="w-full h-full flex flex-col items-center justify-center text-center bg-black/50 text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                     >
                        {isCameraEnabled ? <><Webcam className="w-8 h-8 mb-2"/><p className="text-sm">User Camera</p></> : <><VideoOff className="w-8 h-8 mb-2"/><p className="text-sm">Camera is off</p></>}
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
        </div>
        
        {/* Right Sidebar: Transcript */}
        <div className="w-full md:w-96 bg-background/80 backdrop-blur-sm border-l border-border flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold font-headline text-glow">Live Transcript</h2>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {transcript.map((item, index) => (
                    <motion.div 
                        key={index} 
                        className={`flex gap-3 ${item.speaker === 'ai' ? '' : 'justify-end'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {item.speaker === 'ai' && <Bot className="w-5 h-5 text-primary shrink-0"/>}
                        <div className={`p-3 rounded-xl max-w-xs text-sm ${item.speaker === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                            {item.text}
                        </div>
                        {item.speaker === 'user' && <User className="w-5 h-5 text-green-400 shrink-0"/>}
                    </motion.div>
                ))}
                {isStarting && <Loader2 className="animate-spin mx-auto"/>}
            </div>
             <div className="p-4 border-t border-border flex items-center justify-center gap-2">
                <Button variant={isCameraEnabled ? "outline" : "secondary"} size="icon" onClick={() => setIsCameraEnabled(!isCameraEnabled)}>
                    {isCameraEnabled ? <Video /> : <VideoOff/>}
                </Button>
                <Button variant={isMicEnabled ? "outline" : "secondary"} size="icon" onClick={() => setIsMicEnabled(!isMicEnabled)}>
                    {isMicEnabled ? <Mic /> : <MicOff/>}
                </Button>
                <Button variant="destructive" size="lg" onClick={handleEndInterview}>
                    <PhoneOff className="mr-2"/>
                    End Interview
                </Button>
            </div>
        </div>
    </div>
  );
}
