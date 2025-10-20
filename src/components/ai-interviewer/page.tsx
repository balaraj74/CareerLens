'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mic, PhoneOff, Send, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/lib/use-firebase';
import { fetchProfile } from '@/lib/profile-service';
import { getAiInterviewerResponse } from '@/lib/actions';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';

type InterviewState = 'uninitialized' | 'configuring' | 'in_progress' | 'finished';
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
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
  
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);


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
            description: "The AI interviewer has asked the first question."
        });
        

    } catch (error: any) {
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

  if (interviewState === 'uninitialized' || interviewState === 'configuring' || interviewState === 'finished') {
    return (
        <div className="p-4 md:p-8 flex flex-col items-center justify-center space-y-8 min-h-[calc(100vh-10rem)]">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-3 font-headline text-glow">
                <Bot className="w-8 h-8 text-primary"/> AI Interviewer
                </h1>
                <p className="text-muted-foreground">Practice your interviews with a conversational AI.</p>
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
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
            <h1 className="text-xl font-bold font-headline text-glow">AI Mock Interview</h1>
            <Button variant="destructive" size="sm" onClick={handleEndInterview}>
                <PhoneOff className="mr-2"/>
                End Interview
            </Button>
        </div>

        {/* Transcript Area */}
        <div className="flex-1 py-4 space-y-6 overflow-y-auto">
            {transcript.map((item, index) => (
                <motion.div 
                    key={index} 
                    className={`flex gap-3 text-base ${item.speaker === 'ai' ? '' : 'justify-end'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {item.speaker === 'ai' && <Bot className="w-6 h-6 text-primary shrink-0 mt-1"/>}
                    <div className={`p-3 rounded-xl max-w-md ${item.speaker === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                        {item.text}
                    </div>
                    {item.speaker === 'user' && <User className="w-6 h-6 text-green-400 shrink-0 mt-1"/>}
                </motion.div>
            ))}
            {isStarting && <Loader2 className="animate-spin mx-auto"/>}
            <div ref={transcriptEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
            <div className="relative">
                <Textarea 
                    placeholder="Type your response here or use your microphone..." 
                    className="pr-20 min-h-[60px]"
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-2">
                    <Button size="icon" variant="ghost">
                        <Mic />
                    </Button>
                     <Button size="icon">
                        <Send />
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
