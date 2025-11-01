'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, BookOpen, Link as LinkIcon, DollarSign, Rocket, Map } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getPersonalizedRoadmap } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectBuilder } from '@/components/roadmap/project-builder';
import type { CreatePersonalizedRoadmapOutput } from '@/ai/schemas/create-personalized-roadmap';

const formSchema = z.object({
  careerRecommendation: z.string().min(3, 'Please specify a career goal.'),
  userSkills: z.string(),
  missingSkills: z.string().min(3, 'Please list skills to learn.'),
});

export function RoadmapPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreatePersonalizedRoadmapOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      careerRecommendation: 'Senior Frontend Developer',
      userSkills: 'React, JavaScript, HTML, CSS',
      missingSkills: 'TypeScript, GraphQL, Redux Toolkit, Next.js',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const payload = {
      ...values,
      userSkills: values.userSkills.split(',').map(s => s.trim()).filter(Boolean),
      missingSkills: values.missingSkills.split(',').map(s => s.trim()).filter(Boolean),
    };
    const response = await getPersonalizedRoadmap(payload);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary"/> 
          Career Development Hub
        </h1>
        <p className="text-muted-foreground">
          Plan your learning journey and build portfolio projects with AI guidance.
        </p>
      </div>

      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="roadmap" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Learning Roadmap
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Project Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Define Your Goal</CardTitle>
              <CardDescription>Enter your target career and skills to generate a roadmap.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="careerRecommendation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Career</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Data Scientist" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Existing Skills (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="React, Node.js, Python..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="missingSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills to Learn (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="TypeScript, GraphQL, Docker..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Roadmap...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Roadmap
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-glow">Your 12-Week Learning Plan</h2>
              <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-0">
                {result.learningPlan.map((week, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className="glass-card rounded-2xl border-0">
                    <AccordionTrigger className="text-xl font-semibold hover:no-underline p-6">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-12 h-12 font-bold text-primary bg-primary/10 rounded-xl shrink-0 border-2 border-primary/20">
                          {week.week}
                        </span>
                        <span className="text-left">{week.topic}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                      <div className="space-y-4 border-l-2 border-primary/30 pl-6 ml-6">
                        <h4 className="font-semibold text-lg">Recommended Resources:</h4>
                        <ul className="space-y-4">
                          {week.resources.map((resource, rIndex) => (
                            <li key={rIndex} className="flex items-start justify-between p-4 rounded-lg border bg-background/50 glass-card transition-all duration-300 hover:border-primary/50">
                              <div className="space-y-1">
                                <p className="font-semibold text-base">{resource.name}</p>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5 transition-colors">
                                  <LinkIcon className="w-4 h-4" />
                                  <span>Visit Resource</span>
                                </a>
                              </div>
                              <Badge variant={resource.type === 'free' ? 'secondary' : 'default'} className="capitalize h-fit">
                                {resource.type === 'paid' && <DollarSign className="w-3 h-3 mr-1"/>}
                                {resource.type}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects">
          <ProjectBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
