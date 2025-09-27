
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  User,
  Linkedin,
  Github,
  Mail,
  Phone,
  Sparkles,
  X,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { saveProfile, fetchProfile } from '@/lib/profile-service';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';

// Define a precise type for your profile data
const userProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  skills: z.array(z.object({ name: z.string() })).optional(),
});
type UserProfile = z.infer<typeof userProfileSchema>;


export function ProfilePageV2() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: '',
      phone: '',
      bio: '',
      linkedin: '',
      github: '',
      skills: [],
    },
    mode: 'onChange',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: 'skills',
  });

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        setIsLoadingProfile(true);
        const profileData = await fetchProfile(user.uid);
        if (profileData) {
          form.reset({
            name: profileData.name || user.displayName || '',
            phone: profileData.phone || '',
            bio: profileData.bio || '',
            linkedin: profileData.linkedin || '',
            github: profileData.github || '',
            skills: profileData.skills || [],
          });
        } else {
           console.log("No profile document found. A new one will be created on save.");
           form.reset({
            name: user.displayName || '',
            phone: '',
            bio: '',
            linkedin: '',
            github: '',
            skills: [],
          });
        }
        setIsLoadingProfile(false);
      } else if (!authLoading) {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user, form, authLoading]);

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skillFields.some(field => field.name.toLowerCase() === trimmedSkill.toLowerCase())) {
      appendSkill({ name: trimmedSkill });
      setNewSkill('');
    }
  };

  async function onSubmit(data: UserProfile) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to save your profile.',
      });
      console.error("Save failed: No user is currently logged in.");
      return;
    }
    setIsSubmitting(true);
    
    console.log(`--- Starting Save Process for UID: ${user.uid} ---`);
    console.log("Data to save:", data);
    
    // **CRITICAL CHECK FOR UNDEFINED VALUES**
    const dataToSave: any = {};
    Object.keys(data).forEach(key => {
      const value = data[key as keyof UserProfile];
      if (value !== undefined) {
        dataToSave[key] = value;
      }
    });
    console.log("Cleaned data payload (no undefined values):", dataToSave);


    try {
      const { success, error } = await saveProfile(user.uid, dataToSave);
      
      if (success) {
        console.log("--- SUCCESS: Firestore write operation completed. ---");
        toast({
          title: 'Profile Saved! ✅',
          description: 'Your information has been successfully updated.',
        });
      } else {
        throw new Error(error || 'An unknown error occurred during save.');
      }
    } catch (err: any) {
      console.error("--- FIRESTORE SAVE FAILED ---");
      console.error(`Error Code: ${err.code}`);
      console.error(`Error Message: ${err.message}`);
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Save Failed ❌',
        description: err.message || 'An unknown error occurred.',
      });
    } finally {
      console.log("--- Finished Save Process. ---");
      setIsSubmitting(false);
    }
  }
  
  if (authLoading || isLoadingProfile) {
    return (
       <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="glass-card w-full">
                <CardHeader>
                    <Skeleton className="h-8 w-48"/>
                    <Skeleton className="h-4 w-64 mt-2"/>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-24"/><Skeleton className="h-10 w-full"/></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24"/><Skeleton className="h-10 w-full"/></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24"/><Skeleton className="h-10 w-full"/></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24"/><Skeleton className="h-20 w-full"/></div>
                </CardContent>
                 <CardFooter className="justify-end">
                    <Skeleton className="h-10 w-32"/>
                </CardFooter>
            </Card>
        </motion.div>
       </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="glass-card w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-headline text-glow">
                  <User/> Your Professional Profile
                </CardTitle>
                <CardDescription>
                  This information helps us tailor your career recommendations. Keep it up-to-date!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Ada Lovelace" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                            <Input placeholder="ada@futureofcode.com" value={user?.email || ''} readOnly className="pl-10 bg-muted/50 cursor-not-allowed"/>
                        </div>
                    </FormControl>
                </FormItem>
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                             <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                <Input placeholder="(123) 456-7890" {...field} className="pl-10"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Short Bio</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A brief summary of your career and skills (max 200 chars)." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                <Input placeholder="https://linkedin.com/in/..." {...field} className="pl-10"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                <Input placeholder="https://github.com/..." {...field} className="pl-10"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                <div>
                    <FormLabel>Skills</FormLabel>
                    <div className="flex gap-2 my-2">
                        <Input
                        placeholder="Add a new skill (e.g., React)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                        />
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
                    <FormMessage>{form.formState.errors.skills?.message}</FormMessage>
                </div>

              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-accent min-w-[120px]">
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <> <Sparkles className="mr-2"/> Save Profile </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            </form>
        </Form>
      </motion.div>
    </div>
  );
}
