'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSidebar } from '@/lib/sidebar-context';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';
  const isHidden = sidebarState === 'hidden';

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar />
      <main className={`transition-all duration-300 ${
        isHidden ? 'ml-0' : 
        isCollapsed ? 'ml-[72px]' : 'ml-64'
      } mt-12 max-w-[100vw] overflow-x-hidden`}>
        {children}
      </main>
    </div>
  );
} 