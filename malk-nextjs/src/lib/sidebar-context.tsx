'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SidebarState = 'expanded' | 'collapsed' | 'hidden';

interface SidebarContextType {
  isVisible: boolean;
  sidebarState: SidebarState;
  toggleVisibility: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isVisible: true,
  sidebarState: 'expanded',
  toggleVisibility: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1312) {
        setSidebarState('expanded');
        setIsVisible(true);
      } else if (width >= 792) {
        setSidebarState('collapsed');
        setIsVisible(true);
      } else {
        setSidebarState('hidden');
        setIsVisible(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <SidebarContext.Provider value={{ isVisible, sidebarState, toggleVisibility }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
} 