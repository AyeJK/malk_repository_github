'use client';

import React from 'react';
import { UserIcon } from '@heroicons/react/24/solid';

interface DefaultAvatarProps {
  userId?: string;
  userName?: string;
}

export default function DefaultAvatar({ userId, userName }: DefaultAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!userName) {
    return (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
        <UserIcon className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
      <span className="text-xs font-medium text-gray-300">
        {getInitials(userName)}
      </span>
    </div>
  );
} 