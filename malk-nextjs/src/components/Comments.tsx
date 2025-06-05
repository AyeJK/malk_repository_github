import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime } from '@/lib/date-utils';
import Link from 'next/link';
import Image from 'next/image';

interface Comment {
  id: string;
  post_id: string;
  post_author_id: string;
  commenter_id: string;
  commentor_display_name?: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile_image?: string;
}

interface CommentsProps {
  postId: string;
  postAuthorId: string;
}

export default function Comments({ postId, postAuthorId }: CommentsProps) {
  const { user, airtableUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when component mounts
  useEffect(() => {
    console.log('Comments component mounted with postId:', postId);
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for postId:', postId);
      const response = await fetch(`/api/comments?postId=${postId}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Comments fetched successfully:', data.comments);
        setComments(data.comments);
      } else {
        console.error('Error fetching comments:', data.error);
        setError(data.error || 'Failed to fetch comments');
      }
    } catch (err) {
      console.error('Exception fetching comments:', err);
      setError('Failed to fetch comments');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !airtableUser || !newComment.trim()) {
      console.log('Cannot submit comment: missing user, airtableUser, or comment content');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting comment with data:', {
        postId,
        commenterId: user.uid,
        content: newComment.trim()
      });
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          commenterId: user.uid,
          content: newComment.trim(),
        }),
      });

      const data = await response.json();
      console.log('Comment submission response:', data);

      if (response.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        console.error('Error posting comment:', data.error);
        setError(data.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Exception posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-1 space-y-1">
      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-neutral-800 mr-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {airtableUser?.fields?.ProfileImage ? (
                <Image
                  src={Array.isArray(airtableUser.fields.ProfileImage) ? airtableUser.fields.ProfileImage[0] : airtableUser.fields.ProfileImage}
                  alt={airtableUser.fields.DisplayName || 'Your avatar'}
                  width={32}
                  height={32}
                  className="object-cover w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-xs font-medium text-gray-200">
                  {airtableUser?.fields?.DisplayName
                    ? String(airtableUser.fields.DisplayName).charAt(0).toUpperCase()
                    : 'Y'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-900 text-white border-neutral-700 placeholder-gray-400"
                  rows={3}
                  maxLength={445}
                />
                {newComment.trim().length > 0 && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute bottom-2 right-2 mb-2 px-4 py-1.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8178] disabled:opacity-50 transition"
                    style={{ backgroundColor: '#ff8178' }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e76a5e')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#ff8178')}
                  >
                    {isLoading ? 'Posting...' : 'Post'}
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">{newComment.length} / 445</div>
            </div>
          </div>
        </form>
      )}

      {/* Error message */}
      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="py-2 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 mr-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {comment.profile_image ? (
                        <Image
                          src={comment.profile_image}
                          alt={Array.isArray(comment.commentor_display_name) ? comment.commentor_display_name[0] : comment.commentor_display_name || 'User'}
                          width={32}
                          height={32}
                          className="object-cover w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-200">
                          {comment.commentor_display_name 
                            ? (Array.isArray(comment.commentor_display_name) 
                                ? comment.commentor_display_name[0] 
                                : comment.commentor_display_name).charAt(0).toUpperCase() 
                            : 'A'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-sm text-gray-100 flex items-center">
                        <Link href={`/profile/${comment.commenter_id}`} className="font-medium text-[#ff8178] hover:underline">
                          {Array.isArray(comment.commentor_display_name) 
                            ? comment.commentor_display_name[0] 
                            : comment.commentor_display_name || 'Anonymous'}
                        </Link>
                        <span className="text-gray-400 ml-1">commented:</span>
                      </span>
                      <span className="text-gray-200 text-base mt-0.5">{comment.content}</span>
                      <span className="text-xs text-gray-500 mt-1">{formatRelativeTime(comment.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 