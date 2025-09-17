'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, MessageSquare, BrainCircuit, Lightbulb } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getInterviewQuestions } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import type { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';

const formSchema = z.object({
  careerRole: z.string().min(3, 'Please specify a career role.'),
});

export function InterviewPrepPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateInterviewQuestionsOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      careerRole: 'Senior React Developer',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const response = await getInterviewQuestions(values);
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

  const easyQuestions = result?.interviewQuestions.filter(q => q.difficulty === 'easy') || [];
  const mediumQuestions = result?.interviewQuestions.filter(q => q.difficulty === 'medium') || [];
  const hardQuestions = result?.interviewQuestions.filter(q => q.difficulty === 'hard') || [];


  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><MessageSquare className="w-8 h-8 text-primary"/> AI Interview Prep</h1>
        <p className="text-muted-foreground">Practice with AI-generated questions and answers for any role.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Enter Target Role</CardTitle>
          <CardDescription>Specify the job title you're interviewing for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="careerRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Product Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Interview Questions for: <span className="text-primary">{form.getValues('careerRole')}</span></h2>
            <Tabs defaultValue="easy">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="easy">Easy ({easyQuestions.length})</TabsTrigger>
                    <TabsTrigger value="medium">Medium ({mediumQuestions.length})</TabsTrigger>
                    <TabsTrigger value="hard">Hard ({hardQuestions.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="easy">
                    <QuestionList questions={easyQuestions} />
                </TabsContent>
                <TabsContent value="medium">
                    <QuestionList questions={mediumQuestions} />
                </TabsContent>
                <TabsContent value="hard">
                     <QuestionList questions={hardQuestions} />
                </TabsContent>
            </Tabs>
        </div>
      )}
    </div>
  );
}

function QuestionList({ questions }: { questions: NonNullable<GenerateInterviewQuestionsOutput>['interviewQuestions']}) {
    if (questions.length === 0) {
        return <p className="text-muted-foreground text-center p-8">No questions in this category.</p>;
    }
    return (
        <Accordion type="multiple" className="w-full space-y-2">
            {questions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-card">
                    <AccordionTrigger className="p-4 text-left font-medium hover:no-underline">
                        <div className="flex items-start gap-4">
                            <BrainCircuit className="w-5 h-5 text-primary mt-1 shrink-0"/>
                            {q.question}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                         <div className="p-4 bg-muted/50 rounded-md border-l-4 border-primary">
                             <h4 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb className="w-5 h-5 text-amber-500" />Model Answer</h4>
                             <p className="text-muted-foreground whitespace-pre-line">{q.modelAnswer}</p>
                         </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
