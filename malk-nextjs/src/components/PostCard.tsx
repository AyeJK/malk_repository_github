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
import { CheckIcon, ShareIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import SharePostModal from './SharePostModal';
import EditPostModal from './EditPostModal';
import DeletePostModal from './DeletePostModal';

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
      ThumbnailURL?: string;
    };
  };
  onDelete?: (postId: string) => void;
  hideFollowButton?: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const isOwnPost = user?.uid === authorFirebaseUID;
  
  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/posts/${post.id}` : '';
  
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

  // Edit handler
  const handleEdit = async (updatedFields: { UserCaption: string; UserTags?: string[]; Categories?: string[] }) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update post');
      setShowEditModal(false);
      // Optionally, refresh or update local state
      window.location.reload();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update post');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete post');
      setShowDeleteModal(false);
      if (onDelete) onDelete(post.id);
      else window.location.reload();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete post');
    } finally {
      setActionLoading(false);
    }
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
    <div className="mb-6">
      <div className="py-4">
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
            <div className="min-w-0 pr-4">
              <div className="text-gray-400 text-sm">
                {loadingAuthor ? (
                  <span>Loading author...</span>
                ) : authorError ? (
                  <span>Anonymous shared</span>
                ) : (
                  <span>
                    <Link href={`/profile/${post.fields.FirebaseUID?.[0]}`} className="text-red-400 hover:text-red-300 hover:underline">
                      {authorName}
                    </Link> shared
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white relative z-20">
                <Link href={`/posts/${post.id}`} prefetch={true} className="hover:text-red-400 transition-colors block">
                  {videoTitle}
                </Link>
              </h3>
            </div>
          </div>
          {/* Show follow button for non-owned posts */}
          {!hideFollowButton && !isOwnPost && (
            <button
              onClick={handleToggleFollow}
              disabled={isFollowLoading}
              className={`py-1.5 text-sm font-medium min-w-[100px] inline-flex items-center justify-center ${
                isFollowing
                  ? 'bg-red-950 text-red-100 hover:bg-red-900 pl-2 pr-4'
                  : 'bg-red-800 text-red-100 hover:bg-red-700 px-6'
              } rounded-lg`}
            >
              {isFollowLoading ? (
                '...'
              ) : isFollowing ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span className="ml-1.5">Following</span>
                </>
              ) : (
                'Follow'
              )}
            </button>
          )}
          {/* Actions menu for post owner */}
          {isOwnPost && (
            <div className="relative ml-2">
              <button
                className="pl-2 rounded-full focus:outline-none"
                onClick={() => setShowActions((v) => !v)}
                aria-label="Post actions"
              >
                <EllipsisVerticalIcon className="w-6 h-6 text-gray-400 hover:text-[#fa7268] transition-colors" />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[#181c20] ring-1 ring-black ring-opacity-5 z-50">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                    onClick={() => { setShowEditModal(true); setShowActions(false); }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                    onClick={() => { setShowDeleteModal(true); setShowActions(false); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
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
              post.fields.UserTags.map((tagId, index) => {
                const tag = tags.find(t => t.id === tagId);
                const gradientClasses = [
                  'bg-red-950/50 text-red-400 hover:bg-red-900/50',
                  'bg-orange-950/50 text-orange-400 hover:bg-orange-900/50',
                  'bg-amber-950/50 text-amber-400 hover:bg-amber-900/50',
                  'bg-rose-950/50 text-rose-400 hover:bg-rose-900/50',
                  'bg-pink-950/50 text-pink-400 hover:bg-pink-900/50'
                ];
                return tag ? (
                  <Link
                    key={tagId}
                    href={`/tags/${tag.slug}`}
                    className={`px-3 py-1.5 ${gradientClasses[index % 5]} text-sm rounded-lg transition-colors`}
                  >
                    #{tag.name || tagId.substring(0, 8)}
                  </Link>
                ) : null;
              })
            )}
          </div>
        )}
       
        {/* Embedded video */}
        <div className="relative aspect-video rounded-xl overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute top-0 left-0 w-full h-full z-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 text-white rounded-xl">
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
                isLiked ? 'text-red-500' : 'text-gray-400'
              } hover:text-red-400`}
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
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400"
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
          <button
            className="share-button ml-auto"
            onClick={() => setIsShareOpen(true)}
            aria-label="Share"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
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
      <SharePostModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        postUrl={postUrl}
        postTitle={videoTitle}
        thumbnailUrl={post.fields.ThumbnailURL}
        videoTitle={videoTitle}
        authorName={authorName}
        authorAvatarUrl={authorProfileImage || undefined}
        caption={post.fields.UserCaption}
      />
      {/* Modals */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
        onSave={handleEdit}
        authorName={authorName}
        authorAvatarUrl={authorProfileImage || undefined}
      />
      <DeletePostModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        post={post}
      />
      {actionError && <div className="text-red-400 mt-2">{actionError}</div>}
    </div>
  );
} 