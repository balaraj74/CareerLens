'use client';

/**
 * Resume Evaluator Component
 * Upload, analyze, and improve resumes with AI
 */

import { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseResume, validateResumeFile } from '@/lib/resume-parser';
import { analyzeResume } from '@/ai/flows/analyze-resume';
import { rewriteResumeSection, type RewriteTone } from '@/ai/flows/rewrite-resume-section';
import { ResumeAnalysisResult, ResumeSuggestion } from '@/lib/types';
import { logCareerActivity } from '@/lib/career-graph-service';
import { useFirebase } from '@/lib/firebase-provider';
import { useAuth } from '@/hooks/use-auth';

interface ResumeEvaluatorProps {
  onAnalysisComplete?: (result: ResumeAnalysisResult) => void;
}

export function ResumeEvaluator({ onAnalysisComplete }: ResumeEvaluatorProps) {
  const { user } = useAuth();
  const { db } = useFirebase();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [resumeText, setResumeText] = useState<string>('');
  const [rewriteLoading, setRewriteLoading] = useState<string | null>(null);
  const [rewriteResults, setRewriteResults] = useState<Record<string, any>>({});

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validation = validateResumeFile(selectedFile);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setAnalysis(null);
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Analyze resume
  const handleAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setAnalyzing(true);
    setError(null);

    try {
      // Parse resume
      const parsed = await parseResume(file);
      setResumeText(parsed.rawText);

      // Analyze with AI
      const result = await analyzeResume(parsed.rawText);
      setAnalysis(result);
      
      // Log activity to Career Graph
      if (user?.uid && db) {
        try {
          await logCareerActivity(db, user.uid, {
            type: 'profile_updated',
            metadata: {
              projectName: `Resume Analysis: ${result.scores.overallScore}/100 score`,
            },
            impact: Math.min(10, Math.floor(result.scores.overallScore / 10)),
          });
        } catch (error) {
          console.error('Failed to log analysis activity:', error);
        }
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  // Rewrite section
  const handleRewrite = async (suggestion: ResumeSuggestion, tone: RewriteTone = 'impact-driven') => {
    if (!suggestion.beforeText) return;

    setRewriteLoading(suggestion.id);
    
    try {
      const result = await rewriteResumeSection(
        suggestion.beforeText,
        suggestion.section || 'content',
        tone
      );
      
      setRewriteResults(prev => ({
        ...prev,
        [suggestion.id]: result,
      }));
    } catch (err) {
      console.error('Rewrite error:', err);
    } finally {
      setRewriteLoading(null);
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get score badge variant
  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Resume Evaluator
            </CardTitle>
            <CardDescription>
              Upload your resume for instant AI analysis with ATS optimization, keyword insights, and improvement suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors duration-200
                ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
              `}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    {file ? (
                      <FileText className="h-8 w-8 text-primary" />
                    ) : (
                      <Upload className="h-8 w-8 text-primary" />
                    )}
                  </div>
                </div>
                
                <div>
                  {file ? (
                    <>
                      <p className="text-lg font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">Drop your resume here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOCX, and TXT files (max 10MB)
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{error}</p>
                    
                    {error.includes('restart') && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
                        <strong className="text-yellow-600">Quick Fix:</strong>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Stop the dev server (Ctrl+C in terminal)</li>
                          <li>Run: <code className="bg-black/20 px-1 rounded">npm run dev</code></li>
                          <li>Refresh this page and try again</li>
                        </ol>
                      </div>
                    )}
                    
                    {error.includes('scanned') && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                        <strong className="text-blue-600">Tip:</strong> If your PDF is a scanned image, try:
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Converting it to DOCX format</li>
                          <li>Copying text and saving as TXT file</li>
                          <li>Using an OCR tool to extract text first</li>
                        </ul>
                      </div>
                    )}
                    
                    {!error.includes('restart') && !error.includes('scanned') && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                        <strong className="text-blue-600">Alternative:</strong> Try uploading as DOCX or TXT format instead.
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Analyze Button */}
            {file && (
              <div className="flex gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex-1"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Resume
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setError(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resume Analysis Results</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnalysis(null);
                    setFile(null);
                    setRewriteResults({});
                  }}
                >
                  Analyze Another
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ScoreCard
                  title="Overall Score"
                  score={analysis.scores.overallScore}
                  description="Combined rating"
                />
                <ScoreCard
                  title="ATS Score"
                  score={analysis.scores.atsScore}
                  description="System compatibility"
                />
                <ScoreCard
                  title="Impact Score"
                  score={analysis.scores.impactScore}
                  description="Achievement focus"
                />
                <ScoreCard
                  title="Keywords"
                  score={analysis.scores.keywordScore}
                  description="Optimization level"
                />
                <ScoreCard
                  title="Structure"
                  score={analysis.scores.structureScore}
                  description="Format quality"
                />
                <ScoreCard
                  title="Readability"
                  score={analysis.scores.readabilityScore}
                  description="Clarity & flow"
                />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
            </TabsList>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-4">
              {['critical', 'important', 'optional'].map((type) => {
                const suggestions = analysis.suggestions.filter((s) => s.type === type);
                if (suggestions.length === 0) return null;

                return (
                  <div key={type} className="space-y-3">
                    <h3 className="font-semibold capitalize flex items-center gap-2">
                      {type === 'critical' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {type === 'important' && <Info className="h-4 w-4 text-yellow-500" />}
                      {type === 'optional' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      {type} Improvements ({suggestions.length})
                    </h3>
                    
                    {suggestions.map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onRewrite={handleRewrite}
                        rewriteLoading={rewriteLoading === suggestion.id}
                        rewriteResult={rewriteResults[suggestion.id]}
                      />
                    ))}
                  </div>
                );
              })}
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4">
              <KeywordAnalysis analysis={analysis} />
            </TabsContent>

            {/* Strengths Tab */}
            <TabsContent value="strengths" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections" className="space-y-3">
              {analysis.sections.map((section) => (
                <SectionCard key={section.name} section={section} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// Score Card Component
function ScoreCard({ title, score, description }: { title: string; score: number; description: string }) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold ${getColor(score)}`}>{score}</p>
          <Progress value={score} className="h-2" />
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Suggestion Card Component
function SuggestionCard({
  suggestion,
  onRewrite,
  rewriteLoading,
  rewriteResult,
}: {
  suggestion: ResumeSuggestion;
  onRewrite: (suggestion: ResumeSuggestion, tone: RewriteTone) => void;
  rewriteLoading: boolean;
  rewriteResult?: any;
}) {
  const [showRewrite, setShowRewrite] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {suggestion.category}
                </Badge>
                <Badge className={getImpactColor(suggestion.impact)}>
                  {suggestion.impact} impact
                </Badge>
              </div>
              <h4 className="font-semibold">{suggestion.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
            </div>
          </div>

          {suggestion.beforeText && suggestion.afterText && (
            <div className="grid md:grid-cols-2 gap-3 p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Before:</p>
                <p className="text-sm">{suggestion.beforeText}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">After:</p>
                <p className="text-sm text-green-700">{suggestion.afterText}</p>
              </div>
            </div>
          )}

          {suggestion.beforeText && !suggestion.afterText && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowRewrite(!showRewrite);
                  if (!showRewrite && !rewriteResult) {
                    onRewrite(suggestion, 'impact-driven');
                  }
                }}
                disabled={rewriteLoading}
              >
                {rewriteLoading ? (
                  <>
                    <Sparkles className="mr-2 h-3 w-3 animate-pulse" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    AI Rewrite
                  </>
                )}
              </Button>
            </div>
          )}

          {showRewrite && rewriteResult && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <p className="text-xs font-medium text-green-800">AI Suggestion:</p>
              <p className="text-sm">{rewriteResult.rewrittenText}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  Copy
                </Button>
                <Button size="sm" variant="outline">
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Keyword Analysis Component
function KeywordAnalysis({ analysis }: { analysis: ResumeAnalysisResult }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-600">Present Keywords</CardTitle>
          <CardDescription>Well-used terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordAnalysis.presentKeywords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="bg-green-50">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Missing Keywords</CardTitle>
          <CardDescription>Add these for better ATS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordAnalysis.missingKeywords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="bg-red-50">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-yellow-600">Overused Words</CardTitle>
          <CardDescription>Consider alternatives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordAnalysis.overusedWords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="bg-yellow-50">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Section Card Component
function SectionCard({ section }: { section: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-semibold capitalize">{section.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{section.feedback}</p>
            {section.suggestions && section.suggestions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {section.suggestions.map((sug: any, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{sug.description || sug}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{section.score}</div>
            <div className="text-xs text-muted-foreground">/ 10</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
