
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { PlusCircle, Trash2, ArrowLeft, ArrowRight, User, School, Briefcase, Sparkles, MapPin, Loader2, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  userProfileSchema,
  type UserProfile,
} from '@/lib/types';
import { defaultProfileData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '../ui/skeleton';

const steps = [
    { id: 'personal', title: 'Personal Info', icon: <User className="w-6 h-6" />, description: "Let's start with the basics." },
    { id: 'experience', title: 'Work Experience', icon: <Briefcase className="w-6 h-6" />, description: "Tell us about your professional journey." },
    { id: 'education', title: 'Education', icon: <School className="w-6 h-6" />, description: "Your academic background." },
    { id: 'skills', title: 'Skills & Expertise', icon: <Sparkles className="w-6 h-6" />, description: "What are you good at?" },
    { id: 'interests', title: 'Career Goals', icon: <MapPin className="w-6 h-6" />, description: "What are your aspirations?" },
];


async function fetchProfile(userId: string): Promise<{ success: boolean; data?: UserProfile | null, error?: string}> {
    try {
        const response = await fetch(`/api/profile?userId=${userId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch profile: ${response.statusText}`);
        }
        const data = await response.json();
        return { success: true, data };
    } catch (err: any) {
        console.error("fetchProfile error:", err.message);
        return { success: false, error: err.message };
    }
}

