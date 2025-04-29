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
  ChevronRightIcon
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
}

function PostSlider({ title, posts }: PostSliderProps) {
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const scrollAmount = 300; // Width of one card
    const currentScroll = sliderRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    sliderRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      <div ref={sliderRef} className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex-none w-[300px] overflow-hidden group"
          >
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
              {post.fields.ThumbnailURL ? (
                <Image
                  src={post.fields.ThumbnailURL}
                  alt={post.fields.VideoTitle || 'Video thumbnail'}
                  fill
                  className="object-cover absolute top-0 left-0 group-hover:scale-105 transition-transform duration-300"
                  sizes="300px"
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-800 flex items-center justify-center">
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
                    <DefaultAvatar userId={post.fields.FirebaseUID?.[0]} userName={post.fields.UserName} />
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
        ))}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [categoryPosts, setCategoryPosts] = useState<{ [key: string]: Post[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Fetch following posts if user is logged in
        if (user?.uid) {
          console.log('Fetching following posts for user:', user.uid);
          
          // First get the list of users we're following
          const followingResponse = await fetch(`/api/get-following?userId=${user.uid}`);
          if (!followingResponse.ok) {
            console.error('Failed to fetch following users');
          } else {
            const followingData = await followingResponse.json();
            const following = followingData.following || [];
            
            if (following.length > 0) {
              // Get posts from all followed users
              const followedUserIds = following.map((f: any) => f.fields.FirebaseUID).filter(Boolean);
              
              if (followedUserIds.length > 0) {
                // Fetch posts for all followed users
                const postsPromises = followedUserIds.map(async (uid: string) => {
                  const response = await fetch(`/api/get-user-posts?userId=${uid}`);
                  if (!response.ok) return [];
                  const data = await response.json();
                  return data.posts || [];
                });

                const allPosts = await Promise.all(postsPromises);
                
                // Flatten the array of arrays and sort by date
                const flattenedPosts = allPosts
                  .flat()
                  .sort((a, b) => {
                    const dateA = new Date(a.fields.DateCreated || 0);
                    const dateB = new Date(b.fields.DateCreated || 0);
                    return dateB.getTime() - dateA.getTime();
                  });

                setFollowingPosts(flattenedPosts);
                console.log('Following posts set:', flattenedPosts.length);
              }
            }
          }
        }

        // Fetch posts for each category
        const categoryData: { [key: string]: Post[] } = {};
        for (const category of categories) {
          const response = await fetch(`/api/category-feed?category=${category.name}`);
          if (response.ok) {
            const data = await response.json();
            categoryData[category.name] = data.posts || [];
          }
        }
        setCategoryPosts(categoryData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user?.uid]);

  // Debug log when followingPosts changes
  useEffect(() => {
    console.log('Current following posts:', followingPosts.length);
  }, [followingPosts]);

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
                className="group bg-dark-lighter hover:bg-white/5 rounded-lg p-4 transition-all duration-200 flex items-center space-x-3"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Icon className="w-5 h-5 text-white/70 group-hover:text-white" />
                </div>
                <span className="text-base font-medium text-white/90 group-hover:text-white">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center text-white/50 py-12">Loading posts...</div>
        )}

        {/* Post Sliders */}
        {!isLoading && (
          <div className="space-y-8">
            {/* Debug info */}
            {user && <div className="hidden">{`User: ${user.uid}, Following posts: ${followingPosts.length}`}</div>}
            
            {user && followingPosts.length > 0 && (
              <PostSlider 
                title="Following" 
                posts={followingPosts} 
              />
            )}
            
            {categories.map((category) => (
              categoryPosts[category.name]?.length > 0 && (
                <PostSlider
                  key={category.name}
                  title={category.name}
                  posts={categoryPosts[category.name]}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 