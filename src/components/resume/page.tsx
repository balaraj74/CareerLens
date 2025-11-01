'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResumeEvaluator } from './resume-evaluator';
import { ResumeGenerator } from './resume-generator';

export function ResumePage() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ y: -8, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold font-headline text-glow flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            AI-Powered Resume Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Generate professional resumes with one click or analyze existing ones with AI for ATS optimization and improvement suggestions
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className={`cursor-pointer transition-all ${activeTab === 'generate' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Resume Generator
              </CardTitle>
              <CardDescription>
                Create professional PDFs from your profile with custom themes and AI-powered content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${activeTab === 'evaluate' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('evaluate')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Resume Evaluator
              </CardTitle>
              <CardDescription>
                Upload and analyze your resume for ATS compatibility, keywords, and get AI suggestions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="evaluate" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Evaluate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <ResumeGenerator />
          </TabsContent>

          <TabsContent value="evaluate" className="mt-6">
            <ResumeEvaluator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
