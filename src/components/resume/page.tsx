
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Download } from 'lucide-react';
import { fetchProfile } from '@/lib/profile-service';
import { useAuth } from '@/hooks/use-auth';
import { getResumeJson } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

function smallText(s: string | undefined) {
  if (!s) return '';
  return s.length > 140 ? s.slice(0, 140) + '...' : s;
}

const CircularProgress = ({ score }: { score: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-primary/10"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          className="text-green-400"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-glow-green">{score}</span>
        <span className="text-xs text-muted-foreground">ATS SCORE</span>
      </div>
    </div>
  );
};


export function ResumePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [manual, setManual] = useState({
    fullName: '', email: '', phone: '', linkedin: '', github: '',
    education: '', experience: '', projects: '', skills: '', summary: ''
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [jobDesc, setJobDesc] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const fetchedProfile = await fetchProfile(user.uid);
        if (fetchedProfile) {
          setProfile(fetchedProfile);
          setManual(prev => ({
            ...prev,
            fullName: fetchedProfile.name || prev.fullName,
            email: user.email || prev.email,
            phone: fetchedProfile.phone || prev.phone,
            linkedin: fetchedProfile.linkedin || prev.linkedin,
            github: fetchedProfile.github || prev.github,
            summary: (fetchedProfile as any).summary || (fetchedProfile as any).bio || prev.summary,
            skills: (fetchedProfile.skills || []).map(s=>s.name).join(', '),
            experience: ((fetchedProfile as any).experience || []).map((e: any) => `- ${e.role} at ${e.company} (${e.years} years).`).join('\n'),
            education: ((fetchedProfile as any).education || []).map((e: any) => `- ${e.degree} in ${e.field} from ${e.institution || 'University'} (${e.year}).`).join('\n'),
          }));
        }
      }
      setLoadingProfile(false);
    }
    loadProfile();
  }, [user]);


  async function generateResume() {
    if (!profile) {
      toast({ variant: 'destructive', title: 'Profile Required', description: 'Please complete your profile before generating a resume.' });
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const payload = { profile, manual, jobDescription: jobDesc };
      const res = await getResumeJson(payload);

      if (!res.success || !res.data) throw new Error(res.error || 'Server error');
      setResult(res.data);

    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to generate resume', description: err.message });
    } finally {
      setGenerating(false);
    }
  }

  function updateManual(field: keyof typeof manual, value: string) {
    setManual(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y:0, opacity:1 }}>
            <h1 className="text-3xl font-bold font-headline text-glow">Futuristic Resume Builder</h1>
            <p className="text-muted-foreground">Your profile is pre-loaded. Add manual details and get an AI-optimized, ATS-checked resume.</p>
          </motion.div>

          <Card className="glass-card">
            <CardHeader>
                <CardTitle>1. Review Profile & Add Manual Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    {loadingProfile ? 'Loading your profile...' : 'Your saved profile has been loaded. You can override or add details below.'}
                </p>

                <h3 className="text-lg font-semibold pt-4">Manual Inputs (merges with/overrides profile)</h3>
                <Input placeholder="Full name" value={manual.fullName} onChange={e=>updateManual('fullName', e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Email" value={manual.email} onChange={e=>updateManual('email', e.target.value)} />
                    <Input placeholder="Phone" value={manual.phone} onChange={e=>updateManual('phone', e.target.value)} />
                </div>
                <Input placeholder="LinkedIn URL" value={manual.linkedin} onChange={e=>updateManual('linkedin', e.target.value)} />
                <Input placeholder="GitHub/Portfolio URL" value={manual.github} onChange={e=>updateManual('github', e.target.value)} />
                <Textarea rows={3} placeholder="Summary / Career objective" value={manual.summary} onChange={e=>updateManual('summary', e.target.value)} />
                <Textarea rows={2} placeholder="Key skills (comma separated)" value={manual.skills} onChange={e=>updateManual('skills', e.target.value)} />
                <Textarea rows={4} placeholder="Experience (short bullets or paste)" value={manual.experience} onChange={e=>updateManual('experience', e.target.value)} />
                <Textarea rows={3} placeholder="Education / Certifications" value={manual.education} onChange={e=>updateManual('education', e.target.value)} />
                 <Textarea rows={3} placeholder="Projects" value={manual.projects} onChange={e=>updateManual('projects', e.target.value)} />
            </CardContent>
          </Card>

           <Card className="glass-card">
                <CardHeader>
                    <CardTitle>2. Target Job Description (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">Paste a job description to tailor your resume and get a precise ATS match score.</p>
                    <Textarea value={jobDesc} onChange={e=>setJobDesc(e.target.value)} rows={5} placeholder="Paste job description here..." />
                </CardContent>
           </Card>

          <div className="flex gap-3">
            <Button onClick={generateResume} size="lg" className="bg-gradient-to-r from-primary to-accent" disabled={generating}>{generating ? <><Loader2 className="animate-spin" /> Generating...</> : 'Generate AI Resume'}</Button>
            <Button onClick={()=>{ setManual({ fullName:'', email:'', phone:'', linkedin:'', github:'', education:'', experience:'', projects:'', skills:'', summary:'' }); setResult(null); setJobDesc(''); }} variant="outline">Reset</Button>
          </div>
        </div>

        {/* RIGHT: Preview & Results */}
        <div className="space-y-6">
          <Card className="glass-card sticky top-8">
            <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
            <CardContent>
                <h2 className="text-xl font-bold">{manual.fullName || profile?.name || 'Your Name'}</h2>
                <p className="text-sm text-muted-foreground mt-1">{smallText(manual.summary || (profile as any)?.bio || 'Short professional summary or objective goes here.')}</p>

                <div className="mt-4">
                    <strong className="text-sm font-semibold">Skills:</strong>
                    <div className="flex flex-wrap gap-1 mt-2">
                    {(manual.skills||'').split(',').slice(0,8).map((s,i)=>s.trim() && <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{s.trim()}</span>)}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <h4 className="font-semibold text-sm">Experience</h4>
                    <p className="text-xs text-muted-foreground mt-1">{smallText(manual.experience || ((profile as any)?.experience?.map((e: any)=>e.role).join(', ') || 'Add experience...'))}</p>
                    </div>
                    <div>
                    <h4 className="font-semibold text-sm">Education</h4>
                    <p className="text-xs text-muted-foreground mt-1">{smallText(manual.education || (profile as any)?.education?.map((e: any)=>e.degree).join(', ') || 'Add education...')}</p>
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader><CardTitle>AI Analysis & Result</CardTitle></CardHeader>
            <CardContent>
                {!result && !generating && <p className="text-sm text-muted-foreground text-center py-10">Click "Generate AI Resume" to produce a tailored resume and ATS report.</p>}
                {generating && <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-primary"/></div>}

                {result && (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 text-center p-4 bg-background/50 rounded-xl">
                        <CircularProgress score={result.atsScore} />
                        <p className="text-sm text-muted-foreground max-w-sm">{result.atsExplanation || 'Automated ATS diagnostic'}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                            {(result.recommendations || []).map((r: string, i: number)=> <li key={i}>{r}</li>)}
                        </ul>
                    </div>

                    <div className="p-4 bg-black/30 rounded-lg">
                        <h4 className="font-semibold mb-2">Generated Resume (Plain Text)</h4>
                        <pre className="text-xs whitespace-pre-wrap font-mono">{result.resumeText}</pre>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild>
                            <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(result.resumeText)}`} download="resume.txt">
                                <Download /> Download .TXT
                            </a>
                        </Button>
                    </div>
                </div>
                )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
