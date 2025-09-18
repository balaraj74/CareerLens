'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { PlusCircle, Trash2, ArrowLeft, ArrowRight, User, BookOpen, Briefcase, Star, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';

import {
  userProfileSchema,
  type UserProfile,
} from '@/lib/types';
import { defaultProfileData } from '@/lib/data';
import { saveUserProfile } from '@/lib/actions';
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

const steps = [
    { id: 'personal', title: 'Personal Info', icon: <User className="w-6 h-6" /> },
    { id: 'experience', title: 'Experience', icon: <Briefcase className="w-6 h-6" /> },
    { id: 'education', title: 'Education', icon: <BookOpen className="w-6 h-6" /> },
    { id: 'skills', title: 'Skills', icon: <Star className="w-6 h-6" /> },
    { id: 'interests', title: 'Interests & Preferences', icon: <MapPin className="w-6 h-6" /> },
];

export function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: defaultProfileData,
    mode: 'onChange',
  });

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
    const response = await saveUserProfile(user.uid, data);
    setIsSubmitting(false);

    if (response.success) {
      toast({
        title: "Profile Saved!",
        description: "Your profile has been successfully saved.",
      });
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

  const handleNext = () => {
    // We can add validation logic here before proceeding
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Create Your Profile</h1>
                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center bg-primary/10 text-primary rounded-lg p-3">
                            {steps[currentStep].icon}
                        </div>
                        <div>
                            <CardTitle>{steps[currentStep].title}</CardTitle>
                            <CardDescription>Let's get to know you better.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentStep === 0 && (
                         <div className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                         </div>
                    )}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {experienceFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
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
                                                <FormControl><Input {...field} placeholder="e.g. 5" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                    <FormField control={form.control} name={`experience.${index}.skills`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skills Used (comma-separated)</FormLabel>
                                            <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} value={Array.isArray(field.value) ? field.value.join(', ') : ''} placeholder="React, Node.js, Python" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendExperience({ role: '', company: '', years: '', skills: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                        </div>
                    )}
                    {currentStep === 2 && (
                         <div className="space-y-6">
                            {educationFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative">
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
                            {skillFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4" /></Button>
                                    <div className="grid md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`skills.${index}.name`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skill</FormLabel>
                                            <FormControl><Input {...field} placeholder="e.g. TypeScript" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`skills.${index}.proficiency`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proficiency</FormLabel>
                                            <FormControl><Input {...field} placeholder="e.g. Expert" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendSkill({ name: '', proficiency: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill</Button>
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <FormField control={form.control} name="interests" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Interests (comma-separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="AI, Design, Startups" onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} value={Array.isArray(field.value) ? field.value.join(', ') : ''} />
                                    </FormControl>
                                    <div className="pt-2">
                                        {Array.isArray(field.value) && field.value.map((interest, index) => ( interest && <Badge key={index} variant="secondary" className="mr-1 mb-1">{interest}</Badge>))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="preferences.location" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Location</FormLabel>
                                    <FormControl><Input placeholder="e.g., San Francisco, CA or Remote" {...field} /></FormControl>
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
                                            placeholder="e.g. Tech, Finance"
                                            onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} 
                                            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                        />
                                    </FormControl>
                                    <div className="pt-2">
                                        {Array.isArray(field.value) && field.value.map((industry, index) => (
                                            industry && <Badge key={index} variant="secondary" className="mr-1 mb-1">{industry}</Badge>
                                        ))}
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField control={form.control} name="preferences.remote" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Open to Remote</FormLabel>
                                        <FormDescription>Are you willing to work remotely?</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                                </FormItem>
                            )}/>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 flex justify-between">
                <Button type="button" variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
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
