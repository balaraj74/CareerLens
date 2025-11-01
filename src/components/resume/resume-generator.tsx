'use client';

/**
 * Resume Generator Component
 * Generate professional PDFs from profile data with custom themes
 */

import { useState, useEffect } from 'react';
import { Download, FileText, Palette, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { fetchProfile } from '@/lib/profile-service';
import { useFirebase } from '@/lib/firebase-provider';
import { generateResumePDF, downloadResume, previewResume, RESUME_THEMES } from '@/lib/resume-pdf-generator';
import { generateProfessionalSummary, type RewriteTone } from '@/ai/flows/rewrite-resume-section';
import { ResumeData } from '@/lib/types';
import { logCareerActivity } from '@/lib/career-graph-service';

export function ResumeGenerator() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [selectedTone, setSelectedTone] = useState<RewriteTone>('impact-driven');
  const [profileData, setProfileData] = useState<any>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [customSummary, setCustomSummary] = useState<string>('');

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid || !db) return;
      
      setLoading(true);
      try {
        const profile = await fetchProfile(db, user.uid);
        setProfileData(profile);
        
        // Transform profile data to resume format
        if (profile) {
          const transformed: ResumeData = {
            personalInfo: {
              name: profile.name || 'Your Name',
              email: user.email || '',
              phone: (profile as any).phone || '',
              location: (profile as any).location || '',
              linkedin: profile.linkedin || '',
              github: profile.github || '',
              portfolio: (profile as any).portfolio || '',
            },
            summary: profile.bio || '',
            experience: profile.experience?.map((exp: any) => ({
              role: exp.role || exp.title || '',
              company: exp.company || '',
              duration: exp.duration || exp.years || `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`,
              description: exp.description || '',
              achievements: exp.achievements || [],
            })) || [],
            education: profile.education?.map((edu: any) => ({
              degree: edu.degree || '',
              institution: edu.institution || edu.school || '',
              year: edu.year || edu.endDate || '',
              gpa: edu.gpa || '',
            })) || [],
            skills: transformSkills(profile.skills || []),
            projects: (profile as any).projects?.map((proj: any) => ({
              name: proj.name || proj.title || '',
              description: proj.description || '',
              technologies: proj.technologies || proj.tech || [],
              link: proj.link || proj.url || '',
            })) || [],
            certifications: (profile as any).certifications?.map((cert: any) => ({
              name: cert.name || cert.title || '',
              issuer: cert.issuer || cert.organization || '',
              date: cert.date || cert.year || '',
            })) || [],
          };
          
          setResumeData(transformed);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // Transform skills to grouped format
  function transformSkills(skills: any[]): Array<{ category: string; items: string[] }> {
    const grouped: Record<string, string[]> = {};
    
    skills.forEach((skill) => {
      const category = skill.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill.name || skill);
    });

    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }));
  }

  // Generate AI summary
  const handleGenerateSummary = async () => {
    if (!profileData || !user) return;

    setGeneratingSummary(true);
    try {
      const summary = await generateProfessionalSummary(
        {
          role: profileData.currentRole || profileData.title,
          experience: profileData.yearsOfExperience ? `${profileData.yearsOfExperience} years` : undefined,
          skills: profileData.skills?.map((s: any) => s.name || s).slice(0, 10),
          achievements: profileData.achievements?.slice(0, 3),
          targetRole: profileData.careerGoals,
        },
        selectedTone
      );

      setCustomSummary(summary);
      
      // Update resume data
      if (resumeData) {
        setResumeData({
          ...resumeData,
          summary,
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Download PDF
  const handleDownload = async () => {
    if (!resumeData || !user) return;

    setGenerating(true);
    try {
      await downloadResume(resumeData, selectedTheme);
      
      // Log activity
      if (db) {
        try {
          await logCareerActivity(db, user.uid, {
            type: 'profile_updated',
            metadata: {
              projectName: `Resume: ${selectedTheme} theme, ${selectedTone} tone`,
            },
            impact: 7,
          });
        } catch (error) {
          console.error('Failed to log activity:', error);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Preview PDF
  const handlePreview = async () => {
    if (!resumeData) return;

    setGenerating(true);
    try {
      await previewResume(resumeData, selectedTheme);
    } catch (error) {
      console.error('Error previewing PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading profile data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!resumeData) {
    return (
      <Alert>
        <AlertDescription>
          Please complete your profile first to generate a resume.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            One-Click Resume Generator
          </CardTitle>
          <CardDescription>
            Generate a professional PDF resume from your profile data with customizable themes and AI-powered content
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Theme Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
                <div className="space-y-3">
                  {Object.entries(RESUME_THEMES).map(([key, theme]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{theme.name}</span>
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.primaryColor }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.accentColor }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {theme.fontFamily} • {theme.spacing}
                        </p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Tone Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Writing Tone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedTone} onValueChange={(v) => setSelectedTone(v as RewriteTone)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formal" id="formal" />
                    <Label htmlFor="formal" className="cursor-pointer">
                      <div className="font-medium">Formal</div>
                      <p className="text-xs text-muted-foreground">Professional & corporate</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="impact-driven" id="impact-driven" />
                    <Label htmlFor="impact-driven" className="cursor-pointer">
                      <div className="font-medium">Impact-Driven</div>
                      <p className="text-xs text-muted-foreground">Results & achievements</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creative" id="creative" />
                    <Label htmlFor="creative" className="cursor-pointer">
                      <div className="font-medium">Creative</div>
                      <p className="text-xs text-muted-foreground">Dynamic & engaging</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="academic" id="academic" />
                    <Label htmlFor="academic" className="cursor-pointer">
                      <div className="font-medium">Academic</div>
                      <p className="text-xs text-muted-foreground">Scholarly & research</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleDownload}
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              onClick={handlePreview}
              disabled={generating}
              variant="outline"
              className="w-full"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Summary</CardTitle>
              <CardDescription>Generate an AI-powered summary or write your own</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-lg min-h-[100px]">
                <p className="text-sm">
                  {customSummary || resumeData.summary || 'No summary yet. Generate one with AI!'}
                </p>
              </div>
              <Button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                variant="outline"
                size="sm"
              >
                {generatingSummary ? (
                  <>
                    <Sparkles className="mr-2 h-3 w-3 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Content Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resume Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-2xl font-bold text-primary">{resumeData.experience.length}</p>
                  <p className="text-xs text-muted-foreground">positions</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">Education</p>
                  <p className="text-2xl font-bold text-primary">{resumeData.education.length}</p>
                  <p className="text-xs text-muted-foreground">degrees</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">Skills</p>
                  <p className="text-2xl font-bold text-primary">
                    {resumeData.skills.reduce((acc, s) => acc + s.items.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">Projects</p>
                  <p className="text-2xl font-bold text-primary">{resumeData.projects?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">showcased</p>
                </div>
              </div>

              {/* Section Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Contact Info ✓</Badge>
                {resumeData.summary && <Badge variant="outline">Summary ✓</Badge>}
                {resumeData.experience.length > 0 && <Badge variant="outline">Experience ✓</Badge>}
                {resumeData.education.length > 0 && <Badge variant="outline">Education ✓</Badge>}
                {resumeData.skills.length > 0 && <Badge variant="outline">Skills ✓</Badge>}
                {resumeData.projects && resumeData.projects.length > 0 && <Badge variant="outline">Projects ✓</Badge>}
                {resumeData.certifications && resumeData.certifications.length > 0 && <Badge variant="outline">Certifications ✓</Badge>}
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  💡 Tip: Complete more sections in your profile to create a more comprehensive resume
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
