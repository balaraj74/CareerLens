
'use client';
import { Nav } from '@/components/nav';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { NavMobile } from './nav-mobile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    // Wait until loading is false and we have a definitive user state
    if (!authLoading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [authLoading, user, router, isAuthPage, pathname]);

  // While checking auth state, show a full-screen loader.
  // This is the key to preventing the hydration error.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we are on an auth page (login/signup), render it without the main layout.
  if (isAuthPage) {
      return (
          <div className="flex min-h-screen items-center justify-center">{children}</div>
      )
  }
  
  // If not loading, but no user, and we're not on an auth page yet (mid-redirect),
  // show a loader to prevent flashing content.
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Once loading is complete and we have a user, render the full app layout.
  return (
    <>
      <div className="hidden lg:block">
        <Nav handleLogout={() => {}} isLoggingOut={false} user={user} />
      </div>
      <div className="block lg:hidden">
        <NavMobile handleLogout={() => {}} isLoggingOut={false} user={user} />
      </div>
      <main className="lg:pl-64 lg:pt-20 pb-24 lg:pb-0">
          {children}
      </main>
    </>
  );
}
