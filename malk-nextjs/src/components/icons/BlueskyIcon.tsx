import Image from 'next/image';
import React from 'react';
import bluesky from './bluesky_icon.png';

interface BlueskyIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export default function BlueskyIcon({ className = '', alt = 'Bluesky', width = 32, height = 32, ...props }: BlueskyIconProps) {
  return (
    <Image
      src={bluesky}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
} 