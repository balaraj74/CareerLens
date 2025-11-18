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
  LogOut,
  Sparkles,
  Bot,
  Hammer,
  ChevronUp,
  LibrarySquare,
  Activity,
  Calendar,
  Users,
  GraduationCap,
  TrendingUp,
  Newspaper,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import type { User } from 'firebase/auth';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from './icons';

const allNavItems = [
  { href: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/profile', icon: <UserIcon />, label: 'Profile' },
  { href: '/career-graph', icon: <Activity />, label: 'Career Graph' },
  { href: '/calendar', icon: <Calendar />, label: 'AI Calendar' },
  { href: '/career-updates', icon: <TrendingUp />, label: 'Career Updates' },
  { href: '/recommendations', icon: <Briefcase />, label: 'Careers' },
  { href: '/skill-gap', icon: <Target />, label: 'Skill Gap' },
  { href: '/roadmap', icon: <BookOpen />, label: 'Roadmap' },
  { href: '/resume', icon: <FileText />, label: 'Resume' },
  { href: '/interview-prep', icon: <MessageSquare />, label: 'Interview' },
  { href: '/learning-helper', icon: <Sparkles />, label: 'AI Helper' },
  { href: '/ai-interviewer', icon: <Bot />, label: 'AI Interviewer' },
  { href: '/library-finder', icon: <LibrarySquare />, label: 'Libraries' },
  { href: '/ebooks', icon: <BookOpen />, label: 'eBooks' },
  { href: '/news', icon: <Newspaper />, label: 'News' },
  { href: '/community', icon: <Users />, label: 'Community' },
  { href: '/resources', icon: <GraduationCap />, label: 'Resources' },
  { href: '/mentors', icon: <MessageSquare />, label: 'Find Mentor' },
];

interface NavProps {
  handleLogout: () => void;
  isLoggingOut: boolean;
  user: User | null;
}

export function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const { logOut } = useAuth();

  return (
    <>
      {/* Top Bar for larger screens */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed left-0 top-0 h-20 w-full bg-card/80 backdrop-blur-xl 
                   border-b border-white/10 shadow-xl flex items-center p-4 z-50
                   lg:pl-72" // Adjust padding for the fixed sidebar
      >
        <div className="flex-1">
          {/* Content for the top bar can go here, e.g., search bar or notifications */}
        </div>
        <div className="flex items-center gap-4">
          <div className='text-right'>
            <h2 className="text-sm text-white font-bold truncate">
              {user?.displayName || user?.email}
            </h2>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email}
            </span>
          </div>
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage
              src={
                user?.photoURL ||
                `https://picsum.photos/seed/${user?.uid}/64/64`
              }
            />
            <AvatarFallback>
              {user?.email?.[0].toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            onClick={logOut}
            className="text-muted-foreground hover:bg-destructive/20 hover:text-white"
          >
            <LogOut className="mr-2" />
            <span>Log Out</span>
          </Button>
        </div>
      </motion.div>

      {/* Fixed Sidebar for larger screens */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed left-0 top-0 h-screen w-64 bg-card/80 backdrop-blur-xl 
                   border-r border-white/10 shadow-xl hidden lg:flex flex-col z-50"
      >
        <div className="flex items-center justify-center h-20 border-b border-white/10">
          <Logo />
          <h1 className="text-xl font-bold ml-2 text-glow">CareerLens</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {allNavItems.map((item) => (
            <Link href={item.href} key={item.label}>
              <button
                className={cn(
                  'w-full flex items-center gap-3 text-white rounded-lg px-3 py-3 text-sm transition-colors relative',
                  pathname === item.href
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-white/10'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {pathname === item.href && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-l-full shadow-lg shadow-primary/50"></span>
                )}
              </button>
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  );
}