async function saveProfile(userId: string, data: UserProfile): Promise<{ success: boolean; error?: string}> {
     try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...data }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to save profile: ${response.statusText}`);
        }
        return { success: true };
    } catch (err: any) {
        console.error("saveProfile error:", err.message);
        return { success: false, error: err.message };
    }
}


export function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: defaultProfileData,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!user?.uid) return;

    const loadProfile = async () => {
        setIsLoading(true);
        const { data, error } = await fetchProfile(user.uid);
        
        if (error) {
             toast({
                variant: "destructive",
                title: "Failed to load profile",
                description: error,
            });
        } else if (data) {
            // Existing user, populate form with fetched data
            form.reset(data);
        } else {
            // New user (data is null), use default values and set basic info
            form.reset(defaultProfileData); // Ensure form is reset to defaults
            form.setValue('name', user.displayName || '');
            form.setValue('email', user.email || '');
            toast({
              title: "Welcome!",
              description: "Let's set up your profile to get started.",
            })
        }
        setIsLoading(false);
    };

    loadProfile();
  }, [user, form, toast]);


  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    name: 'skills',
  });

  async function onSubmit(data: UserProfile) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to save your profile.",
        });
        return;
    }
    setIsSubmitting(true);
    const { success, error } = await saveProfile(user.uid, data);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: "Profile saved successfully ✅",
        description: "Your AI-powered career journey begins now.",
      });
      setCurrentStep(0);
    } else {
       toast({
        variant: "destructive",
        title: "Failed to save ❌",
        description: error,
      });
    }
  }

  const handleNext = async () => {
    const isStepValid = await form.trigger(steps[currentStep].id as any);
    if (isStepValid) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (isLoading) {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
             <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
            </div>
            <Card className="glass-card rounded-2xl">
                <CardHeader><Skeleton className="h-14 w-3/4" /></CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-2/3" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Bot className="w-8 h-8 text-primary text-glow"/>
                        <h1 className="text-2xl md:text-3xl font-bold font-headline">Build Your Profile</h1>
                    </div>
                    <p className="text-sm font-semibold text-primary text-glow">Step {currentStep + 1}/{steps.length}</p>
                </div>
                <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-primary" />
            </div>

            <Card className="glass-card rounded-2xl">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center bg-primary/10 text-primary rounded-xl p-3 w-14 h-14">
                            {steps[currentStep].icon}
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-headline">{steps[currentStep].title}</CardTitle>
                            <CardDescription>{steps[currentStep].description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="min-h-[300px]">
                    {currentStep === 0 && (
                         <div className="space-y-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Ada Lovelace" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="ada@futureofcode.com" {...field} readOnly /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                         </div>
                    )}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {experienceFields.map((field, index) => (
                                <div key={field.id} className="p-4 border border-white/10 rounded-lg relative space-y-4 bg-white/5">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeExperience(index)}><Trash2 className="h-4 w-4" /></Button>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`experience.${index}.role`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <FormControl><Input {...field} placeholder="e.g. Software Engineer" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company</FormLabel>
                                                <FormControl><Input {...field} placeholder="e.g. TechCorp" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`experience.${index}.years`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Years</FormLabel>
                                                <FormControl><Input {...field} type="number" placeholder="e.g. 5" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendExperience({ role: '', company: '', years: '', skills: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                        </div>
                    )}
                    {currentStep === 2 && (
                         <div className="space-y-6">
                            {educationFields.map((field, index) => (
                                <div key={field.id} className="p-4 border border-white/10 rounded-lg relative space-y-4 bg-white/5">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(index)}><Trash2 className="h-4 w-4" /></Button>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Degree</FormLabel>
                                                <FormControl><Input {...field} placeholder="e.g. Bachelor of Science" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`education.${index}.field`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Field of Study</FormLabel>
                                                <FormControl><Input {...field} placeholder="e.g. Computer Science" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`education.${index}.year`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year of Graduation</FormLabel>
                                                <FormControl><Input {...field} placeholder="e.g. 2022" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendEducation({ degree: '', field: '', year: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
                        </div>
                    )}
                     {currentStep === 3 && (
                        <div className="space-y-6">
                            <FormLabel>Skills</FormLabel>
                            <FormField control={form.control} name="skills" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input 
                                            placeholder="Add skills separated by commas (e.g. TypeScript, React)" 
                                            onChange={(e) => {
                                                const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, proficiency: 'Intermediate' }));
                                                field.onChange(skills);
                                            }}
                                            value={field.value.map(s => s.name).join(', ')}
                                        />
                                    </FormControl>
                                     <div className="pt-4 space-y-4">
                                        {field.value.map((skill, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <Badge variant="secondary" className="text-lg py-1 px-3">{skill.name}</Badge>
                                                <FormField
                                                    control={form.control}
                                                    name={`skills.${index}.proficiency`}
                                                    render={({ field: proficiencyField }) => (
                                                        <FormItem className="flex-1">
                                                            {/* Replace with a cooler slider in the future */}
                                                             <FormControl>
                                                                <Input {...proficiencyField} placeholder="e.g., Expert" />
                                                             </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <FormField control={form.control} name="interests" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Professional Interests</FormLabel>
                                    <FormDescription>What fields or technologies excite you? (comma-separated)</FormDescription>
                                    <FormControl>
                                        <Input placeholder="AI, Quantum Computing, Design Systems" onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} value={Array.isArray(field.value) ? field.value.join(', ') : ''} />
                                    </FormControl>
                                    <div className="pt-2">
                                        {Array.isArray(field.value) && field.value.map((interest, index) => ( interest && <Badge key={index} variant="outline" className="mr-1 mb-1 border-primary/50 text-primary">{interest}</Badge>))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField
                                control={form.control}
                                name="preferences.industries"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Industries (comma-separated)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="e.g. SaaS, Fintech, Healthcare"
                                                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} 
                                                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                            />
                                        </FormControl>
                                        <div className="pt-2">
                                            {Array.isArray(field.value) && field.value.map((industry, index) => (
                                                industry && <Badge key={index} variant="outline" className="mr-1 mb-1 border-accent/50 text-accent">{industry}</Badge>
                                            ))}
                                        </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="preferences.location" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Location</FormLabel>
                                        <FormControl><Input placeholder="e.g., San Francisco, CA or Remote" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="preferences.remote" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-3 shadow-sm bg-white/5 mt-auto">
                                        <div className="space-y-0.5">
                                            <FormLabel>Open to Remote Work</FormLabel>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                                    </FormItem>
                                )}/>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 flex justify-between">
                <Button type="button" variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} className="bg-gradient-to-r from-primary to-accent">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-green-500 to-cyan-500 shadow-lg shadow-cyan-500/20">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Profile...
                          </>
                        ) : (
                          "Finish & Save Profile"
                        )}
                    </Button>
                )}
            </div>
        </form>
      </Form>
    </div>
  );
}
