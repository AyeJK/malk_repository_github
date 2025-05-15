import { getPostMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/get-post?id=${params.id}`);
  if (!res.ok) return { title: 'Post – Malk' };
  const data = await res.json();
  const post = data.post;
  if (!post) return { title: 'Post – Malk' };
  return getPostMetadata(post);
} 