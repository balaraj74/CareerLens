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
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import type { User } from 'firebase/auth';

const navItems = [
  { href: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/profile', icon: <UserIcon />, label: 'Profile' },
  { href: '/recommendations', icon: <Briefcase />, label: 'Careers' },
  { href: '/skill-gap', icon: <Target />, label: 'Skill Gap' },
  { href: '/roadmap', icon: <BookOpen />, label: 'Roadmap' },
  { href: '/resume', icon: <FileText />, label: 'Resume' },
  { href: '/interview-prep', icon: <MessageSquare />, label: 'Interview' },
  { href: '/learning-helper', icon: <Sparkles />, label: 'AI Helper' },
];

interface NavProps {
  handleLogout: () => void;
  isLoggingOut: boolean;
  user: User | null;
}

export function Nav({ handleLogout, isLoggingOut, user }: NavProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile === undefined) return null; // avoid hydration mismatch

  if (isMobile) {
    // 📱 Mobile Floating Dock
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-card/80 backdrop-blur-xl border-t border-border md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-full md:max-w-md md:rounded-2xl md:border md:h-auto"
      >
        <div className="flex h-full w-full justify-evenly items-center md:py-2">
          {navItems.map((item) => (
            <Link href={item.href} key={item.label} className="flex-1 md:flex-initial">
              <button
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full rounded-lg text-white transition-colors gap-1",
                  pathname === item.href
                    ? "text-primary"
                    : "hover:text-primary"
                )}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </motion.div>
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
          {navItems.map((item) => (
            <Link href={item.href} key={item.label}>
              <button
                className={cn(
                  'flex flex-col items-center justify-center text-white rounded-lg px-4 py-2 text-sm transition-colors relative h-14 w-20',
                  pathname === item.href
                    ? 'text-primary'
                    : 'hover:bg-white/10'
                )}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
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
