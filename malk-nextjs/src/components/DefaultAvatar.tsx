'use client';

import React from 'react';

interface DefaultAvatarProps {
  className?: string;
  userId?: string;
  userName?: string;
}

// Predefined gradient combinations that look good
const colorVariations = [
  'from-blue-600/80 via-blue-800/90 to-indigo-900/80',
  'from-purple-600/80 via-purple-800/90 to-indigo-900/80',
  'from-red-600/80 via-red-800/90 to-rose-900/80',
  'from-emerald-600/80 via-emerald-800/90 to-teal-900/80',
  'from-amber-600/80 via-amber-800/90 to-orange-900/80',
  'from-pink-600/80 via-pink-800/90 to-rose-900/80',
  'from-cyan-600/80 via-cyan-800/90 to-blue-900/80',
  'from-violet-600/80 via-violet-800/90 to-purple-900/80'
];

function getColorVariation(userId?: string, userName?: string): string {
  // Use userId if available, otherwise fall back to userName, or use a default index
  const identifier = userId || userName || '';
  
  // Create a simple hash of the identifier
  const hash = identifier.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash to select a color variation
  const index = Math.abs(hash) % colorVariations.length;
  return colorVariations[index];
}

export default function DefaultAvatar({ className = "h-full w-full", userId, userName }: DefaultAvatarProps) {
  const gradientClasses = getColorVariation(userId, userName);
  
  return (
    <div className={`bg-gradient-to-br ${gradientClasses} flex items-center justify-center rounded-full ring-1 ring-white/10 ${className}`}>
      <div className="w-3/5 h-3/5 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2Z" />
          <path d="M19 21C19 17.134 15.866 14 12 14C8.13401 14 5 17.134 5 21" />
        </svg>
      </div>
    </div>
  );
} 