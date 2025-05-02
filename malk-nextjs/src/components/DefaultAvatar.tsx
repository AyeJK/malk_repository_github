'use client';

import React from 'react';
import { UserIcon } from '@heroicons/react/24/solid';

interface DefaultAvatarProps {
  userId?: string;
  userName?: string;
}

export default function DefaultAvatar({ userId, userName }: DefaultAvatarProps) {
  return (
    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
      <UserIcon className="w-2/3 h-2/3 text-gray-400" />
    </div>
  );
} 