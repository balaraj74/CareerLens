'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User as UserIcon,
  Briefcase,
  Target,
  BookOpen,
  FileText,
  MessageSquare,
  Sparkles,
  Bot,
  ChevronUp,
  LibrarySquare,
  Calendar,
  Users,
  GraduationCap,
  UserPlus,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { User } from 'firebase/auth';
import React, { useState } from 'react';
import useMeasure from 'react-use-measure';

const mainNavItems = [
  { href: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/profile', icon: <UserIcon />, label: 'Profile' },
  { href: '/career-updates', icon: <TrendingUp />, label: 'Updates' },
  { href: '/recommendations', icon: <Briefcase />, label: 'Careers' },
];

const toolNavItems = [
  { href: '/skill-gap', icon: <Target />, label: 'Skill Gap' },
  { href: '/roadmap', icon: <BookOpen />, label: 'Roadmap' },
  { href: '/resume', icon: <FileText />, label: 'Resume' },
  { href: '/interview-prep', icon: <MessageSquare />, label: 'Interview' },
  { href: '/learning-helper', icon: <Sparkles />, label: 'AI Helper' },
  { href: '/ai-interviewer', icon: <Bot />, label: 'AI Interviewer' },
  { href: '/library-finder', icon: <LibrarySquare />, label: 'Libraries' },
  { href: '/calendar', icon: <Calendar />, label: 'AI Calendar' },
  { href: '/community', icon: <Users />, label: 'Community' },
  { href: '/resources', icon: <GraduationCap />, label: 'Resources' },
  { href: '/mentors', icon: <UserPlus />, label: 'Find Mentor' },
  { href: '/ebooks', icon: <BookOpen />, label: 'eBooks' },
];

interface NavProps {
  handleLogout: () => void;
  isLoggingOut: boolean;
  user: User | null;
}

export function NavMobile({ handleLogout, isLoggingOut, user }: NavProps) {
  const pathname = usePathname();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  let [ref, bounds] = useMeasure();

    return (
      <>
        <motion.div
          animate={{ height: isToolsOpen ? bounds.height : 0 }}
          className="fixed bottom-24 left-4 right-4 z-40 overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border"
        >
          <div ref={ref} className="p-4 space-y-2">
             <h3 className="font-semibold text-center text-sm text-muted-foreground mb-2">Career Tools</h3>
             <div className="grid grid-cols-4 gap-2">
                {toolNavItems.map((item) => (
                    <Link href={item.href} key={item.label} onClick={() => setIsToolsOpen(false)}>
                        <div className={cn(
                             "flex flex-col items-center justify-center h-full w-full rounded-lg p-2 gap-1 text-sm transition-colors",
                             pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-primary/10"
                        )}>
                            {item.icon}
                            <span className="text-xs text-center">{item.label}</span>
                        </div>
                    </Link>
                ))}
             </div>
          </div>
        </motion.div>

        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed bottom-4 left-4 right-4 z-50 h-20 bg-card/80 backdrop-blur-xl border-2 border-border shadow-2xl rounded-2xl"
        >
            <div className="flex h-full w-full justify-evenly items-center">
            {mainNavItems.map((item) => (
                <Link href={item.href} key={item.label} className="flex-1">
                <button
                    className={cn(
                    "flex flex-col items-center justify-center h-full w-full rounded-lg transition-colors gap-1",
                    pathname === item.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    )}
                >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                </button>
                </Link>
            ))}
             <div className="flex-1">
                 <button
                    onClick={() => setIsToolsOpen(!isToolsOpen)}
                    className={cn(
                        "flex flex-col items-center justify-center h-full w-full rounded-lg transition-colors gap-1",
                        isToolsOpen || toolNavItems.some(i => i.href === pathname)
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    )}
                >
                    <motion.div animate={{ rotate: isToolsOpen ? 180 : 0 }}><ChevronUp /></motion.div>
                    <span className="text-xs">Tools</span>
                </button>
            </div>
            </div>
        </motion.div>
      </>
    );
}
