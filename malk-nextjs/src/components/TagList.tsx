import React from 'react';
import Link from 'next/link';

interface TagListProps {
  tags: { name: string; slug: string }[];
}

export default function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tags/${tag.slug}`}
          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
} 