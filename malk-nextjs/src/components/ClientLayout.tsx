'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/lib/sidebar-context';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar />
      <main className={`transition-all duration-300 mt-16 ${
        isMobile
          ? 'ml-0' // No margin on mobile as sidebar overlays
          : isCollapsed
            ? 'ml-16'  // Collapsed sidebar width
            : 'ml-64'  // Full sidebar width
      }`}>
        {children}
      </main>
    </div>
  );
} 