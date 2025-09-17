'use client';

import { useState } from 'react';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getResumeJson } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { defaultProfileData } from '@/lib/data';
import { ResumePreview } from './resume-preview';
import type { GenerateResumeFromJsonOutput } from '@/ai/flows/generate-resume-from-json';
import type { UserProfile } from '@/lib/types';


export function ResumePage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [resumeData, setResumeData] = useState<any | null>(null);

    async function handleGenerateResume() {
        setIsLoading(true);
        setResumeData(null);
        
        // This is a placeholder for fetching the real user profile.
        // In a real app, you would fetch this from your state management or an API.
        const userProfile: UserProfile = {
            name: "Alex Doe",
            email: "alex.doe@example.com",
            preferences: { location: "San Francisco, CA", remote: true },
            education: [{ degree: "B.Sc. Computer Science", field: "Computer Science", year: "2020" }],
            experience: [{ role: "Software Engineer", years: "3", skills: ["React", "Node.js"] }],
            skills: [{ name: "TypeScript", level: "Expert" }],
            interests: ["AI", "Design"],
        };

        const inputForAI = {
            name: userProfile.name,
            email: userProfile.email,
            phone: "(123) 456-7890", // phone is not in the new schema, adding placeholder
            linkedin: "linkedin.com/in/alexdoe", // not in schema
            github: "github.com/alexdoe", // not in schema
            summary: "A passionate software engineer with 3 years of experience.", // not in schema
            experience: userProfile.experience.map(exp => ({
                title: exp.role,
                company: 'A Great Company', // not in schema
                startDate: '2021', // not in schema
                endDate: 'Present',
                description: `Worked as a ${exp.role} for ${exp.years} years, using skills like ${exp.skills.join(', ')}.`,
            })),
            education: userProfile.education.map(edu => ({
                institution: 'A Great University', // not in schema
                degree: `${edu.degree} in ${edu.field}`,
                startDate: '2016',
                endDate: edu.year,
                description: '',
            })),
            skills: userProfile.skills.map(skill => `${skill.name} (${skill.level})`),
        };

        const response = await getResumeJson(inputForAI);
        setIsLoading(false);

        if (response.success && response.data?.resumeJson) {
            try {
                const parsedData = JSON.parse(response.data.resumeJson);
                setResumeData(parsedData);
                 toast({
                    title: "Success!",
                    description: "Your resume has been generated.",
                });
            } catch(e) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to parse the generated resume data.",
                });
            }
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
                <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="w-8 h-8 text-primary"/> AI Resume Builder</h1>
                <p className="text-muted-foreground">Generate a professional resume from your profile data.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Generate Your Resume</CardTitle>
                    <CardDescription>Click the button below to use the data from your profile to generate a new resume. Any unsaved changes on your profile page will not be included.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handleGenerateResume} disabled={isLoading}>
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                        ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Resume with AI
                        </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {resumeData && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>
                    <ResumePreview data={resumeData} />
                </div>
            )}
        </div>
    );
}
