import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: { default: 'CIP — AI Hiring Intelligence', template: '%s | CIP Intelligence' },
  description: 'AI-powered candidate intelligence engine. Analyze. Verify. Decide. Real-time interview coaching, OCR certificate validation, and smart job matching.',
  keywords: ['AI interview', 'AI hiring', 'career intelligence', 'certificate validator', 'job matching', 'interview coach', 'recruitment AI'],
  authors: [{ name: 'CIP Intelligence Team' }],
  openGraph: {
    title: 'CIP — AI Hiring Intelligence',
    description: 'Recruitment Verdict. Unified AI Decision Engine.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const store = localStorage.getItem('cip-store');
                if (store) {
                  const { state } = JSON.parse(store);
                  const theme = state?.theme || 'dark';
                  document.documentElement.classList.add(theme);
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className={`${jakarta.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
