
'use client';
import { usePathname } from 'next/navigation';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {isAuthPage ? (
          <div className="flex min-h-screen items-center justify-center bg-background">{children}</div>
        ) : (
          <AppLayout>{children}</AppLayout>
        )}
        <Toaster />
      </body>
    </html>
  );
}
