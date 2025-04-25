'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/lib/auth-context';
import DefaultAvatar from './DefaultAvatar';

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
        <Link href={`/profile/${user.id}`} className="block">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            {user.fields?.ProfileImage ? (
              <Image
                src={user.fields.ProfileImage}
                alt={user.fields?.DisplayName || 'User Profile'}
                fill
                className="object-cover"
              />
            ) : (
              <DefaultAvatar userId={user.fields?.FirebaseUID} userName={user.fields?.DisplayName} />
            )}
          </div>
        </Link>
        
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