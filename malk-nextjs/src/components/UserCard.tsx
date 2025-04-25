'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/lib/auth-context';

interface UserCardProps {
  user: {
    id: string;
    fields: {
      DisplayName?: string;
      ProfileImage?: string;
      Bio?: string;
      FirebaseUID?: string;
    };
  };
}

export default function UserCard({ user }: UserCardProps) {
  const { user: currentUser } = useAuth();
  const [firebaseUID, setFirebaseUID] = useState<string | null>(null);
  const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollow(firebaseUID);
  
  // Set the Firebase UID when the component mounts
  useState(() => {
    if (user.fields?.FirebaseUID) {
      setFirebaseUID(user.fields.FirebaseUID);
    }
  });

  const isOwnProfile = currentUser?.uid === user.fields?.FirebaseUID;
  
  return (
    <div className="card p-4 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center space-x-4">
        {/* Profile Image */}
        <div className="user-avatar w-16 h-16">
          {user.fields?.ProfileImage ? (
            <Image
              src={user.fields.ProfileImage}
              alt={user.fields?.DisplayName || 'User Profile'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.id}`} className="block">
            <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors truncate">
              {user.fields?.DisplayName || 'Anonymous'}
            </h3>
          </Link>
          
          {user.fields?.Bio && (
            <p className="text-white/60 text-sm line-clamp-2">{user.fields.Bio}</p>
          )}
        </div>
        
        {/* Follow Button */}
        {currentUser && !isOwnProfile && user.fields?.FirebaseUID && (
          <button
            onClick={toggleFollow}
            disabled={isFollowLoading}
            className={`follow-button ${
              isFollowing 
                ? 'follow-button-following' 
                : 'follow-button-not-following'
            }`}
          >
            {isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
} 