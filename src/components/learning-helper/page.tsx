'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  BookText, 
  BrainCircuit, 
  Lightbulb,
  FileVideo,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  Loader2,
  File as FileIcon,
  CheckCircle2,
  ListTree,
  FileQuestion,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from '@/components/ui/card';
import { getLearningHelperOutput } from '@/lib/actions';
import type { LearningOrchestratorOutput } from '@/ai/schemas/learning-orchestrator';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

const learningModes = [
    { name: 'Quick Points', icon: Lightbulb },
    { name: 'Deep Dive', icon: BookOpen },
    { name: 'Mind Map', icon: ListTree },
    { name: 'Visuals', icon: Sparkles },
    { name: 'Video', icon: FileVideo },
    { name: 'Exam Mode', icon: FileQuestion },
    { name: 'AI Tutor', icon: MessageSquare },
]

export function LearningHelperPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [aiOutput, setAiOutput] = useState<LearningOrchestratorOutput | null>(null);
    const { toast } = useToast();


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload a valid PDF file.',
            });
            return;
        }

        setFileName(file.name);
        setIsProcessing(true);
        setAiOutput(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const pdfDataUri = reader.result as string;
                const response = await getLearningHelperOutput({ pdfDataUri });

                if (response.success && response.data) {
                    setAiOutput(response.data);
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'AI Processing Failed',
                        description: response.error || 'An unknown error occurred.',
                    });
                     handleReset(); // Reset UI on failure
                }
                 setIsProcessing(false);
            };
            reader.onerror = (error) => {
                 toast({
                    variant: 'destructive',
                    title: 'File Read Error',
                    description: 'Could not read the selected file.',
                });
                setIsProcessing(false);
                handleReset();
            };
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Something went wrong.',
            });
            setIsProcessing(false);
            handleReset();
        }
    };

    const handleReset = () => {
        setFileName(null);
        setIsProcessing(false);
        setAiOutput(null);
    }

  return (
    <div className="p-4 md:p-6 space-y-8 min-h-screen">
       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold flex items-center gap-3 font-headline text-glow">
                <Sparkles className="w-8 h-8 text-primary"/>
                AI Learning Helper
            </h1>
            <p className="text-muted-foreground">Your next-gen study companion. Upload a PDF to get started.</p>
       </motion.div>

       <AnimatePresence mode="wait">
        {!fileName ? (
            <motion.div key="upload-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Card className="glass-card w-full max-w-2xl mx-auto text-center py-16 px-6">
                    <CardContent className="flex flex-col items-center justify-center gap-6">
                         <div className="p-6 bg-primary/10 rounded-full border-2 border-dashed border-primary/50 animate-pulse-slow">
                            <UploadCloud className="w-16 h-16 text-primary" strokeWidth={1.5}/>
                         </div>
                        <h2 className="text-2xl font-bold font-headline">Upload Your Study Material</h2>
                        <p className="text-muted-foreground">Drop any Unit PDF, Notes, or Study Material here and let AI do the rest.</p>
                        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-lg h-14 px-8" disabled={isProcessing}>
                            <label htmlFor="file-upload">
                                {isProcessing ? "Processing..." : "Choose File"}
                                <input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".pdf" disabled={isProcessing}/>
                            </label>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        ) : (
            <motion.div key="results-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <Card className="glass-card mb-6">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <FileIcon className="w-6 h-6 text-primary"/>
                            <span className="font-semibold">{fileName}</span>
                        </div>
                        {isProcessing ? (
                             <div className="w-full md:w-64 flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin"/>
                                <p className="text-sm text-muted-foreground">
                                    AI is processing your document...
                                </p>
                             </div>
                        ) : (
                            <Button variant="outline" onClick={handleReset}>Upload another file</Button>
                        )}
                    </CardContent>
                </Card>

                <Tabs defaultValue="Quick Points" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2">
                        {learningModes.map(mode => (
                             <TabsTrigger key={mode.name} value={mode.name} disabled={isProcessing} className="flex flex-col md:flex-row gap-2 h-12">
                                <mode.icon className="w-5 h-5"/>
                                {mode.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center p-16 glass-card rounded-2xl mt-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4"/>
                            <h3 className="text-xl font-bold">AI is warming up...</h3>
                            <p className="text-muted-foreground">Analyzing your document and preparing your learning environment.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <TabsContent value="Quick Points" className="p-6 glass-card rounded-2xl mt-4">
                                <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3"><Lightbulb/>Quick Points</h2>
                                {aiOutput?.quickPoints ? (
                                    <ul className="space-y-3">
                                        {aiOutput.quickPoints.map((point, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0"/>
                                                <span className="text-foreground">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted-foreground">AI-generated summary will appear here...</p>}
                            </TabsContent>
                           <TabsContent value="Deep Dive" className="p-6 glass-card rounded-2xl mt-4">
                                <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3"><BookOpen/>Deep Dive</h2>
                                {aiOutput?.deepDive ? (
                                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiOutput.deepDive.replace(/\n/g, '<br />') }} />
                                ) : <p className="text-muted-foreground">Detailed explanations will appear here...</p>}
                            </TabsContent>
                            <TabsContent value="Mind Map" className="p-6 glass-card rounded-2xl mt-4">
                                 <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3"><ListTree/>Mind Map</h2>
                                {aiOutput?.mindMap?.label ? (
                                    <div className="space-y-4">
                                        <p className="text-muted-foreground">Hierarchical view of the document's structure.</p>
                                        <div className="p-4 bg-background/50 rounded-lg">
                                            <MindMapNode node={aiOutput.mindMap} level={0} />
                                        </div>
                                    </div>
                                ) : <p className="text-muted-foreground">An interactive mind map will be generated here...</p>}
                            </TabsContent>
                            <TabsContent value="Exam Mode" className="p-6 glass-card rounded-2xl mt-4">
                                <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3"><FileQuestion/>Exam Mode</h2>
                                {aiOutput?.examQuestions ? (
                                    <div className="space-y-6">
                                        {aiOutput.examQuestions.map((q, index) => (
                                            <Card key={index} className="bg-background/50">
                                                <CardContent className="p-4">
                                                    <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                                                    <RadioGroup>
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={opt} id={`q${index}-opt${i}`} />
                                                                <Label htmlFor={`q${index}-opt${i}`}>{opt}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                    <p className="text-sm text-green-400 mt-3">Correct Answer: {q.answer}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : <p className="text-muted-foreground">Practice questions and quizzes will appear here...</p>}
                            </TabsContent>
                             <TabsContent value="Visuals" className="p-6 glass-card rounded-2xl mt-4">
                                <h2 className="text-2xl font-bold mb-4">Visuals</h2>
                                <p className="text-muted-foreground">Generated images and animations will appear here...</p>
                            </TabsContent>
                             <TabsContent value="Video" className="p-6 glass-card rounded-2xl mt-4">
                                <h2 className="text-2xl font-bold mb-4">Video</h2>
                                <p className="text-muted-foreground">Your micro-learning video will be generated here...</p>
                            </TabsContent>
                             <TabsContent value="AI Tutor" className="p-6 glass-card rounded-2xl mt-4">
                                <h2 className="text-2xl font-bold mb-4">AI Tutor</h2>
                                <p className="text-muted-foreground">A chat interface to talk to your AI tutor will be here...</p>
                            </TabsContent>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </Tabs>
            </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
}


// Recursive component to render mind map
function MindMapNode({ node, level }: { node: NonNullable<LearningOrchestratorOutput['mindMap']>, level: number }) {
  return (
    <div style={{ marginLeft: level * 20 }}>
      <div className="flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-primary/80 shrink-0"/>
        <span className="font-semibold">{node.label}</span>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-primary/20 pl-4">
          {node.children.map(child => (
            <MindMapNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
