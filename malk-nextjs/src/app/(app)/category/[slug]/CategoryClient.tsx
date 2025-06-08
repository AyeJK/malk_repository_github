'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import LazyPostCard from '@/components/LazyPostCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const PAGE_SIZE = 10;

export default function CategoryClient() {
  const params = useParams();
  const categorySlug = params.slug as string;
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState<{ name: string; postCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch posts (initial and paginated)
  const fetchPosts = useCallback(async (offset?: string) => {
    try {
      if (offset) setIsFetchingMore(true);
      else setLoading(true);
      const res = await fetch(`/api/get-posts-by-category?slug=${encodeURIComponent(categorySlug)}&limit=${PAGE_SIZE}${offset ? `&offset=${offset}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch category posts');
      const data = await res.json();
      setPosts(prev => offset ? [...prev, ...data.posts] : data.posts);
      setCategory(data.category || null);
      setNextOffset(data.nextOffset);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [categorySlug]);

  // Initial load
  useEffect(() => {
    if (categorySlug) fetchPosts();
  }, [fetchPosts, categorySlug]);

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

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-white/70 text-center">
          Category not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {category.name}
        </h1>
        <p className="text-white/70">
          {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
        </p>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-white/70">No posts in this category yet.</p>
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