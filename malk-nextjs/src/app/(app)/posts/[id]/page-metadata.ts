import { getPostMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const url = `${base}/api/get-post?id=${params.id}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { title: 'Post – Malk' };
  const data = await res.json();
  const post = data.post;
  if (!post) return { title: 'Post – Malk' };
  return getPostMetadata(post);
} 