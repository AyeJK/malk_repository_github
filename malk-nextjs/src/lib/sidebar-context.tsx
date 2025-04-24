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
    const width = window.innerWidth;
    
    if (width < 792) {
      // Mobile behavior: toggle visibility
      setIsVisible(!isVisible);
    } else if (width >= 1312) {
      // Large screens: toggle between expanded and collapsed
      setSidebarState(current => current === 'expanded' ? 'collapsed' : 'expanded');
    } else {
      // Medium screens: toggle between collapsed and hidden
      if (sidebarState === 'collapsed') {
        setSidebarState('hidden');
        setIsVisible(false);
      } else {
        setSidebarState('collapsed');
        setIsVisible(true);
      }
    }
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