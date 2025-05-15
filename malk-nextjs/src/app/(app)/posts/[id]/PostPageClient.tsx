'use client';

import PostDetail from '@/components/PostDetail';
import { getPost } from '@/lib/airtable';
import { useEffect, useState } from 'react';

interface PostPageClientProps {
  params: {
    id: string;
  };
}

export default function PostPageClient({ params }: PostPageClientProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const fetchedPost = await getPost(params.id);
        if (!fetchedPost) {
          setError('Post not found');
        } else {
          setPost(fetchedPost);
        }
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Post not found</h1>
          <p className="mt-4 text-gray-300">The post you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PostDetail post={post} hideFollowButton={false} />
    </div>
  );
} 