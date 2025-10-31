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
    if (!authLoading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [authLoading, user, router, isAuthPage, pathname]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthPage) {
    return <div className="flex min-h-screen items-center justify-center">{children}</div>;
  }
  
  if (!user) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
