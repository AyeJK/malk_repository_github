'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import UserCard from '@/components/UserCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/lib/auth-context';
import DefaultAvatar from '@/components/DefaultAvatar';
import { CheckIcon } from '@heroicons/react/24/outline';
import PostSlider from '@/components/PostSlider';
import CustomProfileSection from '@/components/CustomProfileSection';
import LazyPostCard from '@/components/LazyPostCard';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  const [firebaseUID, setFirebaseUID] = useState<string | null>(null);
  const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollow(firebaseUID);
  
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'posts' | 'likes' | 'followers' | 'following'>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'feed'>('feed');
  const [sort, setSort] = useState<'latest' | 'popular' | 'oldest'>('latest');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'category' | 'tag'>('category');
  const [selectedValue, setSelectedValue] = useState('');
  const [search, setSearch] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [userCategories, setUserCategories] = useState<{ id: string; name: string }[]>([]);
  const [userTags, setUserTags] = useState<{ id: string; name: string }[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user data
        const userResponse = await fetch(`/api/get-user?ids=${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        
        if (!userData.users || userData.users.length === 0) {
          throw new Error('User not found');
        }
        
        const userRecord = userData.users[0];
        console.log('User record:', userRecord);
        console.log('User fields:', userRecord.fields);
        setUser(userRecord);
        
        // Get the Firebase UID from the user record
        const userFirebaseUID = userRecord.fields.FirebaseUID;
        console.log('User Firebase UID:', userFirebaseUID);
        setFirebaseUID(userFirebaseUID);
        
        if (!userFirebaseUID) {
          console.error('User record does not have a Firebase UID');
          setPosts([]);
        } else {
          // Fetch user's posts using the Firebase UID
          const postsResponse = await fetch(`/api/get-user-posts?userId=${userFirebaseUID}`);
          if (!postsResponse.ok) {
            throw new Error('Failed to fetch user posts');
          }
          const postsData = await postsResponse.json();
          
          setPosts(postsData.posts || []);
          
          // Fetch followers
          const followersResponse = await fetch(`/api/get-followers?userId=${userFirebaseUID}`);
          if (followersResponse.ok) {
            const followersData = await followersResponse.json();
            setFollowers(followersData.followers || []);
          }
          
          // Fetch following
          const followingResponse = await fetch(`/api/get-following?userId=${userFirebaseUID}`);
          if (followingResponse.ok) {
            const followingData = await followingResponse.json();
            setFollowing(followingData.following || []);
          }
          
          // Fetch liked posts
          if (userRecord.fields?.LikedPosts && userRecord.fields.LikedPosts.length > 0) {
            try {
              const likedPostsResponse = await fetch(`/api/get-posts-by-record-ids?recordIds=${userRecord.fields.LikedPosts.join(',')}`);
              if (likedPostsResponse.ok) {
                const likedPostsData = await likedPostsResponse.json();
                setLikedPosts(likedPostsData.posts || []);
              }
            } catch (error) {
              console.error('Error fetching liked posts:', error);
              setLikedPosts([]);
            }
          } else {
            setLikedPosts([]);
          }
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setError(err.message || 'Failed to load profile');
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (!showAddSectionModal) return;
    const fetchData = async () => {
      setIsLoadingOptions(true);
      try {
        const categoriesResponse = await fetch('/api/get-categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
        setCategoriesLoaded(true);

        const tagsResponse = await fetch('/api/get-top-tags?limit=1000');
        const tagsData = await tagsResponse.json();
        setTags(tagsData.tags || []);
        setTagsLoaded(true);
      } catch (error) {
        setCategoriesLoaded(true);
        setTagsLoaded(true);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchData();
  }, [showAddSectionModal]);

  useEffect(() => {
    if (!showAddSectionModal || !firebaseUID) return;
    setIsLoadingOptions(true);
    const fetchUserPosts = async () => {
      try {
        const response = await fetch(`/api/get-user-posts?userId=${firebaseUID}`);
        if (!response.ok) throw new Error('Failed to fetch user posts');
        const data = await response.json();
        setUserPosts(data.posts || []);
      } catch (error) {
        setUserPosts([]);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchUserPosts();
  }, [showAddSectionModal, firebaseUID]);

  useEffect(() => {
    if (!showAddSectionModal || !categoriesLoaded || !tagsLoaded || isLoadingOptions) return;
    let cats: { id: string; name: string }[] = [];
    let tagsArr: { id: string; name: string }[] = [];
    for (const post of userPosts) {
      // Categories
      if (post.fields.Categories && Array.isArray(post.fields.Categories)) {
        for (const catId of post.fields.Categories) {
          const cat = categories.find(c => c.id === catId);
          if (cat) cats.push(cat);
        }
      }
      // Tags
      if (post.fields.UserTags && Array.isArray(post.fields.UserTags)) {
        for (const tagId of post.fields.UserTags) {
          const tag = tags.find(t => t.id === tagId);
          if (tag) tagsArr.push(tag);
        }
      }
    }
    // Remove duplicates
    function uniqBy<T>(arr: T[], key: (item: T) => any): T[] {
      const seen = new Set();
      return arr.filter((item: T) => {
        const k = key(item);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }
    setUserCategories(uniqBy(cats, (c) => c.id));
    setUserTags(uniqBy(tagsArr, (t) => t.id));
  }, [showAddSectionModal, categoriesLoaded, tagsLoaded, isLoadingOptions, userPosts, categories, tags]);

  useEffect(() => {
    if (selectedType === 'category') {
      setFilteredOptions(userCategories.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase())));
    } else {
      setFilteredOptions(userTags.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase())));
    }
  }, [search, selectedType, userCategories, userTags]);

  useEffect(() => {
    if (!firebaseUID) return;
    // Fetch current sections for the user
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/profile-sections?userId=${firebaseUID}`);
        if (!response.ok) throw new Error('Failed to fetch sections');
        const data = await response.json();
        setSections(data.sections || []);
      } catch (error) {
        setSections([]);
      }
    };
    fetchSections();
  }, [firebaseUID, showAddSectionModal]);

  const handleAddSection = async () => {
    if (!selectedValue) return;
    const selectedItem = selectedType === 'category'
      ? userCategories.find(c => c.id === selectedValue)
      : userTags.find(t => t.id === selectedValue);
    if (!selectedItem) return;
    const newSection = {
      id: `${selectedType}-${selectedValue}`,
      type: selectedType,
      value: selectedValue,
      name: selectedItem.name
    };
    const updatedSections = [...sections, newSection];
    try {
      const response = await fetch('/api/profile-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: firebaseUID,
          sections: updatedSections
        })
      });
      if (!response.ok) throw new Error('Failed to save section');
      setSections(updatedSections);
      setShowAddSectionModal(false);
      setSelectedValue('');
      setSearch('');
    } catch (error) {
      // Optionally show error
    }
  };

  const renderLayoutToggle = () => (
    <div className="flex gap-2">
      <button
        className={`h-10 w-10 flex items-center justify-center p-0 rounded-lg border transition-colors duration-200 ${layout === 'feed' ? 'bg-[#260808] border-[#260808]' : 'bg-white/10 border-transparent hover:bg-white/20'}`}
        onClick={() => setLayout('feed')}
        aria-label="Feed view"
        title="Feed view"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={layout === 'feed' ? '#e24a4a' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="7" x2="19" y2="7" />
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="5" y1="17" x2="19" y2="17" />
        </svg>
      </button>
      <button
        className={`h-10 w-10 flex items-center justify-center p-0 rounded-lg border transition-colors duration-200 ${layout === 'grid' ? 'bg-[#260808] border-[#260808]' : 'bg-white/10 border-transparent hover:bg-white/20'}`}
        onClick={() => setLayout('grid')}
        aria-label="Grid view"
        title="Grid view"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={layout === 'grid' ? '#e24a4a' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
      </button>
    </div>
  );

  const renderSortToggle = () => (
    <div className="flex gap-2">
      {['latest', 'popular', 'oldest'].map((type) => (
        <button
          key={type}
          onClick={() => setSort(type as 'latest' | 'popular' | 'oldest')}
          className={`h-10 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            sort === type
              ? 'bg-white text-black font-bold'
              : 'bg-black/40 text-white/80 hover:bg-white/10'
          }`}
        >
          {type === 'latest' ? 'Latest' : type === 'popular' ? 'Popular' : 'Oldest'}
        </button>
      ))}
    </div>
  );

  function getSortedPosts(arr: any[]) {
    if (sort === 'latest') {
      return [...arr].sort((a, b) => (b.fields.DisplayDate || '').localeCompare(a.fields.DisplayDate || ''));
    } else if (sort === 'oldest') {
      return [...arr].sort((a, b) => (a.fields.DisplayDate || '').localeCompare(b.fields.DisplayDate || ''));
    } else if (sort === 'popular') {
      return [...arr].sort((a, b) => (b.fields.LikeCount || 0) - (a.fields.LikeCount || 0));
    }
    return arr;
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center p-4"><LoadingSpinner /></div>;
    }

    if (error) {
      return <div className="text-red-500 p-4">{error}</div>;
    }

    if (!user) {
      return <div className="p-4">User not found</div>;
    }

    switch (activeTab) {
      case 'home': {
        const isOwnProfile = currentUser?.uid === firebaseUID;
        return (
          <div className="space-y-6">
            {/* Recent Posts Slider */}
            <PostSlider
              title="Recent Posts"
              posts={posts.slice(0, 10)}
              isLoading={isLoading}
              hideIcon={true}
              userAvatar={user?.fields?.ProfileImage}
              userName={user?.fields?.DisplayName || user?.name || 'Anonymous'}
              emptyMessage={
                isOwnProfile ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold mb-2">Share your first video</div>
                    <div className="text-base text-gray-300">Start curating videos and they will show up here!</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold mb-2">No posts yet</div>
                  </div>
                )
              }
            />
            
            {/* Custom Profile Sections */}
            {firebaseUID && (
              <CustomProfileSection
                userId={firebaseUID}
                isOwnProfile={currentUser?.uid === firebaseUID}
                userAvatar={user?.fields?.ProfileImage}
                userName={user?.fields?.DisplayName || user?.name || 'Anonymous'}
              />
            )}
          </div>
        );
      }
      case 'posts': {
        const sortedPosts = getSortedPosts(posts);
        return posts.length > 0 ? (
          <>
            <div className="flex flex-row justify-between items-center mb-4 gap-4 mt-[-8px]">
              <div className="flex items-center h-10">
                {renderSortToggle()}
              </div>
              <div className="flex items-center h-10">
                {renderLayoutToggle()}
              </div>
            </div>
            {layout === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-3">
                {sortedPosts.map((post: any) => (
                  <div key={post.id} className="bg-black rounded-xl p-1 shadow w-full h-full flex flex-col">
                    <Link href={`/posts/${post.id}`} className="block overflow-hidden group h-full">
                      <div className="relative aspect-video rounded-lg overflow-hidden w-full">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedPosts.map((post: any) => (
                  <LazyPostCard key={post.id} post={post} hideFollowButton={true} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-4">No posts yet</div>
        );
      }
      case 'likes': {
        const sortedLikes = getSortedPosts(likedPosts);
        return likedPosts.length > 0 ? (
          <>
            <div className="flex flex-row justify-between items-center mb-4 gap-4 mt-[-8px]">
              <div className="flex items-center h-10">
                {renderSortToggle()}
              </div>
              <div className="flex items-center h-10">
                {renderLayoutToggle()}
              </div>
            </div>
            {layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-3">
                {sortedLikes.map((post: any) => (
              <div key={post.id} className="bg-black rounded-xl p-1 shadow w-full h-full flex flex-col">
                <Link href={`/posts/${post.id}`} className="block overflow-hidden group h-full">
                  <div className="relative aspect-video rounded-lg overflow-hidden w-full">
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
                  <div className="mt-2 flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      {post.fields.UserAvatar ? (
                        <Image
                          src={post.fields.UserAvatar}
                          alt={post.fields.UserName || post.fields.DisplayName || 'User'}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <DefaultAvatar userId={post.fields.FirebaseUID} userName={post.fields.UserName || post.fields.DisplayName || 'Anonymous'} />
                      )}
                    </div>
                    <div className="text-base text-gray-300 truncate">
                      <span className="font-semibold text-base">{post.fields.UserName || post.fields.DisplayName || 'Anonymous'}</span>
                      <span className="ml-1 text-base">shared:</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-base text-white line-clamp-2">
                    {post.fields.VideoTitle || 'Untitled Video'}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
            ) : (
              <div className="space-y-6">
                {sortedLikes.map((post: any) => (
                  <LazyPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-4">No liked posts yet</div>
        );
      }
      case 'followers':
        return followers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {followers.map((follower) => (
              <UserCard key={follower.id} user={follower} />
            ))}
          </div>
        ) : (
          <div className="text-center p-4">No followers yet</div>
        );
      case 'following':
        return following.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {following.map((followedUser) => (
              <UserCard key={followedUser.id} user={followedUser} />
            ))}
          </div>
        ) : (
          <div className="text-center p-4">Not following anyone yet</div>
        );
      default:
        return <div className="text-center p-4">Invalid tab</div>;
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-red-500">{error}</div>
        </div>
      ) : !user ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-white">User not found</div>
        </div>
      ) : (
        <>
          {/* Full-width Banner Image - Outside of content padding */}
          <div className="relative w-full h-48 md:h-64 bg-black">
            {/* Banner overlay for readability */}
            <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />
            {user?.fields?.BannerImage ? (
              <Image
                src={user.fields.BannerImage}
                alt="Profile Banner"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(120deg, #181818 0%, #2a0f0f 40%, #ff8178 70%, #000000 100%)',
                  backgroundSize: '200% 200%',
                  backgroundPosition: '100% 50%'
                }}
              />
            )}
          </div>

          {/* Content Container - With wider max width */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Profile Header - Overlapping Avatar Layout */}
            <div className="relative flex flex-row items-center px-0 pt-0 pb-1 -mt-16 md:-mt-20 z-20" style={{ minHeight: '60px' }}>
              {/* Avatar overlaps banner, left-aligned */}
              <div className="relative z-20">
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-black/70 bg-black/60 shadow-xl">
                  {user?.fields?.ProfileImage ? (
                    <Image
                      src={user.fields.ProfileImage}
                      alt={user?.fields?.DisplayName || 'User Profile'}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <DefaultAvatar userId={user?.fields?.FirebaseUID} userName={user?.fields?.DisplayName} />
                  )}
                </div>
              </div>
              {/* Info Center */}
              <div className="flex-1 flex flex-col justify-between min-w-0 ml-8 h-36 md:h-44">
                {/* Display name and social link row */}
                <div className="flex flex-row items-end justify-between gap-4 mb-0 mt-[0px]">
                  <span className="text-5xl md:text-6xl font-bold text-white truncate leading-[1.1] pb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {user?.fields?.DisplayName || user?.name || 'Anonymous'}
                  </span>
                  <div className="flex items-center gap-2 self-end">
                    {user?.fields?.SocialLink && (
                      <a
                        href={user.fields.SocialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors"
                        title="Social Link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 1 0 5.656l-3 3a4 4 0 0 1-5.656-5.656l1.5-1.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 0 1 0-5.656l3-3a4 4 0 0 1 5.656 5.656l-1.5 1.5" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                {/* Stats, bio, and follow button container */}
                <div className="flex flex-row items-center justify-between gap-8 mt-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-6 text-white/70 text-lg pt-2">
                      <span><b>{followers.length}</b> Followers</span>
                      <span><b>{posts.length}</b> Posts</span>
                    </div>
                    {user?.fields?.Bio && (
                      <div className="mt-1 italic text-white/80 text-xl max-w-2xl whitespace-pre-line">{user.fields.Bio}</div>
                    )}
                  </div>
                  {/* Follow Button Far Right in this row */}
                  <div className="flex flex-col items-end justify-center min-w-[120px] z-10 ml-8">
                    {currentUser && firebaseUID && currentUser.uid !== firebaseUID && (
                      <button
                        onClick={toggleFollow}
                        disabled={isFollowLoading}
                        className={`py-2 text-base font-medium min-w-[100px] inline-flex items-center justify-center ${
                          isFollowing
                            ? 'bg-red-950 text-red-100 hover:bg-red-900 pl-2 pr-4'
                            : 'bg-red-800 text-red-100 hover:bg-red-700 px-6'
                        } rounded-lg`}
                      >
                        {isFollowLoading ? (
                          '...'
                        ) : isFollowing ? (
                          <>
                            <CheckIcon className="w-5 h-5" />
                            <span className="ml-1.5">Following</span>
                          </>
                        ) : (
                          'Follow'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs - Updated Style */}
            <div className="border-b border-white/10 mt-8 flex items-center justify-between">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('home' as 'home')}
                  className={`py-4 px-1 relative ${
                    activeTab === 'home'
                      ? 'text-white border-b-2 border-red-600'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-medium">Home</span>
                </button>
                <button
                  onClick={() => setActiveTab('posts' as 'posts')}
                  className={`py-4 px-1 relative ${
                    activeTab === 'posts'
                      ? 'text-white border-b-2 border-red-600'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-medium">Posts</span>
                </button>
                <button
                  onClick={() => setActiveTab('likes' as 'likes')}
                  className={`py-4 px-1 relative ${
                    activeTab === 'likes'
                      ? 'text-white border-b-2 border-red-600'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-medium">Likes</span>
                </button>
                <button
                  onClick={() => setActiveTab('followers' as 'followers')}
                  className={`py-4 px-1 relative ${
                    activeTab === 'followers'
                      ? 'text-white border-b-2 border-red-600'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-medium">Followers</span>
                </button>
                <button
                  onClick={() => setActiveTab('following' as 'following')}
                  className={`py-4 px-1 relative ${
                    activeTab === 'following'
                      ? 'text-white border-b-2 border-red-600'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-medium">Following</span>
                </button>
              </div>
              {currentUser && firebaseUID && currentUser.uid === firebaseUID && (
                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-red-700 text-white rounded-lg shadow transition-all duration-200 font-semibold text-base ml-auto"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-base">Add Section</span>
                </button>
              )}
            </div>

            {/* Add Section Modal */}
            {showAddSectionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                <div className="bg-[#101418] rounded-xl p-8 shadow-2xl space-y-6 flex flex-col items-stretch w-full max-w-lg mx-auto">
                  {/* Header */}
                  <div className="text-xl font-bold text-white mb-2">Display your posts from a specific category or tag</div>
                  {/* Toggle for Category/Tag */}
                  <div className="flex gap-4 mb-4">
                    <button
                      className={`px-6 py-2 rounded-lg font-bold text-lg transition-all duration-200 shadow-sm ${selectedType === 'category' ? 'bg-red-600/20 text-red-500' : 'bg-white/10 text-white hover:bg-red-600/20 hover:text-red-500'}`}
                      onClick={() => { setSelectedType('category'); setSelectedValue(''); setSearch(''); }}
                    >
                      Category
                    </button>
                    <button
                      className={`px-6 py-2 rounded-lg font-bold text-lg transition-all duration-200 shadow-sm ${selectedType === 'tag' ? 'bg-red-600/20 text-red-500' : 'bg-white/10 text-white hover:bg-red-600/20 hover:text-red-500'}`}
                      onClick={() => { setSelectedType('tag'); setSelectedValue(''); setSearch(''); }}
                    >
                      Tag
                    </button>
                  </div>
                  {/* Searchable Dropdown */}
                  <div className="flex flex-col gap-3">
                    {selectedType === 'category' && (
                      <>
                        <div className="text-white/80 text-base font-semibold mb-1">Available Categories:</div>
                        <div className="flex flex-wrap gap-2">
                          {userCategories.length === 0 && (
                            <div className="text-red-500 text-base">No categories found. You need to post with a category first.</div>
                          )}
                          {userCategories.map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedValue(opt.id)}
                              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-150 ${selectedValue === opt.id ? 'bg-red-600 text-white' : 'bg-[#181c20] text-white hover:bg-red-700/60'}`}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {selectedType === 'tag' && (
                      <>
                        <div className="text-white/80 text-base font-semibold mb-1">Available Tags:</div>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            // Count tag usage
                            const tagCounts: { [id: string]: number } = {};
                            userPosts.forEach(post => {
                              if (post.fields.UserTags && Array.isArray(post.fields.UserTags)) {
                                post.fields.UserTags.forEach((tagId: string) => {
                                  tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
                                });
                              }
                            });
                            // Sort tags by usage
                            const sortedTags = [...userTags].sort((a, b) => (tagCounts[b.id] || 0) - (tagCounts[a.id] || 0)).slice(0, 10);
                            if (sortedTags.length === 0) {
                              return <div className="text-red-500 text-base">No tags found. You need to post with a tag first.</div>;
                            }
                            return sortedTags.map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedValue(opt.id)}
                                className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-150 ${selectedValue === opt.id ? 'bg-red-600 text-white' : 'bg-[#181c20] text-white hover:bg-red-700/60'}`}
                              >
                                #{opt.name}
                              </button>
                            ));
                          })() || null}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => { setShowAddSectionModal(false); setSearch(''); }}
                      className="px-6 py-2 text-lg font-bold text-white bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg shadow transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSection}
                      disabled={!selectedValue}
                      className="px-6 py-2 text-lg font-bold text-white bg-red-950 hover:bg-red-900 rounded-lg shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Section
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="py-8">
              {renderContent()}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 