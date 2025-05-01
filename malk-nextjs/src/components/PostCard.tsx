'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useSession } from 'next-auth/react';
import Comments from './Comments';
import Image from 'next/image';
import DefaultAvatar from './DefaultAvatar';
import { formatRelativeTime } from '@/lib/date-utils';
import { getVideoTitle } from '@/lib/video-utils';

interface PostCardProps {
  post: {
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
      DisplayDate?: string;
    };
  };
  onDelete?: (postId: string) => void;
  hideFollowButton?: boolean;
}

interface Tag {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
}

export default function PostCard({ post, onDelete, hideFollowButton = false }: PostCardProps) {
  const { user } = useAuth();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagNames, setTagNames] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [authorName, setAuthorName] = useState<string>('');
  const [loadingAuthor, setLoadingAuthor] = useState(false);
  const [authorError, setAuthorError] = useState(false);
  const [authorFirebaseUID, setAuthorFirebaseUID] = useState<string | null>(null);
  const [authorProfileImage, setAuthorProfileImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.fields.LikeCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(true);
  const [videoTitle, setVideoTitle] = useState<string>(post.fields.VideoTitle || 'Untitled Video');
  
  const isOwnPost = user?.uid === authorFirebaseUID;
  
  // Fetch author's Firebase UID and check follow status
  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!post.fields.FirebaseUID?.[0]) return;
      
      setLoadingAuthor(true);
      setAuthorError(false);
      
      try {
        const response = await fetch(`/api/get-user?ids=${post.fields.FirebaseUID[0]}`);
        if (!response.ok) {
          throw new Error('Failed to fetch author data');
        }
        
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setAuthorName(data.users[0].fields?.DisplayName || data.users[0].name || 'Anonymous');
          setAuthorFirebaseUID(data.users[0].fields?.FirebaseUID || null);
          setAuthorProfileImage(data.users[0].fields?.ProfileImage || null);
          
          // Check if current user is following the author
          if (user?.uid && data.users[0].fields?.FirebaseUID) {
            checkFollowStatus(user.uid, data.users[0].fields.FirebaseUID);
          }
        } else {
          console.log('No Firebase UID found in author data');
          setAuthorError(true);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        setAuthorError(true);
      } finally {
        setLoadingAuthor(false);
      }
    };
    
    fetchAuthorData();
  }, [post.fields.FirebaseUID, user?.uid]);
  
  // Function to check if current user is following the author
  const checkFollowStatus = async (currentUserId: string, authorId: string) => {
    if (!currentUserId || !authorId) return;
    
    setIsFollowLoading(true);
    try {
      console.log('Checking follow status for:', { currentUserId, authorId });
      
      const response = await fetch('/api/check-follow-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: currentUserId,
          followingId: authorId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check follow status');
      }

      const data = await response.json();
      console.log('Follow status response:', data);
      
      // Make sure we're setting the correct follow status
      setIsFollowing(data.isFollowing === true);
    } catch (error) {
      console.error('Error checking follow status:', error);
      // Default to not following if there's an error
      setIsFollowing(false);
    } finally {
      setIsFollowLoading(false);
    }
  };
  
  // Function to toggle follow status
  const handleToggleFollow = async () => {
    if (!user?.uid || !authorFirebaseUID) return;
    
    setIsFollowLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: user.uid,
          followingId: authorFirebaseUID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow status');
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };
  
  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(post.fields.VideoURL);
  
  // Format the date
  const formattedDate = post.fields.DisplayDate || post.fields.DateCreated
    ? formatRelativeTime(post.fields.DisplayDate || post.fields.DateCreated || '')
    : 'recently';

  // Split caption into title and description
  const userCaption = post.fields.UserCaption || '';
  const captionLines = userCaption.split('\n');
  const title = captionLines[0] || '';
  const description = captionLines.slice(1).join('\n');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!post.fields.Categories || post.fields.Categories.length === 0) return;
      
      setLoadingCategories(true);
      
      try {
        const response = await fetch(`/api/get-categories?ids=${post.fields.Categories.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          console.error('Failed to fetch categories:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [post.fields.Categories]);

  // Fetch tag names
  useEffect(() => {
    const fetchTagNames = async () => {
      if (!post.fields.UserTags || post.fields.UserTags.length === 0) return;
      
      setLoadingTags(true);
      setTagError(false);
      
      try {
        const response = await fetch(`/api/get-tags?ids=${post.fields.UserTags.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags || []);
        } else {
          console.error('Failed to fetch tags:', await response.text());
          setTagError(true);
        }
      } catch (error) {
        console.error('Error fetching tag names:', error);
        setTagError(true);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTagNames();
  }, [post.fields.UserTags]);

  // Check if the current user has liked the post
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user || !post.fields.UserLikes) {
        setIsLiked(false);
        return;
      }

      try {
        // Get the Airtable record ID for the current user
        const response = await fetch(`/api/get-user?ids=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          if (data.users && data.users.length > 0) {
            const userRecordId = data.users[0].id;
            // Check if the user's Airtable record ID is in the UserLikes array
            setIsLiked(post.fields.UserLikes.includes(userRecordId));
          } else {
            setIsLiked(false);
          }
        } else {
          console.error('Failed to fetch user data:', await response.text());
          setIsLiked(false);
        }
      } catch (error) {
        console.error('Error checking if post is liked:', error);
        setIsLiked(false);
      }
    };

    checkIfLiked();
  }, [user, post.fields.UserLikes]);

  // Handle like button click
  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like posts');
      return;
    }

    setIsLiking(true);
    try {
      console.log('Liking post with ID:', post.id);
      console.log('Post data:', post);
      
      const response = await fetch('/api/toggle-like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to toggle like');
      }

      setIsLiked(data.hasLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(error instanceof Error ? error.message : 'Failed to update like status. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  // Format tag ID for display (show first 8 characters)
  const formatTagId = (id: string) => {
    return id.substring(0, 8) + '...';
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    onDelete(post.id);
  };

  // Fetch video title if not available
  useEffect(() => {
    const fetchVideoTitle = async () => {
      if (!post.fields.VideoTitle && post.fields.VideoURL) {
        try {
          const title = await getVideoTitle(post.fields.VideoURL);
          if (title) {
            setVideoTitle(title);
          }
        } catch (error) {
          console.error('Error fetching video title:', error);
        }
      }
    };

    fetchVideoTitle();
  }, [post.fields.VideoTitle, post.fields.VideoURL]);

  return (
    <div className="bg-dark-lighter rounded-lg overflow-hidden shadow-lg mb-6">
      <div className="p-4">
        {/* User info section with avatar, name, and follow button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* User avatar */}
            <Link href={`/profile/${post.fields.FirebaseUID?.[0]}`} className="block">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {authorProfileImage ? (
                  <Image
                    src={authorProfileImage}
                    alt={authorName || 'User Profile'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <DefaultAvatar userId={authorFirebaseUID || undefined} userName={authorName} />
                )}
              </div>
            </Link>
            
            {/* User name and video title */}
            <div>
              <div className="text-gray-400 text-sm">
                {loadingAuthor ? (
                  <span>Loading author...</span>
                ) : authorError ? (
                  <span>Anonymous shared</span>
                ) : (
                  <span>
                    <Link href={`/profile/${post.fields.FirebaseUID?.[0]}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                      {authorName}
                    </Link> shared
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white relative z-20">
                <Link href={`/posts/${post.id}`} prefetch={true} className="hover:text-blue-400 transition-colors block">
                  {videoTitle}
                </Link>
              </h3>
            </div>
          </div>
           
          {/* Follow button - simplified to just UI without functionality */}
          {!hideFollowButton && !isOwnPost && (
            <button
              onClick={handleToggleFollow}
              disabled={isFollowLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isFollowing
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* User caption */}
        {post.fields.UserCaption && (
          <p className="text-gray-300 mb-3">{post.fields.UserCaption}</p>
        )}

        {/* Tags */}
        {post.fields.UserTags && post.fields.UserTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {loadingTags ? (
              <div className="h-6 w-20 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              post.fields.UserTags.map((tagId) => {
                const tag = tags.find(t => t.id === tagId);
                return tag ? (
                  <Link
                    key={tagId}
                    href={`/tags/${tag.name.toLowerCase()}`}
                    className="px-2 py-1 bg-purple-900 text-purple-200 text-xs rounded-full hover:bg-purple-800 transition-colors"
                  >
                    {tag.name || tagId.substring(0, 8)}
                  </Link>
                ) : null;
              })
            )}
          </div>
        )}
       
        {/* Embedded video */}
        <div className="relative aspect-video">
          <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10">
            <span className="sr-only">View post details</span>
          </Link>
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute top-0 left-0 w-full h-full z-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 text-white">
              Invalid video URL
            </div>
          )}
        </div>

        {/* Action buttons (like and comment) */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-blue-500' : 'text-gray-400'
              } hover:text-blue-400`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{post.fields.CommentCount || 0}</span>
            </button>
          </div>
          {isOwnPost && onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-400"
            >
              Delete
            </button>
          )}
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4">
            <Comments 
              postId={post.id} 
              postAuthorId={post.fields.FirebaseUID?.[0] || ''} 
            />
          </div>
        )}
      </div>
    </div>
  );
} 