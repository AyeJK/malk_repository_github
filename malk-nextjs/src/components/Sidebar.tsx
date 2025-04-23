'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';

interface SidebarSection {
  title: string;
  isOpen: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [sections, setSections] = useState<{ [key: string]: boolean }>({
    Following: true,
    Categories: false,
    'Popular Tags': true,
  });

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
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-black/40 backdrop-blur-sm border-r border-white/10 transition-all duration-300 ${
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

        {/* Following Section */}
        {!isCollapsed && (
          <>
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
                  {/* Placeholder following list - this would be dynamic */}
                  <div className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                    <span className="text-white/70">SpookyLandrock</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                    <span className="text-white/70">Squirrel</span>
                  </div>
                </div>
              )}
            </div>

            {/* Popular Tags Section */}
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
          </>
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