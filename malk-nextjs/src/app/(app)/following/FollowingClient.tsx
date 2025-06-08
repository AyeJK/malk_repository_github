'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LazyPostCard from '@/components/LazyPostCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/auth-context';

const PAGE_SIZE = 10;

export default function FollowingClient() {
  const router = useRouter();
  const { user, airtableUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch posts (initial and paginated)
  const fetchPosts = useCallback(async (offset?: string) => {
    if (!user) return;
    try {
      if (offset) setIsFetchingMore(true);
      else setLoading(true);
      const res = await fetch(`/api/following-feed?userId=${user.uid}&limit=${PAGE_SIZE}${offset ? `&offset=${offset}` : ''}`);
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setPosts(prev => offset ? [...prev, ...data.posts] : data.posts);
      setNextOffset(data.nextOffset);
      setError(null);
    } catch (err: any) {
      setError('Failed to load posts from followed users');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) fetchPosts();
  }, [fetchPosts, user]);

  // Infinite scroll
  useEffect(() => {
    if (!nextOffset) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingMore) {
          fetchPosts(nextOffset);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [nextOffset, isFetchingMore, fetchPosts]);

  if (!user) {
    return null; // Router will handle redirect
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && posts.length === 0) {
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
            <LazyPostCard key={post.id} post={post} />
          ))}
          {nextOffset && (
            <div ref={loaderRef} className="flex justify-center py-8">
              <div className="text-white">{isFetchingMore ? 'Loading more...' : 'Scroll to load more'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 