'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ShareVideoModal from './ShareVideoModal';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';
import DefaultAvatar from './DefaultAvatar';

export default function Navbar() {
  const { user, airtableUser, signOut } = useAuth();
  const { toggleVisibility } = useSidebar();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

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
      <nav className="fixed top-0 left-0 right-0 bg-black text-white p-2 z-50 border-b border-white/10">
        <div className="flex justify-between items-center px-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleVisibility}
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
            {user ? (
              <>
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={openShareModal}
                    className="px-6 py-1.5 rounded-lg text-sm font-medium bg-red-800 text-red-100 hover:bg-red-700 transition-all duration-300 h-9 flex items-center"
                  >
                    Share Video
                  </button>
                  <div className="relative flex items-center" ref={dropdownRef}>
                    <button 
                      className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 transition-opacity flex items-center justify-center"
                      onClick={toggleDropdown}
                    >
                      {airtableUser?.fields?.ProfileImage ? (
                        <img 
                          src={airtableUser.fields.ProfileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultAvatar userId={user?.uid} userName={airtableUser?.fields?.DisplayName} />
                      )}
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-lighter ring-1 ring-black ring-opacity-5">
                        <Link
                          href={`/profile/${airtableUser?.id}`}
                          className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
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