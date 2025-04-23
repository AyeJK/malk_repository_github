'use client';

import { useSidebar } from '@/lib/sidebar-context';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className={`transition-all duration-300 ${
        isCollapsed ? 'pl-16' : 'pl-64'
      } container mx-auto px-4 py-8`}>
        {children}
      </main>
    </>
  );
} 