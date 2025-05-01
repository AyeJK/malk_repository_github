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

  // Initialize scroll buttons state
  React.useEffect(() => {
    updateScrollButtons();
    
    const handleResize = () => {
      updateScrollButtons();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollButtons]);

  // Intersection Observer for the slider with debouncing
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const now = Date.now();
          if (now - lastIntersectionTime.current > 1000) { // 1 second debounce
            lastIntersectionTime.current = now;
            
            // Clear any existing timeout
            if (visibilityDebounceTimeout.current) {
              clearTimeout(visibilityDebounceTimeout.current);
            }
            
            // Set a new timeout
            visibilityDebounceTimeout.current = setTimeout(() => {
              setIsVisible(true);
              onVisible?.();
              observer.disconnect();
            }, 100);
          }
        }
      },
      { 
        threshold: 0.1,
        rootMargin 
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
  }, [onVisible, rootMargin]);

  // Intersection Observer for posts with optimized tracking
  React.useEffect(() => {
    if (!isVisible || isLoading) return;

    const observedPosts = new Set<string>();
    const postObserver = new IntersectionObserver(
      (entries) => {
        let shouldLoadMore = false;
        const newVisiblePosts = new Set<Post>();

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute('data-post-id');
            if (postId) {
              const post = posts.find(p => p.id === postId);
              if (post) {
                newVisiblePosts.add(post);
                
                // Check if we need to load more posts
                if (hasMore && onLoadMore && !isLoadingMore) {
                  const lastPost = posts[posts.length - 1];
                  if (postId === lastPost.id) {
                    shouldLoadMore = true;
                  }
                }
              }
            }
          }
        });

        if (newVisiblePosts.size > 0) {
          setVisiblePosts(prev => {
            const uniquePosts = Array.from(new Set([...prev, ...Array.from(newVisiblePosts)]));
            return uniquePosts;
          });
        }

        if (shouldLoadMore) {
          setIsLoadingMore(true);
          onLoadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    const postElements = sliderRef.current?.querySelectorAll('[data-post-id]');
    postElements?.forEach(el => {
      const postId = el.getAttribute('data-post-id');
      if (postId && !observedPosts.has(postId)) {
        postObserver.observe(el);
        observedPosts.add(postId);
      }
    });

    return () => postObserver.disconnect();
  }, [isVisible, isLoading, posts, hasMore, onLoadMore, isLoadingMore]);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const container = sliderRef.current;
    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
    const currentScroll = container.scrollLeft;
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : Math.min(
          container.scrollWidth - container.clientWidth,
          currentScroll + scrollAmount
        );
    
    container.scrollTo({
      left: newScroll,
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
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className={`p-2 rounded-full transition-colors ${
              canScrollLeft 
                ? 'bg-white/5 hover:bg-white/10 text-white' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`p-2 rounded-full transition-colors ${
              canScrollRight 
                ? 'bg-white/5 hover:bg-white/10 text-white' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
            disabled={!canScrollRight}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div 
        ref={sliderRef} 
        className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
      >
        {isVisible && displayPosts.map((post) => (
          <div
            key={post.id}
            data-post-id={post.id}
            className="flex-none w-[300px]"
          >
            {(!isLoading && visiblePosts.some(p => p.id === post.id)) ? (
              <Link
                href={`/posts/${post.id}`}
                className="block overflow-hidden group"
              >
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
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      {post.fields.UserAvatar ? (
                        <Image
                          src={post.fields.UserAvatar}
                          alt={post.fields.UserName || 'User'}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      ) : (
                        <DefaultAvatar />
                      )}
                    </div>
                    <div className="text-sm text-gray-300 truncate">
                      <span className="font-semibold">{post.fields.UserName || 'Anonymous'}</span>
                      <span className="ml-1">shared:</span>
                    </div>
                  </div>
                  <h3 className="font-medium text-white text-sm line-clamp-2">
                    {post.fields.VideoTitle || 'Untitled Video'}
                  </h3>
                </div>
              </Link>
            ) : (
              <div>
                <div className="aspect-video rounded-lg bg-gray-800 animate-pulse" />
                <div className="pt-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-800 animate-pulse" />
                    <div className="h-4 w-24 bg-gray-800 animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-full bg-gray-800 animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-gray-800 animate-pulse rounded mt-1" />
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoadingMore && (
          <div className="flex-none w-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
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
  const [emptySections, setEmptySections] = useState<Set<string>>(new Set());
  const categoryCache = React.useRef<Map<string, { timestamp: number, data: any }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const loadFollowingPosts = React.useCallback(async () => {
    if (!user?.uid || loadedSections.has('following')) return;
    
    setFollowingLoading(true);
    try {
      const followingResponse = await fetch(`/api/get-following?userId=${user.uid}`);
      if (followingResponse.ok) {
        const followingData = await followingResponse.json();
        const following = followingData.following || [];
        
        if (following.length > 0) {
          const followedUserIds = following.map((f: any) => f.fields.FirebaseUID).filter(Boolean);
          
          if (followedUserIds.length > 0) {
            const postsPromises = followedUserIds.map(async (uid: string) => {
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
              timestamp: Date.now(),
              data: flattenedPosts
            });

            if (flattenedPosts.length === 0) {
              setEmptySections(prev => {
                const newSet = new Set(Array.from(prev));
                newSet.add('following');
                return newSet;
              });
            }
          } else {
            setEmptySections(prev => {
              const newSet = new Set(Array.from(prev));
              newSet.add('following');
              return newSet;
            });
          }
        } else {
          setEmptySections(prev => {
            const newSet = new Set(Array.from(prev));
            newSet.add('following');
            return newSet;
          });
        }
      }
      setLoadedSections(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add('following');
        return newSet;
      });
    } catch (error) {
      console.error('Error fetching following posts:', error);
      setEmptySections(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add('following');
        return newSet;
      });
    } finally {
      setFollowingLoading(false);
    }
  }, [user?.uid, loadedSections]);

  const loadCategoryPosts = React.useCallback(async (categoryName: string) => {
    if (loadedSections.has(categoryName) || emptySections.has(categoryName)) return;

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
        
        if (!posts.length) {
          setEmptySections(prev => {
            const newSet = new Set(Array.from(prev));
            newSet.add(categoryName);
            return newSet;
          });
        } else {
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
            timestamp: Date.now(),
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
      } else {
        setEmptySections(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.add(categoryName);
          return newSet;
        });
      }
    } catch (error) {
      console.error(`Error fetching posts for ${categoryName}:`, error);
      setEmptySections(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(categoryName);
        return newSet;
      });
    } finally {
      setCategoriesWithPosts(prev =>
        prev.map(cat =>
          cat.name === categoryName
            ? { ...cat, isLoading: false }
            : cat
        )
      );
    }
  }, [loadedSections, emptySections]);

  const processQueue = React.useCallback(async () => {
    if (loadingQueue.current.length === 0 || currentlyLoading) {
      return;
    }

    const nextSection = loadingQueue.current[0];
    
    if (emptySections.has(nextSection)) {
      loadingQueue.current = loadingQueue.current.filter(s => s !== nextSection);
      processQueue();
      return;
    }

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
      setEmptySections(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(nextSection);
        return newSet;
      });
    } finally {
      loadingQueue.current = loadingQueue.current.filter(s => s !== nextSection);
      setCurrentlyLoading(null);
      setTimeout(processQueue, 100);
    }
  }, [currentlyLoading, loadFollowingPosts, loadCategoryPosts]);

  const addToLoadingQueue = React.useCallback((sectionName: string) => {
    if (!loadingQueue.current.includes(sectionName) && 
        !loadedSections.has(sectionName) && 
        !emptySections.has(sectionName)) {
      if (sectionName === 'following') {
        loadingQueue.current.unshift(sectionName);
      } else {
        loadingQueue.current.push(sectionName);
      }
      processQueue();
    }
  }, [loadedSections, emptySections, processQueue]);

  const loadMorePosts = React.useCallback(async (categoryName: string) => {
    const category = categoriesWithPosts.find(c => c.name === categoryName);
    if (!category || !category.hasMore) return;

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
          timestamp: Date.now(),
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
        // If something is stuck loading, mark it as empty and clear the loading state
        setEmptySections(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.add(currentlyLoading);
          return newSet;
        });
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Discover</h1>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group bg-dark-lighter flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                <Icon className="w-7 h-7 text-white/70 group-hover:text-white transition-colors" />
                <span className="text-base font-medium text-white/90 group-hover:text-white">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Post Sliders */}
        <div className="space-y-8">
          {user && !emptySections.has('following') && (
            <PostSlider 
              title="Following"
              posts={followingPosts}
              isLoading={followingLoading || currentlyLoading === 'following'}
              onVisible={() => onSectionVisible('following')}
              rootMargin="100px"
            />
          )}
          
          {categoriesWithPosts
            .filter(category => !emptySections.has(category.name) || currentlyLoading === category.name)
            .map((category) => (
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