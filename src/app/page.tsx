import Link from 'next/link';
import {
  Briefcase,
  Target,
  BookOpen,
  FileText,
  MessageSquare,
  User,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'AI Career Recommendations',
    description:
      'Get personalized career suggestions based on your unique profile and preferences.',
    link: '/recommendations',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Skill Gap Analysis',
    description:
      'Identify the skills you need to land your dream job and where you stand today.',
    link: '/skill-gap',
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Personalized Roadmap',
    description: 'A custom 3-month learning plan to bridge your skill gaps.',
    link: '/roadmap',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Resume Builder',
    description: 'Generate a professional, ATS-friendly resume in minutes.',
    link: '/resume',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: 'Interview Prep',
    description:
      'Practice with AI-generated questions and model answers for any role.',
    link: '/interview-prep',
  },
  {
    icon: <User className="h-8 w-8 text-primary" />,
    title: 'Manage Profile',
    description:
      'Keep your professional details up-to-date to get the best recommendations.',
    link: '/profile',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-glow">
            Welcome to CareerLens
          </h1>
          <p className="text-lg text-muted-foreground">
            Your personal AI-powered career co-pilot.
          </p>
        </div>
        <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-shadow">
          <Link href="/profile">
            Complete Your Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.link} key={feature.title} className="group">
            <div className="glass-card flex flex-col h-full rounded-2xl transition-all duration-300 ease-in-out hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="p-6 flex-row items-start gap-4 space-y-0">
                <div className="flex items-center justify-center bg-primary/10 rounded-xl p-4 w-16 h-16 mb-4 animate-pulse-slow">
                  {feature.icon}
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-semibold font-headline">{feature.title}</h3>
                </div>
              </div>
              <div className="p-6 pt-0 flex-grow">
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
