'use client';

import { useState } from 'react';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/airtable';
import { LatestPost } from '@/components/LatestPost';
import ShareVideoModal from '@/components/ShareVideoModal';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Malk</h1>
        <p className="text-xl text-center mb-12">Share and discover amazing videos with the Malk community.</p>
        
        <div className="flex justify-center mb-12">
          {user ? (
            <button 
              onClick={openShareModal}
              className="btn-primary text-lg px-8 py-3"
            >
              Share a Video
            </button>
          ) : (
            <Link 
              href="/login"
              className="btn-primary text-lg px-8 py-3"
            >
              Sign In to Share
            </Link>
          )}
        </div>
        
        <LatestPost />
      </div>

      <ShareVideoModal 
        isOpen={isShareModalOpen} 
        onClose={closeShareModal} 
      />
    </main>
  );
} 