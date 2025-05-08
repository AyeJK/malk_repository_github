'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ShareVideoModal from './ShareVideoModal';
import { Bars3Icon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';
import DefaultAvatar from './DefaultAvatar';
import { Lobster } from 'next/font/google';

const lobster = Lobster({ weight: '400', subsets: ['latin'] });

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
      <nav className="fixed top-0 left-0 right-0 bg-black text-white p-2 z-50 shadow-md">
        <div className="flex justify-between items-center px-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleVisibility}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="w-6 h-6 text-white/70 hover:text-white" />
            </button>
            <Link href="/">
              <span className={`${lobster.className} text-4xl md:text-5xl text-white`}>Malk</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <button 
                  onClick={openShareModal}
                  className="px-6 py-1.5 rounded-lg bg-white text-black hover:bg-gray-100 transition-all duration-300 h-9 flex items-center gap-2 font-bold text-lg shadow-lg"
                >
                  <PlusIcon className="w-6 h-6 text-black" />
                  <span>Share Video</span>
                </button>
                <button
                  className="ml-1 p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-6 h-6 text-white/80" />
                </button>
                <div className="relative ml-1" ref={dropdownRef}>
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
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-lighter ring-1 ring-black ring-opacity-5">
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
              </>
            ) : (
              <>
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg font-semibold bg-[#ff8178] text-white hover:bg-[#e76a5e] transition-colors"
                >
                  Sign Up
                </Link>
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-lg font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  Log In
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