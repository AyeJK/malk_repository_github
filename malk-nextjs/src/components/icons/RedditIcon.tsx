import Image from 'next/image';
import React from 'react';

interface RedditIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export default function RedditIcon({ className = '', alt = 'Reddit', width = 32, height = 32, ...props }: RedditIconProps) {
  return (
    <Image
      src={require('./reddit.png')}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
} 