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
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import type { User } from 'firebase/auth';
import React, { useState } from 'react';
import useMeasure from 'react-use-measure';

const mainNavItems = [
  { href: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/profile', icon: <UserIcon />, label: 'Profile' },
  { href: '/recommendations', icon: <Briefcase />, label: 'Careers' },
];

const toolNavItems = [
  { href: '/skill-gap', icon: <Target />, label: 'Skill Gap' },
  { href: '/roadmap', icon: <BookOpen />, label: 'Roadmap' },
  { href: '/resume', icon: <FileText />, label: 'Resume' },
  { href: '/interview-prep', icon: <MessageSquare />, label: 'Interview' },
  { href: '/learning-helper', icon: <Sparkles />, label: 'AI Helper' },
  { href: '/ai-interviewer', icon: <Bot />, label: 'AI Interviewer' },
];

const allNavItems = [...mainNavItems, ...toolNavItems];

interface NavProps {
  handleLogout: () => void;
  isLoggingOut: boolean;
  user: User | null;
}

export function Nav({ handleLogout, isLoggingOut, user }: NavProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  let [ref, bounds] = useMeasure();

  if (isMobile === undefined) return null; // avoid hydration mismatch

  if (isMobile) {
    // 📱 Mobile Floating Dock with Tools Drawer
    return (
      <>
        <motion.div
          animate={{ height: isToolsOpen ? bounds.height : 0 }}
          className="fixed bottom-24 left-4 right-4 z-40 overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border"
        >
          <div ref={ref} className="p-4 space-y-2">
             <h3 className="font-semibold text-center text-sm text-muted-foreground mb-2">Career Tools</h3>
             <div className="grid grid-cols-3 gap-2">
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

  // 💻 Desktop Top Bar
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed left-0 top-0 h-20 w-full bg-card/80 backdrop-blur-xl 
                 border-b border-white/10 shadow-xl flex items-center justify-center p-4 z-50"
    >
      <div className="flex w-full max-w-screen-xl items-center justify-between">
        <div className="flex items-center gap-2">
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
           <div>
            <h2 className="text-sm text-white font-bold truncate">
              {user?.displayName || user?.email}
            </h2>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email}
            </span>
           </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-2">
          {allNavItems.map((item) => (
            <Link href={item.href} key={item.label}>
              <button
                className={cn(
                  'flex flex-col items-center justify-center text-white rounded-lg px-3 py-2 text-sm transition-colors relative h-14 w-20',
                  pathname === item.href
                    ? 'text-primary'
                    : 'hover:bg-white/10'
                )}
              >
                {item.icon}
                <span className="text-xs mt-1 text-center">{item.label}</span>
                 {pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-10 bg-primary rounded-t-full shadow-lg shadow-primary/50"></span>
                )}
              </button>
            </Link>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-muted-foreground hover:bg-destructive/20 hover:text-white"
        >
          <LogOut className="mr-2" />
          <span>Log Out</span>
        </Button>
      </div>
    </motion.div>
  );
}
