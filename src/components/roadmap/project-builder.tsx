'use client';

/**
 * Dynamic Project Builder Component
 * AI-powered project suggestions based on skill gaps
 */

import { useState, useEffect } from 'react';
import { Lightbulb, Code, Target, Clock, TrendingUp, Download, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/lib/firebase-provider';
import { fetchProfile } from '@/lib/profile-service';
import { fetchCareerActivities } from '@/lib/career-graph-service';
import { suggestProjects, generateProjectPlan, generateProjectReadme } from '@/ai/flows/dynamic-project-builder';
import { logCareerActivity } from '@/lib/career-graph-service';

interface ProjectSuggestion {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  skillsToLearn: string[];
  technologies: string[];
  impact: string;
  marketValue: 'high' | 'medium' | 'low';
}

interface ProjectPlan {
  overview: string;
  learningObjectives: string[];
  prerequisites: string[];
  techStack: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    tools?: string[];
  };
  fileStructure: Array<{ path: string; description: string }>;
  steps: Array<{
    title: string;
    description: string;
    duration: string;
    tasks: string[];
  }>;
  resources: Array<{
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'video' | 'article';
  }>;
  challenges: string[];
  extensions: string[];
}

export function ProjectBuilder() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectSuggestion | null>(null);
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState('');
  const [skillGaps, setSkillGaps] = useState<string[]>([]);

  // Load user data
  useEffect(() => {
    async function loadData() {
      if (!user?.uid || !db) return;

      setLoading(true);
      try {
        const profile = await fetchProfile(db, user.uid);
        
        if (profile) {
          // Extract skills
          const skills = profile.skills?.map((s: any) => s.name || s) || [];
          setCurrentSkills(skills);
          setTargetRole(profile.careerGoals || 'Software Developer');
          
          // Identify skill gaps (simplified - in production, use Career Graph analysis)
          const commonSkills = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'GraphQL', 'Testing'];
          const gaps = commonSkills.filter(skill => !skills.includes(skill));
          setSkillGaps(gaps.slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, db]);

  // Analyze and suggest projects
  const handleAnalyze = async () => {
    if (!user?.uid) return;

    setAnalyzing(true);
    try {
      const projects = await suggestProjects(
        currentSkills,
        targetRole,
        skillGaps,
        'intermediate'
      );
      
      setSuggestions(projects);
    } catch (error) {
      console.error('Error suggesting projects:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate detailed plan
  const handleSelectProject = async (project: ProjectSuggestion) => {
    setSelectedProject(project);
    setGeneratingPlan(true);
    
    try {
      const plan = await generateProjectPlan(
        project.title,
        project.description,
        project.skillsToLearn,
        'intermediate developer'
      );
      
      setProjectPlan(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Download project blueprint as PDF
  const handleDownloadBlueprint = () => {
    if (!selectedProject || !projectPlan) return;

    const content = `
# ${selectedProject.title}

## Overview
${projectPlan.overview}

## Learning Objectives
${projectPlan.learningObjectives.map(obj => `- ${obj}`).join('\n')}

## Tech Stack
${Object.entries(projectPlan.techStack).map(([key, value]) => 
  `### ${key}\n${(value as string[]).map(v => `- ${v}`).join('\n')}`
).join('\n\n')}

## Implementation Steps
${projectPlan.steps.map((step, i) => `
### Step ${i + 1}: ${step.title} (${step.duration})
${step.description}

Tasks:
${step.tasks.map(task => `- ${task}`).join('\n')}
`).join('\n')}

## Resources
${projectPlan.resources.map(r => `- [${r.title}](${r.url}) (${r.type})`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedProject.title.replace(/\s+/g, '_')}_Blueprint.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mark project as started
  const handleStartProject = async () => {
    if (!user?.uid || !db || !selectedProject) return;

    try {
      await logCareerActivity(db, user.uid, {
        type: 'project_added',
        metadata: {
          projectName: selectedProject.title,
        },
        impact: 8,
      });
    } catch (error) {
      console.error('Failed to log project start:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarketValueColor = (value: string) => {
    switch (value) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading your profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Dynamic Project Builder
          </CardTitle>
          <CardDescription>
            AI-powered project suggestions based on your skill gaps and career goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Skills</p>
              <p className="text-2xl font-bold">{currentSkills.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Target Role</p>
              <p className="text-lg font-semibold">{targetRole}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Skill Gaps</p>
              <p className="text-2xl font-bold text-yellow-600">{skillGaps.length}</p>
            </div>
          </div>

          {skillGaps.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Skills to develop:</p>
              <div className="flex flex-wrap gap-2">
                {skillGaps.map((skill, i) => (
                  <Badge key={i} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={analyzing || skillGaps.length === 0}
            className="mt-4"
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
                Get Project Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Project Suggestions */}
      {suggestions.length > 0 && !selectedProject && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended Projects</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {suggestions.map((project, i) => (
              <Card
                key={i}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectProject(project)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge className={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{project.estimatedHours}h</span>
                    </div>
                    <div className={`flex items-center gap-1 ${getMarketValueColor(project.marketValue)}`}>
                      <TrendingUp className="h-4 w-4" />
                      <span className="capitalize">{project.marketValue} value</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Skills you'll learn:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.skillsToLearn.slice(0, 4).map((skill, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.skillsToLearn.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.skillsToLearn.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {project.impact}
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" className="w-full">
                    View Full Plan <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Project Plan Detail */}
      {selectedProject && projectPlan && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{selectedProject.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {selectedProject.description}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => {
                  setSelectedProject(null);
                  setProjectPlan(null);
                }}>
                  ← Back to All Projects
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getDifficultyColor(selectedProject.difficulty)}>
                  {selectedProject.difficulty}
                </Badge>
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  {selectedProject.estimatedHours} hours
                </Badge>
                <Badge variant="outline" className={getMarketValueColor(selectedProject.marketValue)}>
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {selectedProject.marketValue} market value
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleStartProject} size="lg">
                  <Code className="mr-2 h-4 w-4" />
                  Start Building
                </Button>
                <Button onClick={handleDownloadBlueprint} variant="outline" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Blueprint
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatingPlan ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
                <p className="text-lg font-medium">Generating detailed project plan...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Creating step-by-step guide, file structure, and resources
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="files">Structure</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{projectPlan.overview}</p>

                    <div>
                      <h4 className="font-semibold mb-2">Learning Objectives</h4>
                      <ul className="space-y-2">
                        {projectPlan.learningObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Prerequisites</h4>
                      <ul className="space-y-1">
                        {projectPlan.prerequisites.map((prereq, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {prereq}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Challenges & Extensions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-yellow-600">Expected Challenges</h4>
                      <ul className="space-y-2">
                        {projectPlan.challenges.map((challenge, i) => (
                          <li key={i} className="text-sm">• {challenge}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Future Extensions</h4>
                      <ul className="space-y-2">
                        {projectPlan.extensions.map((ext, i) => (
                          <li key={i} className="text-sm">• {ext}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tech" className="space-y-4">
                {Object.entries(projectPlan.techStack).map(([category, technologies]) => (
                  technologies && technologies.length > 0 && (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="capitalize">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {technologies.map((tech, i) => (
                            <Badge key={i} variant="secondary">{tech}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                {projectPlan.steps.map((step, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Step {i + 1}: {step.title}</CardTitle>
                        <Badge variant="outline">{step.duration}</Badge>
                      </div>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-2">Tasks:</h4>
                      <ul className="space-y-2">
                        {step.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" />
                            <span className="text-sm">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="resources" className="space-y-3">
                {projectPlan.resources.map((resource, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="files" className="space-y-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Project File Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 font-mono text-sm">
                      {projectPlan.fileStructure.map((file, i) => (
                        <div key={i} className="p-2 bg-muted rounded">
                          <p className="font-semibold text-primary">{file.path}</p>
                          <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}
