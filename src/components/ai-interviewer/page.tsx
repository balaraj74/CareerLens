
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Webcam, Mic, PhoneOff, Send, User, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
     async function loadProfile() {
      if (user && db) {
        setLoadingProfile(true);
        try {
          const profileData = await fetchProfile(db, user.uid);
          if (profileData) {
            setProfile(profileData);
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'Could not load profile', description: 'Please try again later.'})
        }
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user, db, toast]);

  useEffect(() => {
    if (interviewState === 'configuring') {
      const getCameraPermission = async () => {
        try {
          // Request both video and audio
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera/mic:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera & Mic Access Denied',
            description: 'Please enable camera and microphone permissions in your browser settings to use this feature.',
          });
           setInterviewState('uninitialized'); // Go back to the initial state
        }
      };

      getCameraPermission();
    } else if (interviewState === 'uninitialized' || interviewState === 'finished') {
       // Stop all media tracks when not in an active interview
       if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
       }
       setAvatarVideoUrl(null);
    }
  }, [interviewState, toast]);

  useEffect(() => {
    if (avatarVideoUrl && avatarVideoRef.current) {
      avatarVideoRef.current.load();
      avatarVideoRef.current.play().catch(e => console.error("Video autoplay failed:", e));
    }
  }, [avatarVideoUrl]);
  
  const startInterview = async () => {
    if (!profile) {
        toast({ variant: 'destructive', title: 'Profile not loaded', description: 'Cannot start interview without user profile.'});
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
        setIsGeneratingVideo(false);

        if (videoResponse.success && videoResponse.data?.videoUrl) {
            setAvatarVideoUrl(videoResponse.data.videoUrl);
        } else {
            throw new Error(videoResponse.error || 'Could not create the video for the AI interviewer.');
        }

    } catch (error: any) {
        setIsStarting(false);
        setInterviewState('configuring'); // Revert state
        toast({
            variant: 'destructive',
            title: 'Failed to start interview',
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsStarting(false);
    }
  }

  const handleEndInterview = () => {
    setInterviewState('finished');
    setTranscript([]);
    toast({
        title: 'Interview Finished',
        description: 'You can review your feedback shortly (feature coming soon).'
    });
  }

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
            <CardHeader>
                <CardTitle>Welcome to the AI Interview Experience</CardTitle>
                <CardDescription>
                    {loadingProfile ? 'Loading your profile...' : 'Get ready to practice and improve your interviewing skills.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                {loadingProfile ? <Skeleton className="h-12 w-36" /> :
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent" onClick={() => setInterviewState('configuring')}>
                    Begin Setup
                </Button>
                }
            </CardContent>
        </Card>
      )}

      {interviewState === 'configuring' && (
        <Card className="glass-card w-full max-w-lg">
            <CardHeader>
                <CardTitle>Configure Your Interview</CardTitle>
                <CardDescription>Choose your settings and grant camera/mic permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>1. Choose Interviewer</Label>
                    <RadioGroup defaultValue="female" onValueChange={(v) => setInterviewer(v as Interviewer)} className="flex gap-4">
                        <Label htmlFor="female" className="flex-1 p-4 border rounded-lg cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                            <RadioGroupItem value="female" id="female" className="sr-only" />
                            Female Avatar
                        </Label>
                        <Label htmlFor="male" className="flex-1 p-4 border rounded-lg cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                             <RadioGroupItem value="male" id="male" className="sr-only" />
                            Male Avatar
                        </Label>
                    </RadioGroup>
                </div>
                 <div className="space-y-2">
                    <Label>2. Select Interview Type</Label>
                    <RadioGroup defaultValue="mixed" onValueChange={(v) => setInterviewType(v as InterviewType)} className="grid grid-cols-3 gap-4">
                         <Label htmlFor="technical" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                            <RadioGroupItem value="technical" id="technical" className="sr-only" />
                            Technical
                        </Label>
                         <Label htmlFor="hr" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                             <RadioGroupItem value="hr" id="hr" className="sr-only" />
                            HR
                        </Label>
                         <Label htmlFor="mixed" className="p-4 border rounded-lg cursor-pointer text-center data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                             <RadioGroupItem value="mixed" id="mixed" className="sr-only" />
                            Mixed
                        </Label>
                    </RadioGroup>
                </div>
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {!hasCameraPermission && <div className="absolute text-center text-muted-foreground p-4"><Webcam className="w-8 h-8 mx-auto mb-2"/>Awaiting camera permission...</div>}
                </div>
                
                <Button size="lg" className="w-full" onClick={startInterview} disabled={!hasCameraPermission || isStarting}>
                    {isStarting ? <><Loader2 className="animate-spin mr-2"/> Preparing interview...</> : 'Start Interview'}
                </Button>
            </CardContent>
        </Card>
      )}

      {(interviewState === 'in_progress' || interviewState === 'finished') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
            <div className="lg:col-span-2 space-y-4">
                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                    {isGeneratingVideo && !avatarVideoUrl && (
                        <div className="z-10 text-white text-center p-4">
                            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin"/>
                            <p className="font-bold">Generating AI Avatar...</p>
                            <p className="text-sm text-muted-foreground">(This may take up to a minute)</p>
                        </div>
                    )}
                    
                    {avatarVideoUrl && (
                        <video 
                            ref={avatarVideoRef}
                            className={'w-full h-full object-cover transition-opacity duration-500 opacity-100'} 
                            autoPlay 
                            loop 
                            playsInline 
                            key={avatarVideoUrl} // Re-mounts the video element on new URL
                            src={avatarVideoUrl}
                        />
                    )}
                    
                    {!isGeneratingVideo && !avatarVideoUrl && (
                         <div className="z-10 text-white text-center">
                            <Bot className="w-24 h-24 mx-auto mb-4"/>
                            <p>AI Avatar will appear here.</p>
                        </div>
                    )}
                </div>
                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                     <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                     {!hasCameraPermission && (
                        <Alert variant="destructive" className="absolute bottom-4 left-4 w-auto">
                            <Webcam className="h-4 w-4" />
                            <AlertTitle>Camera Not Found</AlertTitle>
                        </Alert>
                     )}
                </div>
            </div>
            <div className="space-y-4">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Live Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 overflow-y-auto space-y-4">
                       {transcript.map((item, index) => (
                           item.speaker === 'ai' ? (
                                <div key={index} className="flex gap-3">
                                    <Bot className="w-5 h-5 text-primary shrink-0"/>
                                    <p className="text-sm">{item.text}</p>
                                </div>
                           ) : (
                                <div key={index} className="flex gap-3">
                                    <User className="w-5 h-5 text-green-400 shrink-0"/>
                                    <p className="text-sm text-muted-foreground">{item.text}</p>
                                </div>
                           )
                       ))}
                       {isStarting && <Loader2 className="animate-spin" />}
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" size="lg" className="w-full" onClick={handleEndInterview} disabled={interviewState === 'finished'}>
                            <PhoneOff className="mr-2"/>
                            End Interview
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

      {interviewState === 'finished' && (
           <Card className="glass-card w-full max-w-lg">
            <CardHeader>
                <CardTitle>Interview Complete!</CardTitle>
                <CardDescription>What would you like to do next?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1" variant="outline" onClick={() => { setInterviewState('uninitialized'); setTranscript([]); }}>
                    Start a New Interview
                </Button>
                <Button size="lg" className="flex-1 bg-gradient-to-r from-primary to-accent" disabled>
                   View Feedback (Soon)
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

    