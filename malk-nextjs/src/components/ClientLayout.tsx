'use client';

import { ReactNode } from 'react';
import { useSidebar } from '@/lib/sidebar-context';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar />
      <div className="pt-16">
        <main className={`transition-all duration-300 ${
          isCollapsed ? 'pl-16' : 'pl-64'
        } container mx-auto px-4 py-8`}>
          {children}
        </main>
      </div>
    </div>
  );
} 