'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/hooks/use-auth';
import {
  fetchEnhancedProfile,
  saveEnhancedProfile,
  calculateAnalytics,
} from '@/lib/enhanced-profile-service';
import type { EnhancedUserProfile, Certification, Language } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Heart,
  Plus,
  Trash2,
  Save,
  Loader2,
  Eye,
  Calendar,
  MapPin,
  Building,
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function ProfileEditForm() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<EnhancedUserProfile>>({});

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user || !db) return;

    try {
      setLoading(true);
      const data = await fetchEnhancedProfile(db, user.uid);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !db) return;

    try {
      setSaving(true);
      await saveEnhancedProfile(db, user.uid, profile);
      await calculateAnalytics(db, user.uid);

      toast({
        title: 'Success',
        description: 'Profile saved successfully!',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experienceDetails: [
        ...(profile.experienceDetails || []),
        {
          role: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: [''],
          technologies: [],
        },
      ],
    });
  };

  const removeExperience = (index: number) => {
    const updated = [...(profile.experienceDetails || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, experienceDetails: updated });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...(profile.experienceDetails || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, experienceDetails: updated });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      educationDetails: [
        ...(profile.educationDetails || []),
        {
          degree: '',
          field: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
          honors: [],
          coursework: [],
        },
      ],
    });
  };

  const removeEducation = (index: number) => {
    const updated = [...(profile.educationDetails || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, educationDetails: updated });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...(profile.educationDetails || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, educationDetails: updated });
  };

  const addCertification = () => {
    setProfile({
      ...profile,
      certifications: [
        ...(profile.certifications || []),
        {
          id: Date.now().toString(),
          name: '',
          issuer: '',
          issueDate: '',
          credentialId: '',
          credentialUrl: '',
        },
      ],
    });
  };

  const removeCertification = (index: number) => {
    const updated = [...(profile.certifications || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, certifications: updated });
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...(profile.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, certifications: updated });
  };

  const addSkill = (skillName: string) => {
    if (!skillName.trim()) return;
    setProfile({
      ...profile,
      skills: [...(profile.skills || []), { name: skillName.trim() }],
    });
  };

  const removeSkill = (index: number) => {
    const updated = [...(profile.skills || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, skills: updated });
  };

  const addLanguage = () => {
    setProfile({
      ...profile,
      languages: [
        ...(profile.languages || []),
        { name: '', proficiency: 'Professional' },
      ],
    });
  };

  const removeLanguage = (index: number) => {
    const updated = [...(profile.languages || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, languages: updated });
  };

  const updateLanguage = (index: number, field: string, value: any) => {
    const updated = [...(profile.languages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, languages: updated });
  };

  const addInterest = (interest: string) => {
    if (!interest.trim()) return;
    setProfile({
      ...profile,
      interests: [...(profile.interests || []), interest.trim()],
    });
  };

  const removeInterest = (index: number) => {
    const updated = [...(profile.interests || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, interests: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Edit Your Profile
            </h1>
            <p className="text-slate-300">
              Keep your profile up to date to get better recommendations
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full bg-slate-800/50 border border-slate-700 p-1 h-auto">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300 py-3"
            >
              <User className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300 py-3"
            >
              <Briefcase className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Experience</span>
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300 py-3"
            >
              <GraduationCap className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300 py-3"
            >
              <Code className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger
              value="certifications"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300 py-3"
            >
              <Award className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Certs</span>
            </TabsTrigger>
            <TabsTrigger
              value="more"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300 py-3"
            >
              <Heart className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">More</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-6">
            <Card className="p-6 sm:p-8 space-y-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                  <p className="text-slate-400 text-sm">
                    Your personal and contact details
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-400" />
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={profile.email || user?.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Phone Number
                  </Label>
                  <Input
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    Location
                  </Label>
                  <Input
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, State/Country"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    Professional Title
                  </Label>
                  <Input
                    value={profile.title || ''}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Website/Portfolio
                  </Label>
                  <Input
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium">LinkedIn Profile</Label>
                  <Input
                    value={profile.linkedin || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">GitHub Profile</Label>
                  <Input
                    value={profile.github || ''}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    placeholder="github.com/username"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">Twitter/X</Label>
                  <Input
                    value={profile.twitter || ''}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                    placeholder="@username"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label className="text-white font-medium text-lg">
                  Professional Summary
                </Label>
                <p className="text-slate-400 text-sm mb-2">
                  Write a compelling summary that highlights your expertise and career
                  achievements
                </p>
                <Textarea
                  value={profile.summary || ''}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  placeholder="I am a passionate software engineer with 5+ years of experience..."
                  rows={5}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium text-lg">Career Objective</Label>
                <p className="text-slate-400 text-sm mb-2">
                  Share your career goals and what you're looking to achieve
                </p>
                <Textarea
                  value={profile.objective || ''}
                  onChange={(e) => setProfile({ ...profile, objective: e.target.value })}
                  placeholder="Seeking opportunities to leverage my expertise in..."
                  rows={4}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="mt-6">
            <Card className="p-6 sm:p-8 space-y-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                    <p className="text-slate-400 text-sm">
                      Add your professional work history
                    </p>
                  </div>
                </div>
                <Button
                  onClick={addExperience}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {(profile.experienceDetails || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No work experience added yet</p>
                  <p className="text-sm">
                    Click "Add Experience" to start building your work history
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(profile.experienceDetails || []).map((exp, index) => (
                    <Card
                      key={index}
                      className="p-6 space-y-4 bg-slate-900/50 border-slate-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded">
                            <Building className="w-5 h-5 text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-lg text-white">
                            Experience #{index + 1}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white font-medium">
                            Job Title <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            value={exp.role}
                            onChange={(e) =>
                              updateExperience(index, 'role', e.target.value)
                            }
                            placeholder="e.g., Software Engineer"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium">
                            Company <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(index, 'company', e.target.value)
                            }
                            placeholder="e.g., Tech Corp Inc."
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium">Location</Label>
                          <Input
                            value={exp.location || ''}
                            onChange={(e) =>
                              updateExperience(index, 'location', e.target.value)
                            }
                            placeholder="e.g., San Francisco, CA"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Start Date
                          </Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateExperience(index, 'startDate', e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            End Date
                          </Label>
                          <Input
                            type="month"
                            value={exp.endDate || ''}
                            onChange={(e) =>
                              updateExperience(index, 'endDate', e.target.value)
                            }
                            disabled={exp.current}
                            className="bg-slate-800/50 border-slate-600 text-white disabled:opacity-50"
                          />
                        </div>

                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) =>
                              updateExperience(index, 'current', e.target.checked)
                            }
                            className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                            id={`current-${index}`}
                          />
                          <Label htmlFor={`current-${index}`} className="text-white">
                            Currently working here
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white font-medium">
                          Job Description
                        </Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) =>
                            updateExperience(index, 'description', e.target.value)
                          }
                          placeholder="Describe your role and responsibilities..."
                          rows={3}
                          className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white font-medium">
                          Key Achievements (one per line)
                        </Label>
                        <Textarea
                          value={exp.achievements.join('\n')}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              'achievements',
                              e.target.value.split('\n').filter(Boolean)
                            )
                          }
                          placeholder="• Led development of a new feature that increased user engagement by 30%&#10;• Mentored 3 junior developers&#10;• Improved system performance by 50%"
                          rows={4}
                          className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="mt-6">
            <Card className="p-6 sm:p-8 space-y-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Education</h2>
                    <p className="text-slate-400 text-sm">
                      Add your academic qualifications
                    </p>
                  </div>
                </div>
                <Button
                  onClick={addEducation}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </div>

              {(profile.educationDetails || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No education added yet</p>
                  <p className="text-sm">
                    Click "Add Education" to add your academic credentials
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(profile.educationDetails || []).map((edu, index) => (
                    <Card
                      key={index}
                      className="p-6 space-y-4 bg-slate-900/50 border-slate-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded">
                            <GraduationCap className="w-5 h-5 text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-lg text-white">
                            Education #{index + 1}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white font-medium">
                            Degree <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(index, 'degree', e.target.value)
                            }
                            placeholder="e.g., Bachelor of Science"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium">
                            Field of Study <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            value={edu.field}
                            onChange={(e) =>
                              updateEducation(index, 'field', e.target.value)
                            }
                            placeholder="e.g., Computer Science"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-white font-medium">
                            Institution <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) =>
                              updateEducation(index, 'institution', e.target.value)
                            }
                            placeholder="e.g., Stanford University"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium">Location</Label>
                          <Input
                            value={edu.location || ''}
                            onChange={(e) =>
                              updateEducation(index, 'location', e.target.value)
                            }
                            placeholder="e.g., Stanford, CA"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium">GPA</Label>
                          <Input
                            value={edu.gpa || ''}
                            onChange={(e) =>
                              updateEducation(index, 'gpa', e.target.value)
                            }
                            placeholder="e.g., 3.8/4.0"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Start Date
                          </Label>
                          <Input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) =>
                              updateEducation(index, 'startDate', e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            End Date (or Expected)
                          </Label>
                          <Input
                            type="month"
                            value={edu.endDate || ''}
                            onChange={(e) =>
                              updateEducation(index, 'endDate', e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="mt-6">
            <Card className="p-6 sm:p-8 space-y-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Technical Skills</h2>
                  <p className="text-slate-400 text-sm">
                    Add your technical skills and competencies
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Add New Skill</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a skill and press Enter (e.g., React, Python, AWS)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          addSkill(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-slate-400 text-xs">
                    Press Enter to add each skill
                  </p>
                </div>

                {(profile.skills || []).length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No skills added yet</p>
                    <p className="text-sm">Start typing and press Enter to add your skills</p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-white font-medium mb-3 block">
                      Your Skills ({(profile.skills || []).length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills || []).map((skill, index) => (
                        <Badge
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
                        >
                          {skill.name}
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-2 text-red-400 hover:text-red-300 font-bold"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="mt-6">
            <Card className="p-6 sm:p-8 space-y-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Award className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Certifications</h2>
                    <p className="text-slate-400 text-sm">
                      Add your professional certifications
                    </p>
                  </div>
                </div>
                <Button
                  onClick={addCertification}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              </div>

              {(profile.certifications || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No certifications added yet</p>
                  <p className="text-sm">
                    Click "Add Certification" to showcase your credentials
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(profile.certifications || []).map((cert, index) => (
                    <Card
                      key={index}
                      className="p-6 space-y-4 bg-slate-900/50 border-slate-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded">
                            <Award className="w-5 h-5 text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-lg text-white">
                            Certification #{index + 1}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white font-medium">
                            Certification Name <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            value={cert.name}
                            onChange={(e) =>
                              updateCertification(index, 'name', e.target.value)
                            }
                            placeholder="e.g., AWS Solutions Architect"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium">
                            Issuing Organization <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            value={cert.issuer}
                            onChange={(e) =>
                              updateCertification(index, 'issuer', e.target.value)
                            }
                            placeholder="e.g., Amazon Web Services"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Issue Date <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            type="month"
                            value={cert.issueDate}
                            onChange={(e) =>
                              updateCertification(index, 'issueDate', e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white font-medium">
                            Credential ID
                          </Label>
                          <Input
                            value={cert.credentialId || ''}
                            onChange={(e) =>
                              updateCertification(index, 'credentialId', e.target.value)
                            }
                            placeholder="e.g., ABC123XYZ789"
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-white font-medium flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-blue-400" />
                            Credential URL
                          </Label>
                          <Input
                            value={cert.credentialUrl || ''}
                            onChange={(e) =>
                              updateCertification(index, 'credentialUrl', e.target.value)
                            }
                            placeholder="https://www.credly.com/badges/..."
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="mt-6">
            <Card className="p-6 sm:p-8 space-y-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              {/* Languages Section */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Languages</h2>
                      <p className="text-slate-400 text-sm">
                        Add languages you can speak
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={addLanguage}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Language
                  </Button>
                </div>

                {(profile.languages || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No languages added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {(profile.languages || []).map((lang, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-start p-4 bg-slate-900/50 border border-slate-600 rounded-lg"
                      >
                        <Globe className="w-5 h-5 text-blue-400 mt-1" />
                        <Input
                          value={lang.name}
                          onChange={(e) =>
                            updateLanguage(index, 'name', e.target.value)
                          }
                          placeholder="e.g., English"
                          className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                        <select
                          value={lang.proficiency}
                          onChange={(e) =>
                            updateLanguage(index, 'proficiency', e.target.value)
                          }
                          className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500/20"
                        >
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Professional">Professional</option>
                          <option value="Limited">Limited</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLanguage(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interests Section */}
              <div>
                <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Heart className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Interests & Hobbies</h2>
                    <p className="text-slate-400 text-sm">
                      Share your personal interests and hobbies
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Add New Interest</Label>
                    <Input
                      placeholder="Type an interest and press Enter (e.g., Photography, Hiking)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          addInterest(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                    <p className="text-slate-400 text-xs">
                      Press Enter to add each interest
                    </p>
                  </div>

                  {(profile.interests || []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No interests added yet</p>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-white font-medium mb-3 block">
                        Your Interests ({(profile.interests || []).length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(profile.interests || []).map((interest, index) => (
                          <Badge
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                          >
                            {interest}
                            <button
                              onClick={() => removeInterest(index)}
                              className="ml-2 text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
