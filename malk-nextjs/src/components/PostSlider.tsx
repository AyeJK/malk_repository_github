import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, HashtagIcon, FilmIcon } from '@heroicons/react/24/outline';
import DefaultAvatar from './DefaultAvatar';

// Optionally import category icons if needed for category sliders
import {
  MusicalNoteIcon,
  FaceSmileIcon,
  PuzzlePieceIcon,
  CakeIcon,
  SparklesIcon,
  AcademicCapIcon,
  SunIcon,
  CommandLineIcon,
  MicrophoneIcon,
  TrophyIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const categories = [
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

function getIconForTitle(title: string) {
  const category = categories.find(c => c.name.toLowerCase() === title.toLowerCase());
  return category ? category.icon : MusicalNoteIcon;
}

function getSliderLink(title: string): string {
  if (title.toLowerCase() === 'following') {
    return '/following';
  }
  const category = categories.find(c => c.name.toLowerCase() === title.toLowerCase());
  if (category) {
    return `/category/${title.toLowerCase().replace(/ /g, '-')}`;
  }
  return '#';
}

export interface PostSliderProps {
  title: string;
  posts: any[];
  isLoading?: boolean;
  onVisible?: () => void;
  rootMargin?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  hideIcon?: boolean;
  onRenderActions?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  userAvatar?: string;
  userName?: string;
}

export default function PostSlider({
  title,
  posts,
  isLoading = false,
  onVisible,
  rootMargin = '0px',
  onLoadMore,
  hasMore = false,
  hideIcon = false,
  onRenderActions,
  emptyMessage,
  userAvatar,
  userName
}: PostSliderProps) {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const lastIntersectionTime = React.useRef<number>(0);
  const visibilityDebounceTimeout = React.useRef<NodeJS.Timeout>();
  const Icon = getIconForTitle(title);
  const linkHref = getSliderLink(title);
  const isCategory = categories.some(c => c.name.toLowerCase() === title.toLowerCase());
  const isFollowing = title.toLowerCase() === 'following';
  const isTag = !isCategory && !isFollowing;
  const showIcon = !hideIcon && (isCategory || isFollowing);
  const isRecentPosts = title.trim().toLowerCase() === 'recent posts';

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

  // Intersection Observer for the slider
  React.useEffect(() => {
    if (!onVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const now = Date.now();
          if (now - lastIntersectionTime.current > 1000) {
            lastIntersectionTime.current = now;
            onVisible();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: rootMargin || '100px 0px 100px 0px',
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

  // Generate placeholder posts when loading or empty
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
  }));

  // If not loading and posts is empty, show placeholder posts
  const showEmptyState = !isLoading && posts.length === 0;
  const displayPosts = isLoading || showEmptyState ? placeholderPosts : posts;

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const scrollAmount = Math.max(container.clientWidth * 0.8, 300);
    const targetScroll = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
  };

  return (
    <div className="mb-6 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {userAvatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={userAvatar}
                alt={userName || 'User'}
                fill
                className="object-cover"
              />
            </div>
          ) : userAvatar === '' ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <DefaultAvatar userName={userName} />
            </div>
          ) : isRecentPosts ? (
            <FilmIcon className="w-6 h-6 text-white/70" />
          ) : showIcon ? (
            <Icon className="w-6 h-6 text-white/70" />
          ) : isTag && !isRecentPosts ? (
            <HashtagIcon className="w-6 h-6 text-white/70" />
          ) : null}
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className={`p-2 rounded-full transition-colors ${
              canScrollLeft 
                ? 'bg-white/5 hover:bg-white/10 text-white cursor-pointer' 
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
                ? 'bg-white/5 hover:bg-white/10 text-white cursor-pointer' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
            disabled={!canScrollRight}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          {onRenderActions}
        </div>
      </div>
      <div className="relative">
        {/* Overlay message on top of empty thumbnails */}
        {showEmptyState && emptyMessage && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            {emptyMessage}
          </div>
        )}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth relative"
        >
          {displayPosts.map((post) => (
            <div
              key={post.id}
              data-post-id={post.id}
              className="flex-none w-[300px]"
            >
              {!isLoading && !showEmptyState ? (
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
                  <h3 className="mt-3 text-base font-semibold text-white line-clamp-2">
                    {post.fields.VideoTitle || 'Untitled Video'}
                  </h3>
                </Link>
              ) : (
                <div>
                  <div className="aspect-video rounded-lg bg-gray-800 animate-pulse" />
                  <div className="pt-3">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
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
    </div>
  );
} 