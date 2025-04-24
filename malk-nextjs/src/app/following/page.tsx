'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/auth-context';

export default function FollowingPage() {
  const router = useRouter();
  const { user, airtableUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchFollowingPosts = async () => {
      try {
        setLoading(true);
        // First get the list of users we're following
        const followingResponse = await fetch(`/api/get-following?userId=${user.uid}`);
        if (!followingResponse.ok) throw new Error('Failed to fetch following users');
        
        const followingData = await followingResponse.json();
        const following = followingData.following || [];
        
        if (following.length === 0) {
          setPosts([]);
          return;
        }

        // Get posts from all followed users
        const followedUserIds = following.map((f: any) => f.fields.FirebaseUID).filter(Boolean);
        
        if (followedUserIds.length === 0) {
          setPosts([]);
          return;
        }

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

        setPosts(flattenedPosts);
      } catch (err) {
        console.error('Error fetching following posts:', err);
        setError('Failed to load posts from followed users');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingPosts();
  }, [user, router]);

  if (!user) {
    return null; // Router will handle redirect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-red-500 p-4 rounded-lg bg-red-500/10">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Following Feed</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-white/70 mb-4">No posts from followed users yet.</p>
          <p className="text-white/50">
            Follow more users to see their posts here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
} 