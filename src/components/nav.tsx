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
];

interface NavProps {
    handleLogout: () => void;
    isLoggingOut: boolean;
    user: User | null;
}

export function Nav({ handleLogout, isLoggingOut, user }: NavProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile === undefined) return null; // Avoid rendering mismatch

  if (isMobile) {
    // 📱 Mobile Floating Dock
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-around w-[95%] max-w-lg p-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg"
      >
        {navItems.map((item) => (
          <Link href={item.href} key={item.label}>
            <button className={cn(
              "flex flex-col items-center justify-center h-14 w-14 rounded-lg text-white transition-colors",
              pathname === item.href ? "bg-primary/20 text-primary" : "hover:text-primary hover:bg-white/5"
            )}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          </Link>
        ))}
      </motion.div>
    );
  }

  // 💻 Desktop Left Sidebar
  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed left-0 top-0 h-full w-56 bg-card backdrop-blur-xl border-r border-white/10 shadow-xl flex flex-col p-4"
    >
      <div className="flex flex-col items-center text-center py-4 mb-4">
        <Avatar className="h-16 w-16 mb-3 border-4 border-primary/50">
          <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/64/64`} />
          <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg text-white font-bold truncate w-full">{user?.displayName || user?.email}</h2>
        <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
      </div>

      <div className="flex flex-col gap-2 flex-grow">
        {navItems.map((item) => (
          <Link href={item.href} key={item.label}>
            <button
              className={cn(
                "flex items-center gap-3 text-white rounded-lg p-3 text-sm transition-colors w-full text-left relative",
                pathname === item.href ? "bg-primary/20 text-primary font-semibold" : "hover:bg-white/10"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
               {pathname === item.href && (
                   <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-l-full shadow-lg shadow-primary/50"></span>
                )}
            </button>
          </Link>
        ))}
      </div>
      
      <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut} className="w-full justify-start p-3 text-base text-muted-foreground hover:bg-destructive/20 hover:text-white mt-4">
        <LogOut className="mr-3"/>
        <span>Log Out</span>
      </Button>
    </motion.div>
  );
}
