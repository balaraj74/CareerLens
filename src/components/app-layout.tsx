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
    // This effect runs only on the client after hydration.
    // It waits until the auth state is fully resolved before redirecting.
    if (!authLoading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [authLoading, user, router, isAuthPage, pathname]);

  // While checking authentication, show a full-screen loader.
  // This prevents any content from rendering prematurely and causing a hydration mismatch.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we are on an auth page (login/signup), render it without the main layout.
  // The user might be null here, which is expected.
  if (isAuthPage) {
      return (
          <div className="flex min-h-screen items-center justify-center">{children}</div>
      )
  }
  
  // If we are still waiting for the redirect to happen after loading is complete,
  // continue showing the loader to prevent flashing the main layout.
  if (!user && !isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // At this point, we have a logged-in user, so render the full app layout.
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
