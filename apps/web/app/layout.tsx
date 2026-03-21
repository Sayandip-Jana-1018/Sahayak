import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans, Open_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { LenisProvider } from '@/providers/lenis-provider';
import { SoundProvider } from '@/providers/sound-provider';
import { ToastProvider } from '@sahayak/ui';
import { Grainient } from '@/components/ui/Grainient';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { BackgroundOrbs } from '@/components/ui/BackgroundOrbs';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Sahayak — India\'s Voice-First AI for Elderly Smartphones',
  description:
    'Sahayak (सहायक) is India\'s first voice-driven AI assistant designed for elderly users. Voice commands, medication reminders, SOS alerts, and AI companionship — all in 11 Indian languages.',
  keywords: [
    'sahayak',
    'elderly care',
    'voice AI',
    'India',
    'senior citizens',
    'medication reminders',
    'SOS alerts',
    'AI companion',
  ],
  authors: [{ name: 'Sahayak Team' }],
  openGraph: {
    title: 'Sahayak — Voice-First AI for Elderly Care',
    description: 'India\'s first voice-driven AI assistant for senior citizens.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Sahayak',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sahayak — Voice-First AI for Elderly Care',
    description: 'India\'s first voice-driven AI assistant for senior citizens.',
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a14' },
    { media: '(prefers-color-scheme: light)', color: '#fefcf9' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${dmSans.variable} ${syne.variable}`}
        style={{
          fontFamily: 'var(--font-body)',
          minHeight: '100vh',
          overflowX: 'hidden',
          position: 'relative',
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="sahayak-theme"
        >
          <SoundProvider>
            <LenisProvider>
              <ToastProvider>
                <Grainient />
                <BackgroundOrbs />
                <CustomCursor />
                <Navbar />
                <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>
                  {children}
                </main>
              </ToastProvider>
            </LenisProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
