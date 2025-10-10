

"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2, User, Linkedin, Github, Mail, Phone, Sparkles, X, PlusCircle, Trash2, ArrowLeft, ArrowRight, Briefcase, GraduationCap, Target, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/lib/use-firebase'; // NEW
import { saveProfile, fetchProfile } from '@/lib/profile-service';
import { userProfileSchema, type UserProfile } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


const steps = [
  { id: 'personal', title: 'Personal Info', icon: User },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'experience', title: 'Experience', icon: Briefcase },
  { id: 'skills', title: 'Skills & Goals', icon: Target },
];

export function ProfilePageV2() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { db } = useFirebase(); // NEW: Get db from our provider
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: '',
      phone: '',
      bio: '',
      linkedin: '',
      github: '',
      skills: [],
      education: [],
      experience: [],
      careerGoals: '',
    },
    mode: 'onChange',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ name: 'skills', control: form.control });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ name: 'experience', control: form.control });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ name: 'education', control: form.control });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (user && db) { // NEW: Check for db instance
        setIsLoadingProfile(true);
        const profileData = await fetchProfile(db, user.uid); // NEW: Pass db
        if (profileData) {
          form.reset(profileData);
        }
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user, db, form]); // NEW: Add db to dependency array
  
  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skillFields.some(field => field.name.toLowerCase() === trimmedSkill.toLowerCase())) {
      appendSkill({ name: trimmedSkill });
      setNewSkill('');
    }
  };

  async function onSubmit(data: UserProfile) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to save your profile.' });
      return;
    }
    if (!db) { // NEW: Check for db instance
        toast({ variant: 'destructive', title: 'Database not available', description: 'Could not connect to the database.' });
        return;
    }
    setIsSubmitting(true);
    try {
      await saveProfile(db, user.uid, data); // NEW: Pass db
      toast({ title: 'Profile Saved! ✅', description: 'Your information has been successfully updated.' });
    } catch (err: any) {
      console.error("FIRESTORE SAVE ERROR:", err);
      toast({ variant: 'destructive', title: 'Save Failed ❌', description: err.message || 'An unknown error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const nextStep = () => setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));

  if (authLoading || isLoadingProfile) {
    return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96 w-full" /></div>;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-glow mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground">A detailed profile helps our AI find the perfect career path for you.</p>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      <div className="flex border-b mb-8">
        {steps.map((step, index) => (
          <button key={step.id} onClick={() => setCurrentStep(index)} className={`flex-1 group p-4 flex items-center justify-center gap-3 relative transition-colors ${currentStep === index ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <step.icon className="h-5 w-5" />
            <span className="font-semibold">{step.title}</span>
            {currentStep === index && <motion.div layoutId="stepper-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            {form.formState.errors[step.id as keyof UserProfile] && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />}
          </button>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              {currentStep === 0 && (
                <Card className="glass-card">
                  <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField name="name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Ada Lovelace" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input value={user?.email || ''} readOnly className="bg-muted/50" /></FormControl></FormItem>
                    <FormField name="phone" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name="bio" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Short Bio</FormLabel><FormControl><Textarea placeholder="A brief summary about you..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid grid-cols-2 gap-4">
                       <FormField name="linkedin" control={form.control} render={({ field }) => ( <FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField name="github" control={form.control} render={({ field }) => ( <FormItem><FormLabel>GitHub</FormLabel><FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                  </CardContent>
                </Card>
              )}
               {currentStep === 1 && (
                <Card className="glass-card">
                  <CardHeader><CardTitle>Educational Background</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {eduFields.map((field, index) => (
                      <Card key={field.id} className="p-4 relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField name={`education.${index}.degree`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Degree/Qualification</FormLabel><FormControl><Input placeholder="e.g., Bachelor of Science" {...field} /></FormControl><FormMessage /></FormItem> )} />
                          <FormField name={`education.${index}.field`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input placeholder="e.g., Computer Science" {...field} /></FormControl><FormMessage /></FormItem> )} />
                          <FormField name={`education.${index}.institution`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="e.g., University of Cambridge" {...field} /></FormControl><FormMessage /></FormItem> )} />
                          <FormField name={`education.${index}.year`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Graduation Year</FormLabel><FormControl><Input placeholder="2024" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendEdu({ degree: '', field: '', institution: '', year: '' })}><PlusCircle/> Add Education</Button>
                  </CardContent>
                </Card>
              )}
              {currentStep === 2 && (
                <Card className="glass-card">
                  <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {expFields.map((field, index) => (
                      <Card key={field.id} className="p-4 relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField name={`experience.${index}.role`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Job Title / Role</FormLabel><FormControl><Input placeholder="e.g., Software Engineer Intern" {...field} /></FormControl><FormMessage /></FormItem> )} />
                          <FormField name={`experience.${index}.company`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="e.g., Google" {...field} /></FormControl><FormMessage /></FormItem> )} />
                          <FormField name={`experience.${index}.years`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g., 3 months or 2022-2023" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                         <FormField name={`experience.${index}.description`} control={form.control} render={({ field }) => ( <FormItem className="mt-4"><FormLabel>Description / Achievements</FormLabel><FormControl><Textarea placeholder="Describe your responsibilities and achievements..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendExp({ role: '', company: '', years: '', description: '' })}><PlusCircle/> Add Experience</Button>
                  </CardContent>
                </Card>
              )}
              {currentStep === 3 && (
                <Card className="glass-card">
                  <CardHeader><CardTitle>Skills & Career Goals</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                        <FormLabel>Skills</FormLabel>
                        <div className="flex gap-2 my-2">
                            <Input placeholder="Add a new skill (e.g., React)" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}} />
                            <Button type="button" variant="outline" onClick={handleAddSkill}><PlusCircle/> Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skillFields.map((field, index) => (
                            <Badge key={field.id} variant="secondary" className="text-base py-1 px-3 animate-in fade-in-0 zoom-in-95">
                                {field.name}
                                <button type="button" onClick={() => removeSkill(index)} className="ml-2 rounded-full hover:bg-destructive/50 p-0.5"><X className="h-3 w-3"/></button>
                            </Badge>
                            ))}
                        </div>
                    </div>
                     <FormField name="careerGoals" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Primary Career Goal</FormLabel><FormControl><Input placeholder="e.g., Senior Full-Stack Developer, AI/ML Engineer" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between items-center">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                <ArrowLeft className="mr-2"/> Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-accent">
                {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Saving...</> : <><Sparkles className="mr-2"/> Save Profile</>}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="ml-2"/>
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
