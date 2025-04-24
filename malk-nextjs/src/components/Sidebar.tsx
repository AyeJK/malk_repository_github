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
  TagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useSidebar } from '@/lib/sidebar-context';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

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

type SectionKeys = 'Following' | 'Categories' | 'Popular Tags';

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
  const [sections, setSections] = useState<Record<SectionKeys, boolean>>({
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

  const toggleSection = (section: SectionKeys) => {
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
    { href: '/following', label: 'Following', icon: <HeartIcon className="w-5 h-5" /> },
    { href: user && airtableUser ? `/profile/${airtableUser.id}` : '/login', label: 'Profile', icon: <FolderIcon className="w-5 h-5" /> },
  ];

  const isExpanded = sidebarState === 'expanded';
  const shouldShowLabels = isExpanded;

  return (
    <div>
      {/* Mobile Overlay Background */}
      {isVisible && sidebarState === 'hidden' && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => useSidebar().toggleVisibility()}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-black border-r border-gray-800 transition-all duration-300 z-40",
        !isVisible && "-translate-x-full",
        sidebarState === "collapsed" && "w-16"
      )}>
        <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Main Navigation */}
          <nav className="p-4 space-y-2">
            {mainLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center ${shouldShowLabels ? 'space-x-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${
                  pathname === href
                    ? 'bg-red-600/20 text-red-500'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                title={!shouldShowLabels ? label : undefined}
              >
                <span>{icon}</span>
                {shouldShowLabels && <span>{label}</span>}
              </Link>
            ))}
          </nav>

          {/* Following Section */}
          <div>
            <button
              onClick={() => toggleSection('Following')}
              className="flex items-center justify-between w-full text-gray-400 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                {sidebarState === "expanded" && <span>Following</span>}
              </div>
              {sidebarState === "expanded" && (
                <ChevronDownIcon className={cn("h-4 w-4 transition-transform", sections['Following'] ? "rotate-180" : "")} />
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

          {/* Categories Section */}
          <div>
            <button
              onClick={() => toggleSection('Categories')}
              className="flex items-center justify-between w-full text-gray-400 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <FolderIcon className="h-5 w-5" />
                {sidebarState === "expanded" && <span>Categories</span>}
              </div>
              {sidebarState === "expanded" && (
                <ChevronDownIcon className={cn("h-4 w-4 transition-transform", sections['Categories'] ? "rotate-180" : "")} />
              )}
            </button>
            {sections.Categories && (
              <div className="mt-2 space-y-1">
                {isLoadingCategories ? (
                  <div className="text-white/50 text-sm px-2">Loading categories...</div>
                ) : categories.length > 0 ? (
                  categories
                    .filter(category => category.name.toLowerCase() !== 'test category')
                    .map(({ id, name, slug }) => (
                      <Link
                        key={id}
                        href={`/category/${slug}`}
                        className={`flex items-center px-2 py-1 rounded hover:bg-white/5 ${
                          pathname === `/category/${slug}`
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-white/70 hover:text-white'
                        } group`}
                        title={!shouldShowLabels ? name : undefined}
                      >
                        <div className={`flex items-center ${shouldShowLabels ? 'space-x-2' : 'justify-center'}`}>
                          <span className="text-white/70 group-hover:text-white">
                            {getCategoryIcon(name)}
                          </span>
                          {(shouldShowLabels || sidebarState === 'hidden') && <span>{name}</span>}
                        </div>
                      </Link>
                    ))
                ) : (
                  <div className="text-white/50 text-sm px-2">No categories found</div>
                )}
              </div>
            )}
          </div>

          {/* Popular Tags Section */}
          <div>
            <button
              onClick={() => toggleSection('Popular Tags')}
              className="flex items-center justify-between w-full text-gray-400 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <TagIcon className="h-5 w-5" />
                {sidebarState === "expanded" && <span>Popular Tags</span>}
              </div>
              {sidebarState === "expanded" && (
                <ChevronDownIcon className={cn("h-4 w-4 transition-transform", sections['Popular Tags'] ? "rotate-180" : "")} />
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
                      className="flex items-center px-2 py-1 rounded hover:bg-white/5 text-white/70 hover:text-white group"
                      title={!shouldShowLabels ? name : undefined}
                    >
                      <div className={`flex items-center ${shouldShowLabels ? 'space-x-2' : 'justify-center'}`}>
                        <HashtagIcon className="w-5 h-5 text-white/70 group-hover:text-white" />
                        {(shouldShowLabels || sidebarState === 'hidden') && <span>{name}</span>}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-white/50 text-sm px-2">No tags found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 