'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  PlusCircle,
  Trash2,
  User,
  School,
  Briefcase,
  Sparkles,
  MapPin,
  Loader2,
  Bot,
  Linkedin,
  Github,
  Mail,
  Phone,
  Cake,
  Binary,
  Upload,
  X,
  CalendarIcon,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

import { userProfileSchema, type UserProfile } from '@/lib/types';
import { defaultProfileData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { fetchProfile, saveProfile } from '@/lib/profile-service';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

export function ProfilePageV2() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [newSkill, setNewSkill] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: defaultProfileData,
    mode: 'onChange',
  });

  useEffect(() => {
    // This check is critical. Do not attempt to load a profile until the user object is confirmed to exist.
    // This prevents the race condition that causes the "client is offline" error.
    if (!user) {
      // If there's no user, we either wait or show a login prompt.
      // For now, we just won't do anything, and the loading state will persist.
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      const { data, error } = await fetchProfile(user.uid);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load profile',
          description: error,
        });
        // Reset with authenticated user's details even if profile fetch fails
        form.reset({
          ...defaultProfileData,
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
        });
      } else if (data) {
        // Profile exists, populate the form
        form.reset({
          ...data,
          name: data.name || user.displayName || '',
          email: data.email || user.email || '',
          photoURL: data.photoURL || user.photoURL || '',
          // Ensure dob is a Date object if it exists
          dob: data.dob ? new Date(data.dob) : undefined, 
        });
        setPreviewImage(data.photoURL || user.photoURL || null);
      } else {
        // New user, no profile yet. Pre-fill with auth data.
        form.reset({
          ...defaultProfileData,
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
        });
        setPreviewImage(user.photoURL || null);
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [user, form, toast]);

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control: form.control, name: 'experience' });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control: form.control, name: 'education' });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: 'skills',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        form.setValue('photoURL', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      appendSkill({ name: newSkill.trim(), proficiency: 'Intermediate' });
      setNewSkill('');
    }
  };

  async function onSubmit(data: UserProfile) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to save your profile.',
      });
      return;
    }
    setIsSubmitting(true);
    const { success, error } = await saveProfile(user.uid, data);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Profile Saved! ✅',
        description: 'Your information has been successfully updated.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Save Failed ❌',
        description: error,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-64" />
              </div>
            </div>
            <div className="mt-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full mt-4" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-glow">Your Profile</h1>
        <p className="text-muted-foreground">Keep your professional details up-to-date.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary/30 group-hover:border-primary/80 transition-all">
                  <AvatarImage src={previewImage || undefined} alt={form.getValues('name')} />
                  <AvatarFallback className="text-3xl">
                    {form
                      .getValues('name')
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('') || <User />}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{form.getValues('name')}</h2>
                <p className="text-muted-foreground">{form.getValues('email')}</p>
                <TabsList className="mt-4">
                  <TabsTrigger value="profile">
                    <User className="mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="experience">
                    <Briefcase className="mr-2" />
                    Experience & Skills
                  </TabsTrigger>
                  <TabsTrigger value="goals">
                    <MapPin className="mr-2" />
                    Goals
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <Card className="glass-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="profile" forceMount className={activeTab === 'profile' ? 'block' : 'hidden'}>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        This information will be used to personalize your career recommendations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
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
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="ada@futureofcode.com" {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date of birth</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date('1900-01-01')
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="non-binary">Non-binary</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                  <SelectItem value="prefer-not-to-say">
                                    Prefer not to say
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Summary</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A brief 2-3 sentence summary of your career and skills."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </TabsContent>
                  <TabsContent value="experience" forceMount className={activeTab === 'experience' ? 'block' : 'hidden'}>
                     <CardHeader>
                        <CardTitle>Experience & Skills</CardTitle>
                        <CardDescription>Detail your professional journey and expertise.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Work Experience</h3>
                          <div className="space-y-4">
                            {experienceFields.map((field, index) => (
                              <div key={field.id} className="p-4 border rounded-lg relative space-y-2 bg-background/30">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <FormField control={form.control} name={`experience.${index}.role`} render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} placeholder="Software Engineer" /></FormControl><FormMessage /></FormItem>)}/>
                                  <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} placeholder="TechCorp" /></FormControl><FormMessage /></FormItem>)}/>
                                  <FormField control={form.control} name={`experience.${index}.years`} render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} placeholder="e.g., 2 years" /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Describe your responsibilities and achievements." /></FormControl><FormMessage /></FormItem>)}/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeExperience(index)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            ))}
                             <Button type="button" variant="outline" onClick={() => appendExperience({ role: '', company: '', years: '', description: '', skills: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                          </div>
                        </div>
                         <div>
                          <h3 className="text-lg font-medium mb-4">Education</h3>
                          <div className="space-y-4">
                            {educationFields.map((field, index) => (
                              <div key={field.id} className="p-4 border rounded-lg relative space-y-2 bg-background/30">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...field} placeholder="Bachelor of Science" /></FormControl><FormMessage /></FormItem>)}/>
                                  <FormField control={form.control} name={`education.${index}.field`} render={({ field }) => (<FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input {...field} placeholder="Computer Science" /></FormControl><FormMessage /></FormItem>)}/>
                                  <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} placeholder="University of Innovation" /></FormControl><FormMessage /></FormItem>)}/>
                                  <FormField control={form.control} name={`education.${index}.year`} render={({ field }) => (<FormItem><FormLabel>Year of Completion</FormLabel><FormControl><Input {...field} placeholder="2022" /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(index)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendEducation({ degree: '', field: '', institution: '', year: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-4">Skills</h3>
                            <div className="flex gap-2 mb-4">
                              <Input
                                placeholder="Add a new skill"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                              />
                              <Button type="button" onClick={handleAddSkill}><PlusCircle className="mr-2"/> Add</Button>
                            </div>
                           <div className="flex flex-wrap gap-2">
                              {skillFields.map((field, index) => (
                                <Badge key={field.id} variant="secondary" className="text-base py-1 px-3">
                                  {field.name}
                                  <button type="button" onClick={() => removeSkill(index)} className="ml-2 rounded-full hover:bg-destructive/50 p-0.5"><X className="h-3 w-3"/></button>
                                </Badge>
                              ))}
                           </div>
                        </div>
                      </CardContent>
                  </TabsContent>
                  <TabsContent value="goals" forceMount className={activeTab === 'goals' ? 'block' : 'hidden'}>
                     <CardHeader>
                        <CardTitle>Career Goals & Links</CardTitle>
                        <CardDescription>Help us understand your ambitions and find you online.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="careerGoals"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Career Goals</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="What are your short-term and long-term career aspirations? What kind of role or industry are you targeting?" {...field} rows={5}/>
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
                                <FormLabel>LinkedIn Profile</FormLabel>
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
                                <FormLabel>GitHub/Portfolio Link</FormLabel>
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
                      </CardContent>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
               <CardFooter className="justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-accent">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
