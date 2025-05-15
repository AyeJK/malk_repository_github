import { headers } from 'next/headers';
import { getPostMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const host = headers().get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const url = `${protocol}://${host}/api/get-post?id=${params.id}`;
  console.log('[generateMetadata] Fetching post for metadata:', url);
  const res = await fetch(url, { cache: 'no-store' });
  console.log('[generateMetadata] Fetch status:', res.status);
  if (!res.ok) {
    console.log('[generateMetadata] Fetch failed, returning fallback title.');
    return { title: 'Post – Malk' };
  }
  const data = await res.json();
  console.log('[generateMetadata] Post data:', data);
  const post = data.post;
  if (!post) {
    console.log('[generateMetadata] No post found, returning fallback title.');
    return { title: 'Post – Malk' };
  }
  return getPostMetadata(post);
} 