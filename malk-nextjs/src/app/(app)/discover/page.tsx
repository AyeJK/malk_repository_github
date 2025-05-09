'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { 
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
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import DefaultAvatar from '@/components/DefaultAvatar';

interface Category {
  name: string;
  icon: React.ElementType;
  href: string;
}

interface Post {
  id: string;
  fields: {
    VideoURL: string;
    UserCaption: string;
    Categories?: string[];
    UserTags?: string[];
    FirebaseUID?: string[];
    DateCreated?: string;
    DisplayDate?: string;
    VideoTitle?: string;
    UserLikes?: string[];
    LikeCount?: number;
    CommentCount?: number;
    UserAvatar?: string;
    UserName?: string;
    ThumbnailURL?: string;
  };
}

const categories: Category[] = [
  { name: 'Music', icon: MusicalNoteIcon, href: '/category/music' },
  { name: 'Comedy', icon: FaceSmileIcon, href: '/category/comedy' },
  { name: 'Gaming', icon: PuzzlePieceIcon, href: '/category/gaming' },
  { name: 'Food', icon: CakeIcon, href: '/category/food' },
  { name: 'Film / TV / Movies', icon: FilmIcon, href: '/category/film-tv-movies' },
  { name: 'Beauty / Fashion', icon: SparklesIcon, href: '/category/beauty-fashion' },
  { name: 'Learning', icon: AcademicCapIcon, href: '/category/learning' },
  { name: 'Nature', icon: SunIcon, href: '/category/nature' },
  { name: 'Crafting / Tech', icon: CommandLineIcon, href: '/category/crafting-tech' },
  { name: 'Podcasts', icon: MicrophoneIcon, href: '/category/podcasts' },
  { name: 'Sports', icon: TrophyIcon, href: '/category/sports' },
  { name: 'Travel', icon: GlobeAltIcon, href: '/category/travel' },
];

interface PostSliderProps {
  title: string;
  posts: Post[];
  isLoading?: boolean;
  onVisible?: () => void;
  rootMargin?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function getIconForTitle(title: string): React.ElementType {
  if (title.toLowerCase() === 'following') {
    return UsersIcon;
  }
  // Find matching category or return a default icon
  const category = categories.find(c => c.name.toLowerCase() === title.toLowerCase());
  if (category) {
    return category.icon;
  }
  // Use FolderIcon as fallback for any unknown category
  return FolderIcon;
}

function getSliderLink(title: string): string {
  // For Following section
  if (title.toLowerCase() === 'following') {
    return '/following';
  }
  
  // For category sections
  const category = categories.find(c => c.name.toLowerCase() === title.toLowerCase());
  if (category) {
    return `/category/${title.toLowerCase().replace(/ /g, '-')}`;
  }
  
  return '#';
}

function PostSlider({ 
  title, 
  posts, 
  isLoading, 
  onVisible, 
  rootMargin = '0px',
  onLoadMore,
  hasMore = false
}: PostSliderProps) {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [visiblePosts, setVisiblePosts] = React.useState<Post[]>([]);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const lastIntersectionTime = React.useRef<number>(0);
  const visibilityDebounceTimeout = React.useRef<NodeJS.Timeout>();
  const Icon = getIconForTitle(title);
  const linkHref = getSliderLink(title);

  // Update scroll buttons state
  const updateScrollButtons = React.useCallback(() => {
    if (!sliderRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Initialize scroll buttons state and add resize observer
  React.useEffect(() => {
    updateScrollButtons();
    
    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtons();
    });

    if (sliderRef.current) {
      resizeObserver.observe(sliderRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateScrollButtons, posts]);

  // Intersection Observer for the slider with improved visibility detection
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const now = Date.now();
          if (now - lastIntersectionTime.current > 1000) {
            lastIntersectionTime.current = now;
            setIsVisible(true);
            onVisible?.();
          }
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px 0px 100px 0px' // Increased vertical margins
      }
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => {
      observer.disconnect();
      if (visibilityDebounceTimeout.current) {
        clearTimeout(visibilityDebounceTimeout.current);
      }
    };
  }, [onVisible]);

  // Update visible posts when posts array changes
  React.useEffect(() => {
    if (!isLoading && posts.length > 0) {
      setVisiblePosts(posts);
    }
  }, [posts, isLoading]);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const container = sliderRef.current;
    const scrollAmount = Math.max(container.clientWidth * 0.8, 300); // At least 300px or 80% of container width
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    // Update scroll buttons after animation
    setTimeout(updateScrollButtons, 300);
  };

