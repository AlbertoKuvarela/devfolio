import type { Metadata } from 'next';
import { Bricolage_Grotesque, DM_Sans, Fira_Code } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-display',
});

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
});

const mono = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'DevFolio — Find Freelance Clients. On Autopilot.',
  description:
    'DevFolio builds your portfolio in 2 minutes, then works 24/7 to find you freelance clients. AI-generated copy, automated outreach, and always up to date.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
