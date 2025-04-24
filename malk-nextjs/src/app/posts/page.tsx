'use client';

import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/airtable';
import ShareVideoModal from '@/components/ShareVideoModal';
import { useAuth } from '@/lib/auth-context';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-xl text-white">Loading posts...</div>
      </div>
    );
  }

  if (error) {
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
          <button 
            onClick={openShareModal}
            className="btn-primary"
          >
            Share a Video
          </button>
        )}
        <ShareVideoModal 
          isOpen={isShareModalOpen} 
          onClose={closeShareModal} 
        />
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
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      <ShareVideoModal 
        isOpen={isShareModalOpen} 
        onClose={closeShareModal} 
      />
    </div>
  );
} 