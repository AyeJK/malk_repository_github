'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import LazyPostCard from '@/components/LazyPostCard';
import ShareVideoModal from '@/components/ShareVideoModal';
import { useAuth } from '@/lib/auth-context';

const PAGE_SIZE = 10;

export default function PostsClient() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { user } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch posts (initial and paginated)
  const fetchPosts = useCallback(async (offset?: string) => {
    try {
      if (offset) setIsFetchingMore(true);
      else setLoading(true);

      const res = await fetch(`/api/get-posts?limit=${PAGE_SIZE}${offset ? `&offset=${offset}` : ''}`);
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();

      setPosts(prev => offset ? [...prev, ...data.posts] : data.posts);
      setNextOffset(data.nextOffset);
      setError(null);
    } catch (err: any) {
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-xl text-white">Loading posts...</div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh]">
        <div className="text-xl text-white mb-6">No posts found.</div>
        {user && (
          <button onClick={openShareModal} className="btn-primary">
            Share a Video
          </button>
        )}
        <ShareVideoModal isOpen={isShareModalOpen} onClose={closeShareModal} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Latest Posts</h1>
      </div>
      <div className="space-y-6">
        {posts.map((post) => (
          <LazyPostCard key={post.id} post={post} />
        ))}
      </div>
      {nextOffset && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <div className="text-white">{isFetchingMore ? 'Loading more...' : 'Scroll to load more'}</div>
        </div>
      )}
      <ShareVideoModal isOpen={isShareModalOpen} onClose={closeShareModal} />
    </div>
  );
} 