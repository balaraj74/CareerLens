'use client';
import { Nav } from '@/components/nav';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      })
    } finally {
      setIsLoggingOut(false);
    }
  }

  // Show a loading screen while auth or profile data is being loaded.
  if (authLoading || profileLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={!isMobile ? 'pl-56' : ''}>
      <Nav handleLogout={handleLogout} isLoggingOut={isLoggingOut} user={user} />
      <main className={`flex-1 overflow-auto ${isMobile ? 'pb-28' : ''}`}>
        {children}
      </main>
    </div>
  );
}
