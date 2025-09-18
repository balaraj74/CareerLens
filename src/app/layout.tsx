'use client';
import { usePathname } from 'next/navigation';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';

// export const metadata: Metadata = {
//   title: 'CareerLens',
//   description: 'Your personal AI-powered career advisor.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <title>CareerLens</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background" suppressHydrationWarning>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-background to-slate-900/50 -z-10" />
        <AuthProvider>
            {isAuthPage ? (
            <div className="flex min-h-screen items-center justify-center">{children}</div>
            ) : (
            <AppLayout>{children}</AppLayout>
            )}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
