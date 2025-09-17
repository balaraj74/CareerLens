'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { PlusCircle, Trash2 } from 'lucide-react';

import {
  userProfileSchema,
  type UserProfile,
} from '@/lib/types';
import { defaultProfileData } from '@/lib/data';

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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export function ProfilePage() {
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

   const {
    fields: interestFields,
    append: appendInterest,
    remove: removeInterest,
  } = useFieldArray({
    control: form.control,
    name: 'interests',
  });

  function onSubmit(data: UserProfile) {
    // Here you would typically save the data to your backend/database.
    // For this example, we'll just log it.
    console.log(data);
    alert('Profile saved! Check the console for the data.');
  }

  return (
    <div className="p-4 md:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your professional information.
              </p>
            </div>
            <Button type="submit">Save Profile</Button>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal & Preferences</CardTitle>
                  <CardDescription>Update your personal details and job preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., San Francisco, CA or Remote" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.remote"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Open to Remote</FormLabel>
                            <FormDescription>
                              Are you willing to work remotely?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="experience">
              <Card>
                <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                    <CardDescription>List your professional roles and responsibilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {experienceFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg relative">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                onClick={() => removeExperience(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <FormField
                                    control={form.control}
                                    name={`experience.${index}.role`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Software Engineer" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`experience.${index}.years`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Years</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. 5" type="number" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name={`experience.${index}.skills`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skills Used (comma-separated)</FormLabel>
                                    <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} placeholder="React, Node.js, Python" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendExperience({ role: '', years: '', skills: [] })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card>
                <CardHeader>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Your academic background.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {educationFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg relative">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                onClick={() => removeEducation(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`education.${index}.degree`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Degree</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Bachelor of Science" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`education.${index}.field`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field of Study</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Computer Science" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name={`education.${index}.year`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year of Graduation</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. 2022" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendEducation({ degree: '', field: '', year: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>

             <TabsContent value="skills">
              <Card>
                <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>List your technical and soft skills.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {skillFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg relative">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                onClick={() => removeSkill(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="grid md:grid-cols-2 gap-4">
                               <FormField
                                control={form.control}
                                name={`skills.${index}.name`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skill</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. TypeScript" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`skills.${index}.level`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proficiency</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g. Expert" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendSkill({ name: '', level: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interests">
                 <Card>
                    <CardHeader>
                        <CardTitle>Interests</CardTitle>
                        <CardDescription>What are you passionate about?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Interests (comma-separated)</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="AI, Design, Startups" 
                                        onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} 
                                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                    />
                                </FormControl>
                                 <div className="pt-2">
                                    {Array.isArray(field.value) && field.value.map((interest, index) => (
                                        interest && <Badge key={index} variant="secondary" className="mr-1 mb-1">{interest}</Badge>
                                    ))}
                                 </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                 </Card>
            </TabsContent>

          </Tabs>
        </form>
      </Form>
    </div>
  );
}
