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
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'followers' | 'following'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const userFirebaseUID = userRecord.fields?.FirebaseUID;
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
          
          // Fetch full post data for liked posts
          console.log('LikedPosts field:', userRecord.fields?.LikedPosts);
          
          // Check if LikedPosts exists and is not empty
          if (userRecord.fields?.LikedPosts && 
              (Array.isArray(userRecord.fields.LikedPosts) ? userRecord.fields.LikedPosts.length > 0 : true)) {
            
            // Get the liked post record IDs
            const likedPostRecordIds = userRecord.fields.LikedPosts;
            console.log('Liked post record IDs:', likedPostRecordIds);
            
            // Fetch the full post data for each record ID
            try {
              // Use the Airtable record IDs directly to fetch the posts
              const likedPostsResponse = await fetch(`/api/get-posts-by-record-ids?recordIds=${Array.isArray(likedPostRecordIds) ? likedPostRecordIds.join(',') : likedPostRecordIds}`);
              console.log('Liked posts API response status:', likedPostsResponse.status);
              
              if (likedPostsResponse.ok) {
                const likedPostsData = await likedPostsResponse.json();
                console.log('Liked posts data:', likedPostsData);
                setLikedPosts(likedPostsData.posts || []);
              } else {
                const errorText = await likedPostsResponse.text();
                console.error('Failed to fetch liked posts data:', errorText);
                setLikedPosts([]);
              }
            } catch (error) {
              console.error('Error fetching liked posts:', error);
              setLikedPosts([]);
            }
          } else {
            console.log('No liked posts found in user record');
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

    console.log('Rendering content for tab:', activeTab);

    switch (activeTab) {
      case 'posts':
        return posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} hideFollowButton={true} />
            ))}
          </div>
        ) : (
          <div className="text-center p-4">No posts yet</div>
        );
      case 'likes':
        return likedPosts.length > 0 ? (
          <div className="space-y-4">
            {likedPosts.map((post) => (
              <PostCard key={post.id} post={post} hideFollowButton={true} />
            ))}
          </div>
        ) : (
          <div className="text-center p-4">No liked posts yet</div>
        );
      case 'followers':
        return followers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followers.map((follower) => (
              <UserCard key={follower.id} user={follower} />
            ))}
          </div>
        ) : (
          <div className="text-center p-4">No followers yet</div>
        );
      case 'following':
        return following.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          {/* Full-width Banner Image */}
          <div className="relative w-screen h-48 md:h-64 overflow-hidden" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
            {user.fields?.BannerImage ? (
              <Image
                src={user.fields.BannerImage}
                alt="Profile Banner"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-dark to-accent"></div>
            )}
          </div>
          
          {/* Content Container */}
          <div className="max-w-4xl mx-auto px-4">
            {/* Profile Header */}
            <div className="bg-dark-lighter rounded-b-lg p-6 relative -mt-16 md:-mt-20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Profile Image */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-dark-lighter -mt-16 md:-mt-20">
                  {user.fields?.ProfileImage ? (
                    <Image
                      src={user.fields.ProfileImage}
                      alt={user.fields?.DisplayName || 'User Profile'}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {user.fields?.DisplayName || user.name || 'Anonymous'}
                    </h1>
                    {/* Follow button */}
                    {currentUser && firebaseUID && currentUser.uid !== firebaseUID && (
                      <button
                        onClick={toggleFollow}
                        disabled={isFollowLoading}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                          isFollowing 
                            ? 'bg-gray-600 text-white hover:bg-gray-700' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  
                  {/* Bio */}
                  {user.fields?.Bio && (
                    <p className="text-gray-300 mb-4">{user.fields.Bio}</p>
                  )}
                  
                  {/* Social Link */}
                  {user.fields?.SocialLink && (
                    <a 
                      href={user.fields.SocialLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-light inline-flex items-center gap-1 mb-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      {user.fields.SocialLink.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-dark-lighter rounded-lg mt-6 overflow-hidden">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('likes')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'likes'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Likes
                </button>
                <button
                  onClick={() => setActiveTab('followers')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'followers'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Followers
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'following'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Following
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-4">
                {renderContent()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 