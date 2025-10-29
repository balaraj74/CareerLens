'use client';
import { Nav } from '@/components/nav';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!authLoading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [authLoading, user, router, isAuthPage]);

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

  if (isAuthPage) {
      return (
          <div className="flex min-h-screen items-center justify-center">{children}</div>
      )
  }

  // Show a loading screen while auth is being loaded for protected pages.
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={isMobile ? 'pt-4' : 'pt-20'}>
      <Nav handleLogout={handleLogout} isLoggingOut={isLoggingOut} user={user} />
      <main className={`flex-1 overflow-auto ${isMobile ? 'pb-28' : ''}`}>
        {children}
      </main>
    </div>
  );
}
