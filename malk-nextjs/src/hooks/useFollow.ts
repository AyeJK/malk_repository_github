import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export const useFollow = (targetUserId: string | null) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user?.uid || !targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/check-follow-status', {
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
          throw new Error('Failed to check follow status');
        }

        const data = await response.json();
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowStatus();
  }, [user?.uid, targetUserId]);

  const toggleFollow = async () => {
    if (!user?.uid || !targetUserId) {
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
        throw new Error('Failed to toggle follow status');
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    isLoading,
    toggleFollow,
  };
}; 