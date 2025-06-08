"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TagClient() {
  const params = useParams();
  const tagSlug = params.slug as string;
  const [posts, setPosts] = useState<any[]>([]);
  const [tag, setTag] = useState<{ name: string; postCount: number } | null>(null);
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
      const tagName = decodeURIComponent(tagSlug);
      const res = await fetch(`/api/get-posts-by-tag?tag=${encodeURIComponent(tagName)}&limit=10${offset ? `&offset=${offset}` : ''}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Tag not found');
        } else {
          throw new Error('Failed to fetch tag posts');
        }
        return;
      }
      const data = await res.json();
      setPosts(prev => offset ? [...prev, ...data.posts] : data.posts);
      setNextOffset(data.nextOffset);
      setTag(data.tag || null);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [tagSlug]);

  // Initial load
  useEffect(() => {
    if (tagSlug) fetchPosts();
  }, [tagSlug, fetchPosts]);

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

  if (!tag) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-white/70 text-center">
          Tag not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          #{tag.name}
        </h1>
        <p className="text-white/70">
          {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}
        </p>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-white/70">No posts with this tag yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {nextOffset && (
            <div ref={loaderRef} className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 