'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ShareVideoModal from './ShareVideoModal';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';

export default function Navbar() {
  const { user, airtableUser, signOut } = useAuth();
  const { toggleCollapse } = useSidebar();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black text-white p-4 z-50 border-b border-white/10">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleCollapse}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="w-6 h-6 text-white/70 hover:text-white" />
            </button>
            <Link href="/" className="text-3xl font-lobster text-white">
              Malk.tv <span className="text-blue-300 text-sm bg-blue-900/30 px-2 py-0.5 rounded-full">Beta</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/posts" 
              className="text-white hover:text-blue-300 transition-colors"
            >
              Browse Videos
            </Link>
            
            {user ? (
              <>
                <button 
                  onClick={openShareModal}
                  className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Share Video
                </button>
                <div className="relative" ref={dropdownRef}>
                  <div 
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={toggleDropdown}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {((airtableUser?.displayName || user?.email || 'U').charAt(0)).toUpperCase()}
                    </div>
                    <span className="text-white">
                      {airtableUser?.displayName || user.email}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-white/70" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-md shadow-lg py-1 z-50">
                      <Link 
                        href={`/profile/${airtableUser?.id || user.uid}`}
                        className="block px-4 py-2 text-sm text-white hover:bg-blue-900/30"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-900/30"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/signup" 
                  className="text-white hover:text-blue-300 transition-colors"
                >
                  Sign Up
                </Link>
                <Link 
                  href="/login" 
                  className="text-white hover:text-blue-300 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/login" 
                  className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Share Video
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <ShareVideoModal 
        isOpen={isShareModalOpen} 
        onClose={closeShareModal} 
      />
    </>
  );
} 