  // Add scroll event listener to update button states
  React.useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
      
      // Check if we need to load more posts
      if (hasMore && onLoadMore && !isLoadingMore) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        if (scrollWidth - (scrollLeft + clientWidth) < clientWidth * 0.5) {
          setIsLoadingMore(true);
          onLoadMore();
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateScrollButtons, hasMore, onLoadMore, isLoadingMore]);

  // Reset isLoadingMore when new posts are added
  React.useEffect(() => {
    setIsLoadingMore(false);
  }, [posts.length]);

  // Generate placeholder posts when loading
  const placeholderPosts = Array(5).fill(null).map((_, i) => ({
    id: `placeholder-${i}`,
    fields: {
      VideoURL: '',
      UserCaption: '',
      ThumbnailURL: '',
      VideoTitle: '',
      UserAvatar: '',
      UserName: '',
    }
  } as Post));

  const displayPosts = isLoading ? placeholderPosts : posts;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <Link href={linkHref} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Icon className="w-6 h-6 text-white/70" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </Link>
      </div>
      {/* Thumbnails + nav buttons and metadata in one scrollable row */}
      <div className="relative mb-2">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-6 top-[84px] -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900/90 shadow-xl hover:bg-neutral-800 transition-colors text-white border border-black/30"
            aria-label="Scroll left"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-6 top-[84px] -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900/90 shadow-xl hover:bg-neutral-800 transition-colors text-white border border-black/30"
            aria-label="Scroll right"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth"
        >
          {displayPosts.map((post) => (
            <div
              key={post.id}
              data-post-id={post.id}
              className="flex-none w-[300px] flex flex-col"
            >
              <Link href={`/posts/${post.id}`} className="block group">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  {post.fields.ThumbnailURL ? (
                    <Image
                      src={post.fields.ThumbnailURL}
                      alt={post.fields.VideoTitle || 'Video thumbnail'}
                      fill
                      className="object-cover absolute top-0 left-0 group-hover:scale-105 transition-transform duration-300"
                      sizes="300px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No thumbnail</span>
                    </div>
                  )}
                </div>
              </Link>
              <Link href={`/posts/${post.id}`} className="block group">
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                      {post.fields.UserAvatar ? (
                        <Image
                          src={post.fields.UserAvatar}
                          alt={post.fields.UserName || 'User'}
                          fill
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <DefaultAvatar />
                      )}
                    </div>
                    <div className="text-base text-gray-300 truncate">
                      <span className="font-semibold text-base">{post.fields.UserName || 'Anonymous'}</span>
                      <span className="ml-1 text-base">shared:</span>
                    </div>
                  </div>
                  <h3 className="mt-1 font-medium text-white text-base leading-snug font-sans line-clamp-2">
                    {post.fields.VideoTitle || 'Untitled Video'}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
          {isLoadingMore && (
            <div className="flex-none w-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CategoryWithPosts extends Category {
  posts?: Post[];
  isLoading?: boolean;
  hasMore: boolean;
  offset: number;
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [categoriesWithPosts, setCategoriesWithPosts] = useState<CategoryWithPosts[]>(
    categories.map(cat => ({ ...cat, posts: [], isLoading: false, hasMore: true, offset: 0 }))
  );
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
  const [currentlyLoading, setCurrentlyLoading] = useState<string | null>(null);
  const loadingQueue = React.useRef<string[]>([]);
  const categoryCache = React.useRef<Map<string, { timestamp: number, data: any }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const lastRequestTime = React.useRef<Map<string, number>>(new Map());
  const REQUEST_DEBOUNCE = 1000; // 1 second

  // Fetch top tags for tag row
  const [topTags, setTopTags] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    fetch('/api/get-top-tags?limit=15')
      .then(res => res.json())
      .then(data => setTopTags(data.tags || []));
  }, []);

  const loadFollowingPosts = React.useCallback(async () => {
    if (!user?.uid || loadedSections.has('following')) return;
    
    const now = Date.now();
    const lastRequest = lastRequestTime.current.get('following') || 0;
    if (now - lastRequest < REQUEST_DEBOUNCE) return;
    lastRequestTime.current.set('following', now);
    
    setFollowingLoading(true);
    try {
      const followingResponse = await fetch(`/api/get-following?userId=${user.uid}`);
      if (followingResponse.ok) {
        const followingData = await followingResponse.json();
        const following = followingData.following || [];
        
        if (following.length > 0) {
          const followedUserIds = following.map((f: any) => f.fields.FirebaseUID).filter(Boolean);
          
          if (followedUserIds.length > 0) {
            // Batch the user posts requests
            const postsPromises = followedUserIds.map(async (uid: string) => {
              const lastRequest = lastRequestTime.current.get(`user-${uid}`) || 0;
              if (now - lastRequest < REQUEST_DEBOUNCE) return [];
              
              lastRequestTime.current.set(`user-${uid}`, now);
              const response = await fetch(`/api/get-user-posts?userId=${uid}`);
              if (!response.ok) return [];
              const data = await response.json();
              return data.posts || [];
            });

            const allPosts = await Promise.all(postsPromises);
            const flattenedPosts = allPosts
              .flat()
              .sort((a, b) => {
                const dateA = new Date(a.fields.DisplayDate || a.fields.DateCreated || 0);
                const dateB = new Date(b.fields.DisplayDate || b.fields.DateCreated || 0);
                return dateB.getTime() - dateA.getTime();
              });

            setFollowingPosts(flattenedPosts);

            // Update cache
            categoryCache.current.set('following', {
              timestamp: now,
              data: flattenedPosts
            });
          }
        }
      }
      setLoadedSections(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add('following');
        return newSet;
      });
    } catch (error) {
      console.error('Error fetching following posts:', error);
    } finally {
      setFollowingLoading(false);
    }
  }, [user?.uid, loadedSections]);

  const loadCategoryPosts = React.useCallback(async (categoryName: string) => {
    if (loadedSections.has(categoryName)) return;

    const now = Date.now();
    const lastRequest = lastRequestTime.current.get(categoryName) || 0;
    if (now - lastRequest < REQUEST_DEBOUNCE) return;
    lastRequestTime.current.set(categoryName, now);

    setCategoriesWithPosts(prev => 
      prev.map(cat => 
        cat.name === categoryName 
          ? { ...cat, isLoading: true }
          : cat
      )
    );

    try {
      const response = await fetch(
        `/api/category-feed?category=${encodeURIComponent(categoryName)}&offset=0&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        const posts = data.posts || [];
        
        setCategoriesWithPosts(prev =>
          prev.map(cat =>
            cat.name === categoryName
              ? {
                  ...cat,
                  posts,
                  isLoading: false,
                  offset: 10,
                  hasMore: data.hasMore
                }
              : cat
          )
        );

        // Update cache
        categoryCache.current.set(categoryName, {
          timestamp: now,
          data: {
            posts,
            offset: 10,
            hasMore: data.hasMore
          }
        });
      }
      setLoadedSections(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(categoryName);
        return newSet;
      });
    } catch (error) {
      console.error(`Error fetching posts for ${categoryName}:`, error);
    } finally {
      setCategoriesWithPosts(prev =>
        prev.map(cat =>
          cat.name === categoryName
            ? { ...cat, isLoading: false }
            : cat
        )
      );
    }
  }, [loadedSections]);

  const processQueue = React.useCallback(async () => {
    if (loadingQueue.current.length === 0 || currentlyLoading) {
      return;
    }

    const nextSection = loadingQueue.current[0];
    
    // Check cache before loading
    const cached = categoryCache.current.get(nextSection);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Use cached data
      if (nextSection === 'following') {
        setFollowingPosts(cached.data);
      } else {
        setCategoriesWithPosts(prev =>
          prev.map(cat =>
            cat.name === nextSection
              ? {
                  ...cat,
                  ...cached.data,
                  isLoading: false
                }
              : cat
          )
        );
      }
      setLoadedSections(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(nextSection);
        return newSet;
      });
      loadingQueue.current = loadingQueue.current.filter(s => s !== nextSection);
      setTimeout(processQueue, 100);
      return;
    }

    setCurrentlyLoading(nextSection);

    try {
      if (nextSection === 'following') {
        await loadFollowingPosts();
      } else {
        await loadCategoryPosts(nextSection);
      }
    } catch (error) {
      console.error(`Error processing queue for ${nextSection}:`, error);
    } finally {
      loadingQueue.current = loadingQueue.current.filter(s => s !== nextSection);
      setCurrentlyLoading(null);
      setTimeout(processQueue, 100);
    }
  }, [currentlyLoading, loadFollowingPosts, loadCategoryPosts]);

  const addToLoadingQueue = React.useCallback((sectionName: string) => {
    if (!loadingQueue.current.includes(sectionName) && 
        !loadedSections.has(sectionName)) {
      if (sectionName === 'following') {
        loadingQueue.current.unshift(sectionName);
      } else {
        loadingQueue.current.push(sectionName);
      }
      processQueue();
    }
  }, [loadedSections, processQueue]);

  const loadMorePosts = React.useCallback(async (categoryName: string) => {
    const category = categoriesWithPosts.find(c => c.name === categoryName);
    if (!category || !category.hasMore) return;

    const now = Date.now();
    const lastRequest = lastRequestTime.current.get(`more-${categoryName}`) || 0;
    if (now - lastRequest < REQUEST_DEBOUNCE) return;
    lastRequestTime.current.set(`more-${categoryName}`, now);

    try {
      const response = await fetch(
        `/api/category-feed?category=${encodeURIComponent(categoryName)}&offset=${category.offset}&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        const newPosts = data.posts || [];
        
        setCategoriesWithPosts(prev =>
          prev.map(cat =>
            cat.name === categoryName
              ? {
                  ...cat,
                  posts: [...(cat.posts || []), ...newPosts],
                  offset: cat.offset + 10,
                  hasMore: data.hasMore
                }
              : cat
          )
        );

        // Update cache
        categoryCache.current.set(categoryName, {
          timestamp: now,
          data: {
            posts: [...(category.posts || []), ...newPosts],
            offset: category.offset + 10,
            hasMore: data.hasMore
          }
        });
      }
    } catch (error) {
      console.error(`Error loading more posts for ${categoryName}:`, error);
    }
  }, [categoriesWithPosts]);

  const onSectionVisible = (sectionName: string) => {
    addToLoadingQueue(sectionName);
  };

  // Debug logging for queue state
  useEffect(() => {
    if (currentlyLoading) {
      console.log(`Currently loading: ${currentlyLoading}`);
      console.log(`Queue: ${loadingQueue.current.join(', ')}`);
    }
  }, [currentlyLoading]);

  // Add cleanup effect for stuck loading states
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentlyLoading) {
        setCurrentlyLoading(null);
        
        // Clear any stuck loading states in categoriesWithPosts
        setCategoriesWithPosts(prev =>
          prev.map(cat =>
            cat.isLoading ? { ...cat, isLoading: false } : cat
          )
        );
        
        // Reset the queue
        loadingQueue.current = [];
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [currentlyLoading]);

  // Load following section on mount if user is logged in
  useEffect(() => {
    if (user?.uid) {
      addToLoadingQueue('following');
    }
  }, [user?.uid, addToLoadingQueue]);

  const tagRowRef = React.useRef<HTMLDivElement>(null);
  const [showTagScrollButton, setShowTagScrollButton] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateTagScrollButton = React.useCallback(() => {
    const el = tagRowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  React.useEffect(() => {
    updateTagScrollButton();
    window.addEventListener('resize', updateTagScrollButton);
    return () => window.removeEventListener('resize', updateTagScrollButton);
  }, [topTags, updateTagScrollButton]);

  const scrollTagRowRight = () => {
    const el = tagRowRef.current;
    if (!el) return;
    el.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(updateTagScrollButton, 350);
  };

  const scrollTagRowLeft = () => {
    const el = tagRowRef.current;
    if (!el) return;
    el.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(updateTagScrollButton, 350);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Popular Tags Row */}
        <div className="flex items-center relative mb-12" style={{ minHeight: '48px' }}>
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              type="button"
              className="bg-black/80 hover:bg-black/90 text-white p-2 rounded-full shadow transition-colors z-10 mr-2 self-center"
              onClick={scrollTagRowLeft}
              aria-label="Scroll tags left"
              style={{ pointerEvents: 'auto' }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}
          <div
            className="flex gap-3 overflow-x-auto hide-scrollbar items-center flex-1"
            ref={tagRowRef}
            onScroll={updateTagScrollButton}
          >
            {topTags.map((tag, idx) => {
              // Color palettes matching the screenshot (deep brown, maroon, etc. for bg; red, orange, yellow, magenta for text)
              const bgColors = [
                'bg-[#1a0d10]', // deep maroon
                'bg-[#1a1208]', // deep brown
                'bg-[#181200]', // dark yellow-brown
                'bg-[#1a0810]', // deep purple-maroon
              ];
              const textColors = [
                'text-[#ff6b81]', // vibrant red
                'text-[#ffb347]', // orange
                'text-[#ffe156]', // yellow
                'text-[#e26ee5]', // magenta
              ];
              const bg = bgColors[idx % bgColors.length];
              const text = textColors[idx % textColors.length];
              return (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name.toLowerCase()}`}
                  className={`px-4 py-2 rounded-md font-medium text-base whitespace-nowrap transition-colors ${bg} ${text} hover:brightness-125`}
                  style={{ fontFamily: 'inherit' }}
                >
                  #{tag.name}
                </Link>
              );
            })}
          </div>
          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              type="button"
              className="bg-black/80 hover:bg-black/90 text-white p-2 rounded-full shadow transition-colors z-10 ml-2 self-center"
              onClick={scrollTagRowRight}
              aria-label="Scroll tags right"
              style={{ pointerEvents: 'auto' }}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Post Sliders */}
        <div className="space-y-8">
          {user && (followingPosts.length > 0 || followingLoading || currentlyLoading === 'following') && (
            <PostSlider 
              title="Following"
              posts={followingPosts}
              isLoading={followingLoading || currentlyLoading === 'following'}
              onVisible={() => onSectionVisible('following')}
              rootMargin="100px"
            />
          )}
          
          {categoriesWithPosts.map((category) => (
            <PostSlider
              key={category.name}
              title={category.name}
              posts={category.posts || []}
              isLoading={category.isLoading || currentlyLoading === category.name}
              onVisible={() => onSectionVisible(category.name)}
              rootMargin="100px"
              onLoadMore={() => loadMorePosts(category.name)}
              hasMore={category.hasMore}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 