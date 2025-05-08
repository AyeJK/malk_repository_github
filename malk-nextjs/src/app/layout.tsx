import { Inter } from 'next/font/google';
import { Lobster } from 'next/font/google';
import './globals.css';
import SessionProviderWrapper from './SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lobster = Lobster({ weight: '400', subsets: ['latin'], variable: '--font-lobster' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lobster.variable} font-sans bg-dark text-white min-h-screen`}>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
} 