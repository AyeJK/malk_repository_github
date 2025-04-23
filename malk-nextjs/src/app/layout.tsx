import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Lobster } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { SidebarProvider } from '@/lib/sidebar-context';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const lobster = Lobster({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-lobster',
});

export const metadata: Metadata = {
  title: 'Malk.tv - Share Your Videos',
  description: 'A platform for sharing and discovering videos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lobster.variable} font-sans bg-dark text-white min-h-screen`}>
        <Providers>
          <SidebarProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
} 