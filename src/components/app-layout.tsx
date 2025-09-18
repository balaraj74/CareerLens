'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Nav } from '@/components/nav';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

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

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-semibold font-headline">CareerLens</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Nav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-10 w-10 border-2 border-primary/50">
              <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} />
              <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm truncate">{user.displayName || user.email}</span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoggingOut} className="ml-auto">
              <LogOut className="w-4 h-4"/>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
