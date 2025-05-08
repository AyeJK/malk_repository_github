'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  HomeIcon,
  MusicalNoteIcon,
  FaceSmileIcon,
  PuzzlePieceIcon,
  CakeIcon,
  FilmIcon,
  SparklesIcon,
  AcademicCapIcon,
  SunIcon,
  CommandLineIcon,
  MicrophoneIcon,
  TrophyIcon,
  GlobeAltIcon,
  FolderIcon,
  HeartIcon,
  HashtagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';
import { useAuth } from '@/lib/auth-context';
import DefaultAvatar from './DefaultAvatar';
import { Raleway } from 'next/font/google';

const raleway = Raleway({ weight: ['400', '500', '700'], subsets: ['latin'] });

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

interface Tag {
  id: string;
  name: string;
  count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isVisible, sidebarState } = useSidebar();
  const { user, airtableUser } = useAuth();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [sections, setSections] = useState<{ [key: string]: boolean }>({
    Following: true,
    Categories: true,
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

  // Fetch popular tags
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        setIsLoadingTags(true);
        const response = await fetch('/api/get-top-tags?limit=10');
        if (!response.ok) throw new Error('Failed to fetch tags');
        
        const data = await response.json();
        setPopularTags(data.tags || []);
      } catch (error) {
        console.error('Error fetching popular tags:', error);
        setPopularTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchPopularTags();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch('/api/get-categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleSection = (section: string) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    const IconComponent = (() => {
      if (name.includes('music')) return MusicalNoteIcon;
      if (name.includes('comedy')) return FaceSmileIcon;
      if (name.includes('gaming')) return PuzzlePieceIcon;
      if (name.includes('food')) return CakeIcon;
      if (name.includes('film') || name.includes('tv') || name.includes('movie')) return FilmIcon;
      if (name.includes('beauty') || name.includes('fashion')) return SparklesIcon;
      if (name.includes('learning')) return AcademicCapIcon;
      if (name.includes('nature')) return SunIcon;
      if (name.includes('crafting') || name.includes('tech')) return CommandLineIcon;
      if (name.includes('podcast')) return MicrophoneIcon;
      if (name.includes('sports')) return TrophyIcon;
      if (name.includes('travel')) return GlobeAltIcon;
      return FolderIcon;
    })();
    
    return <IconComponent className="w-5 h-5" />;
  };

  const mainLinks = [
    { href: '/discover', label: 'Discover', icon: <HomeIcon className="w-5 h-5" /> },
    { href: '/posts', label: 'Activity', icon: <FilmIcon className="w-5 h-5" /> },
    { href: '/following', label: 'Following', icon: <UsersIcon className="w-5 h-5" /> },
    { href: user && airtableUser ? `/profile/${airtableUser.id}` : '/login', label: 'Profile', icon: <FolderIcon className="w-5 h-5" /> },
  ];

  const isExpanded = sidebarState === 'expanded';
  const isCollapsed = sidebarState === 'collapsed';
  const shouldShowLabels = isExpanded || sidebarState === 'hidden';

  return (
    <>
      {/* Mobile Overlay Background */}
      {isVisible && sidebarState === 'hidden' && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => useSidebar().toggleVisibility()}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-12 h-[calc(100vh-3rem)] ${raleway.className} shadow-lg transition-all duration-300 bg-black ${
          !isVisible ? '-translate-x-full' : 'translate-x-0'
        } ${
          sidebarState === 'hidden' ? 'z-50 w-64 shadow-lg' :
          isExpanded ? 'w-64' : 'w-[72px]'
        }`}
      >
        <div className="h-full overflow-y-auto sidebar-scrollbar">
          {/* Main Navigation */}
          <nav className={`pt-8 pb-4 space-y-2 ${isCollapsed ? 'pl-[14px] pr-3' : 'px-4'}`}>
            {mainLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center ${shouldShowLabels ? 'space-x-3' : ''} ${isCollapsed ? 'justify-start' : ''} px-3 py-2 rounded-lg transition-colors font-semibold text-lg ${
                  pathname === href
                    ? 'bg-[#ff8178]/20 text-[#ff8178] shadow-md'
                    : 'text-white/80 hover:bg-[#ff8178]/10 hover:text-[#ff8178]'
                }`}
                title={!shouldShowLabels ? label : undefined}
              >
                <span>{icon}</span>
                {shouldShowLabels && <span>{label}</span>}
              </Link>
            ))}
          </nav>

          {/* Following Section */}
          {shouldShowLabels && user && following.length > 0 && (
            <div className="px-4 py-2">
              <button
                onClick={() => toggleSection('Following')}
                className="flex items-center justify-between w-full text-white/80 hover:text-[#ff8178] font-bold text-base tracking-wide"
              >
                <span className="font-bold">Following</span>
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
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 group"
                      >
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          {followedUser.fields?.ProfileImage ? (
                            <Image
                              src={followedUser.fields.ProfileImage}
                              alt={followedUser.fields.DisplayName || 'User'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <DefaultAvatar 
                              userId={followedUser.fields?.FirebaseUID} 
                              userName={followedUser.fields?.DisplayName} 
                            />
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

          {/* Categories Section */}
          {shouldShowLabels && (
            <div className="px-4 py-2">
              <button
                onClick={() => toggleSection('Categories')}
                className="flex items-center justify-between w-full text-white/80 hover:text-[#ff8178] font-bold text-base tracking-wide"
              >
                <span className="font-bold">Categories</span>
                {sections.Categories ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
              {sections.Categories && (
                <div className="mt-2 space-y-1">
                  {isLoadingCategories ? (
                    <div className="text-white/50 text-sm px-2">Loading categories...</div>
                  ) : categories.length > 0 ? (
                    categories
                      .filter(category => {
                        const lowerName = category.name.toLowerCase();
                        return lowerName !== 'test category' && lowerName !== 'other';
                      })
                      .map(({ id, name, slug }) => (
                        <Link
                          key={id}
                          href={`/category/${slug}`}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 ${
                            pathname === `/category/${slug}`
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-white/70 hover:text-white'
                          } group`}
                          title={!shouldShowLabels ? name : undefined}
                        >
                          <span className="text-white/70 group-hover:text-white">
                            {getCategoryIcon(name)}
                          </span>
                          {shouldShowLabels && <span>{name}</span>}
                        </Link>
                      ))
                  ) : (
                    <div className="text-white/50 text-sm px-2">No categories found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Popular Tags Section */}
          {shouldShowLabels && (
            <div className="px-4 py-2">
              <button
                onClick={() => toggleSection('Popular Tags')}
                className="flex items-center justify-between w-full text-white/80 hover:text-[#ff8178] font-bold text-base tracking-wide"
              >
                <span className="font-bold">Popular Tags</span>
                {sections['Popular Tags'] ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
              {sections['Popular Tags'] && (
                <div className="mt-2 space-y-1">
                  {isLoadingTags ? (
                    <div className="text-white/50 text-sm px-2">Loading tags...</div>
                  ) : popularTags.length > 0 ? (
                    popularTags.map(({ id, name }) => (
                      <Link
                        key={id}
                        href={`/tags/${name.toLowerCase()}`}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white group"
                        title={!shouldShowLabels ? name : undefined}
                      >
                        <HashtagIcon className="w-5 h-5 text-white/70 group-hover:text-white" />
                        {shouldShowLabels && <span>{name}</span>}
                      </Link>
                    ))
                  ) : (
                    <div className="text-white/50 text-sm px-2">No tags found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 