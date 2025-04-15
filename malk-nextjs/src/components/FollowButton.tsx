import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export default function FollowButton({ targetUserId, className = '' }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && targetUserId) {
      checkFollowStatus();
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch('/api/check-follow-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: user?.uid,
          followingId: targetUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check follow status');
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
      toast.error('Failed to check follow status');
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: user.uid,
          followingId: targetUserId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update follow status');
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);
      toast.success(data.isFollowing ? 'Successfully followed user' : 'Successfully unfollowed user');
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.uid === targetUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'default'}
      className={className}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
} 