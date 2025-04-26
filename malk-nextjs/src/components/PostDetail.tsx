import React from 'react';
import { PostRecord } from '@/lib/airtable';
import PostCard from '@/components/PostCard';

interface PostDetailProps {
  post: PostRecord;
}

export default function PostDetail({ post }: PostDetailProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <PostCard post={post} hideFollowButton={false} />
    </div>
  );
} 