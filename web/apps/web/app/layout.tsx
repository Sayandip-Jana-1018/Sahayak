import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { LenisProvider } from '@/providers/lenis-provider';
import { SoundProvider } from '@/providers/sound-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@sahayak/ui';
import { Grainient } from '@/components/ui/Grainient';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { BackgroundOrbs } from '@/components/ui/BackgroundOrbs';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: "Sahayak — India's Voice-First AI for Elderly Smartphones",
  description:
    "Sahayak (सहायक) is India's first voice-driven AI assistant designed for elderly users. Voice commands, medication reminders, SOS alerts, and AI companionship — all in 11 Indian languages.",
  keywords: [
    "sahayak",
    "elderly care",
    "voice AI",
    "India",
    "senior citizens",
    "medication reminders",
    "SOS alerts",
    "AI companion",
  ],
  authors: [{ name: "Sahayak Team" }],
  openGraph: {
    title: "Sahayak — Voice-First AI for Elderly Care",
    description: "India's first voice-driven AI assistant for senior citizens.",
    type: "website",
    locale: "en_IN",
    siteName: "Sahayak",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahayak — Voice-First AI for Elderly Care",
    description: "India's first voice-driven AI assistant for senior citizens.",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
    { media: "(prefers-color-scheme: light)", color: "#fefcf9" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          style={{
            fontFamily: "var(--font-playfair), serif",
            minHeight: "100vh",
            overflowX: "hidden",
            position: "relative",
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="sahayak-theme"
          >
            <QueryProvider>
              <SoundProvider>
                <LenisProvider>
                  <ToastProvider>
                    <Grainient />
                    <BackgroundOrbs />
                    <CustomCursor />
                    <Navbar />
                    <main
                      style={{ position: "relative", zIndex: 1 }}
                    >
                      {children}
                    </main>
                  </ToastProvider>
                </LenisProvider>
              </SoundProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
