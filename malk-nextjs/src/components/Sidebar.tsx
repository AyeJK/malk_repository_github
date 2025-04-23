'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';
import { useAuth } from '@/lib/auth-context';

interface SidebarSection {
  title: string;
  isOpen: boolean;
}

interface FollowingUser {
  id: string;
  fields: {
    DisplayName?: string;
    ProfileImage?: string;
    FirebaseUID?: string;
  };
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { user, airtableUser } = useAuth();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [sections, setSections] = useState<{ [key: string]: boolean }>({
    Following: true,
    Categories: false,
    'Popular Tags': true,
  });

  // Fetch following list when user is logged in
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoadingFollowing(true);
        const response = await fetch(`/api/get-following?userId=${user.uid}`);
        if (!response.ok) throw new Error('Failed to fetch following');
        
        const data = await response.json();
        setFollowing(data.following || []);
      } catch (error) {
        console.error('Error fetching following:', error);
        setFollowing([]);
      } finally {
        setIsLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, [user?.uid]);

  const toggleSection = (section: string) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const mainLinks = [
    { href: '/discover', label: 'Discover', icon: '👀' },
    { href: '/activity', label: 'Activity', icon: '📈' },
    { href: '/following', label: 'Following', icon: '👥' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  const popularTags = [
    { tag: 'snl', count: 342 },
    { tag: 'horror', count: 256 },
    { tag: 'plants', count: 198 },
    { tag: 'cover', count: 187 },
    { tag: 'music video', count: 165 },
    { tag: 'funny', count: 145 },
    { tag: 'parody', count: 132 },
    { tag: 'lofi', count: 121 },
    { tag: 'humor', count: 98 },
    { tag: 'sandwich', count: 87 },
  ];

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-black border-r border-white/10 transition-all duration-300 z-20 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="h-full overflow-y-auto">
        {/* Main Navigation */}
        <nav className="p-4 space-y-2">
          {mainLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === href
                  ? 'bg-red-600/20 text-red-500'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              {!isCollapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Following Section - Only show if user is logged in and has followings */}
        {!isCollapsed && user && following.length > 0 && (
          <div className="px-4 py-2">
            <button
              onClick={() => toggleSection('Following')}
              className="flex items-center justify-between w-full text-white/70 hover:text-white"
            >
              <span className="font-medium">Following</span>
              {sections.Following ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
            {sections.Following && (
              <div className="mt-2 space-y-2">
                {isLoadingFollowing ? (
                  <div className="text-white/50 text-sm px-2">Loading...</div>
                ) : (
                  following.map((followedUser) => (
                    <Link
                      key={followedUser.id}
                      href={`/profile/${followedUser.id}`}
                      className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-white/5 group"
                    >
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-700">
                        {followedUser.fields?.ProfileImage ? (
                          <Image
                            src={followedUser.fields.ProfileImage}
                            alt={followedUser.fields.DisplayName || 'User'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-white">
                            {(followedUser.fields?.DisplayName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-white/70 group-hover:text-white transition-colors">
                        {followedUser.fields?.DisplayName || 'Anonymous'}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Popular Tags Section */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <button
              onClick={() => toggleSection('Popular Tags')}
              className="flex items-center justify-between w-full text-white/70 hover:text-white"
            >
              <span className="font-medium">Popular Tags</span>
              {sections['Popular Tags'] ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
            {sections['Popular Tags'] && (
              <div className="mt-2 space-y-1">
                {popularTags.map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-white/5 text-white/70 hover:text-white"
                  >
                    <span className="text-lg">🏷️</span>
                    <span>{tag}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </div>
  );
} 