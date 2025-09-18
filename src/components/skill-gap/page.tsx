'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Target, CheckCircle2, XCircle, ListOrdered } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getSkillGapAnalysis } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { SkillGapAnalysisOutput } from '@/ai/flows/perform-skill-gap-analysis';

const formSchema = z.object({
  userSkills: z.string().min(3, 'Please list at least one skill.'),
  targetRoleRequirements: z.string().min(3, 'Please list at least one requirement.'),
});

export function SkillGapPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SkillGapAnalysisOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userSkills: 'React, Node.js, JavaScript, HTML, CSS, Git',
      targetRoleRequirements: 'React, Redux, Node.js, TypeScript, GraphQL, Docker, Kubernetes, CI/CD',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const payload = {
      userSkills: values.userSkills.split(',').map(s => s.trim()).filter(Boolean),
      targetRoleRequirements: values.targetRoleRequirements.split(',').map(s => s.trim()).filter(Boolean),
    };
    const response = await getSkillGapAnalysis(payload);
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
        <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="w-8 h-8 text-primary"/> Skill Gap Analysis</h1>
        <p className="text-muted-foreground">Identify the skills you need to land your dream job.</p>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Define Your Profile and Goal</CardTitle>
          <CardDescription>Enter your skills and the requirements for your target role, separating each skill with a comma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="userSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Current Skills</FormLabel>
                      <FormControl>
                        <Textarea placeholder="React, Node.js, Python..." {...field} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetRoleRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Role Requirements</FormLabel>
                      <FormControl>
                        <Textarea placeholder="TypeScript, GraphQL, Docker..." {...field} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Skill Gap
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-glow">Your Analysis Results</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><CheckCircle2 className="w-6 h-6 text-green-400 text-glow-green"/>Your Strengths</CardTitle>
                        <CardDescription>Skills you possess that are required for the role.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {result.overlappingSkills.length > 0 ? 
                            result.overlappingSkills.map((skill, i) => <Badge key={i} className="bg-green-500/10 border-green-500/50 text-green-300">{skill}</Badge>) :
                            <p className="text-muted-foreground text-sm">No overlapping skills found.</p>
                        }
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><XCircle className="w-6 h-6 text-red-400"/>Your Skill Gaps</CardTitle>
                         <CardDescription>Skills required for the role that you are missing.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                         {result.missingSkills.length > 0 ?
                            result.missingSkills.map((skill, i) => <Badge key={i} variant="destructive">{skill}</Badge>) :
                            <p className="text-muted-foreground text-sm">No missing skills found. Great fit!</p>
                        }
                    </CardContent>
                </Card>
            </div>
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg"><ListOrdered className="w-6 h-6 text-cyan-400"/>Suggested Learning Path</CardTitle>
                    <CardDescription>A recommended path to acquire the missing skills efficiently, starting with the most foundational.</CardDescription>
                </CardHeader>
                <CardContent>
                    {result.suggestedLearningOrder.length > 0 ? (
                        <ol className="space-y-4">
                            {result.suggestedLearningOrder.map((skill, i) => (
                                <li key={i} className="flex items-center gap-4 bg-background/50 p-3 rounded-lg">
                                    <span className="flex items-center justify-center w-8 h-8 font-bold text-primary bg-primary/10 rounded-full shrink-0">{i + 1}</span>
                                    <span className="font-medium text-base text-foreground">{skill}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-muted-foreground text-sm">No learning path needed as no skill gaps were identified.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
