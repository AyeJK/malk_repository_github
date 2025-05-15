"use client";

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchTagPosts = async () => {
      try {
        setLoading(true);
        const tagName = decodeURIComponent(tagSlug);
        const response = await fetch(`/api/get-posts-by-tag?tag=${encodeURIComponent(tagName)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tag not found');
          } else {
            throw new Error('Failed to fetch tag posts');
          }
          return;
        }
        const data = await response.json();
        setPosts(data.posts || []);
        setTag(data.tag || null);
      } catch (err) {
        console.error('Error fetching tag posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    if (tagSlug) {
      fetchTagPosts();
    }
  }, [tagSlug]);

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
        </div>
      )}
    </div>
  );
} 