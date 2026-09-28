import './globals.css';

import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import { cn } from '@/lib/utils/cn';
import { AppProviders } from '@/providers/AppProviders';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LeadPilot AI - AI-Powered Lead Management',
    template: `%s | LeadPilot AI`,
  },
  description: 'AI-powered lead intelligence for sales teams. Auto-summarize leads, score prioritization, and generate personalized follow-ups.',
  keywords: ['CRM', 'lead management', 'AI', 'sales', 'supabase', 'nextjs'],
  authors: [{ name: 'LeadPilot AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'LeadPilot AI',
    description: 'AI-powered lead intelligence for sales teams.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          firaCode.variable,
          'font-sans antialiased',
          'min-h-screen bg-background text-foreground'
        )}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
