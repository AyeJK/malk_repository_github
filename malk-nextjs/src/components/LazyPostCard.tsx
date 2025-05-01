'use client';

import { useEffect, useRef, useState } from 'react';
import PostCard from './PostCard';

interface LazyPostCardProps {
  post: {
    id: string;
    fields: {
      VideoURL: string;
      UserCaption: string;
      Categories?: string[];
      UserTags?: string[];
      FirebaseUID?: string[];
      DateCreated?: string;
      VideoTitle?: string;
      UserLikes?: string[];
      LikeCount?: number;
      CommentCount?: number;
      DisplayDate?: string;
    };
  };
  onDelete?: (postId: string) => void;
  hideFollowButton?: boolean;
}

export default function LazyPostCard({ post, onDelete, hideFollowButton = false }: LazyPostCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // Once the card has been visible, we can disconnect the observer
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading when within 100px of viewport
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef}>
      {(isVisible || hasBeenVisible) ? (
        <PostCard post={post} onDelete={onDelete} hideFollowButton={hideFollowButton} />
      ) : (
        <div className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div>
                  <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
                  <div className="h-6 w-48 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
            <div className="aspect-video bg-gray-700 rounded-xl mb-4" />
            <div className="h-4 w-32 bg-gray-700 rounded" />
          </div>
        </div>
      )}
    </div>
  );
} 