import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatRelativeTime } from '@/lib/date-utils';

interface Comment {
  id: string;
  post_id: string;
  post_author_id: string;
  commenter_id: string;
  commentor_display_name?: string;
  content: string;
  created_at: string;
  updated_at: string;
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
    <div className="mt-4 space-y-4">
      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
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
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {comment.commentor_display_name 
                          ? (Array.isArray(comment.commentor_display_name) 
                              ? comment.commentor_display_name[0] 
                              : comment.commentor_display_name).charAt(0).toUpperCase() 
                          : 'A'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 flex items-center">
                        <span className="font-medium">
                          {Array.isArray(comment.commentor_display_name) 
                            ? comment.commentor_display_name[0] 
                            : comment.commentor_display_name || 'Anonymous'}
                        </span> <span className="text-gray-600 ml-1 mr-1">commented:</span> {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 ml-2 flex items-center">
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 