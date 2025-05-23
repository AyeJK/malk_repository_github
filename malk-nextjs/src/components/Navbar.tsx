'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ShareVideoModal from './ShareVideoModal';
import { Bars3Icon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';
import DefaultAvatar from './DefaultAvatar';
import { Lobster } from 'next/font/google';
import NotificationsDropdown from './NotificationsDropdown';

const lobster = Lobster({ weight: '400', subsets: ['latin'] });

export default function Navbar() {
  const { user, airtableUser, signOut } = useAuth();
  const { toggleVisibility } = useSidebar();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;
    fetch(`/api/notifications?firebaseUID=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        const unread = (data.notifications || []).filter((n: any) => !n.fields['Is Read']);
        setHasUnreadNotifications(unread.length > 0);
        setUnreadCount(unread.length);
      });
  }, [user, isNotificationsOpen]);

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

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-[#101010] text-white p-2 z-50">
        <div className="flex justify-between items-center px-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleVisibility}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="w-6 h-6 text-white/70 hover:text-white" />
            </button>
            <Link href={user ? "/discover" : "/"}>
              <span className={`${lobster.className} text-4xl md:text-5xl text-white`}>Malk</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <button 
                  onClick={openShareModal}
                  className="px-6 py-1.5 rounded-lg bg-[#111] text-white h-9 flex items-center gap-2 font-bold text-lg shadow-lg animated-gradient-border relative overflow-hidden"
                >
                  <PlusIcon className="w-6 h-6 text-white" />
                  <span>Share Video</span>
                </button>
                <div className="relative">
                  <button
                    className={`ml-1 w-9 h-9 p-0 rounded-full transition-colors relative flex items-center justify-center`}
                    aria-label="Notifications"
                    onClick={() => setIsNotificationsOpen((v) => !v)}
                  >
                    <BellIcon className={`w-7 h-7 transition-colors ${hasUnreadNotifications ? 'text-[#ff8178]' : 'text-white/80'}`} />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#101010] shadow"
                        style={{ fontSize: '0.75rem', lineHeight: '1' }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <div ref={notificationsRef}>
                    <NotificationsDropdown open={isNotificationsOpen} />
                  </div>
                </div>
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