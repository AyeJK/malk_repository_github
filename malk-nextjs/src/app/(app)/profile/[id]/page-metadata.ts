export const dynamic = 'force-dynamic';
import { getProfileMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const host = headers().get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const url = `${protocol}://${host}/api/get-user?ids=${params.id}`;
  console.log('[generateMetadata] Fetching user for metadata:', url);
  const res = await fetch(url, { cache: 'no-store' });
  console.log('[generateMetadata] Fetch status:', res.status);
  if (!res.ok) {
    console.log('[generateMetadata] Fetch failed, returning fallback title.');
    return { title: 'Profile – Malk' };
  }
  const data = await res.json();
  console.log('[generateMetadata] User data:', data);
  const user = data.users?.[0];
  if (!user) {
    console.log('[generateMetadata] No user found, returning fallback title.');
    return { title: 'Profile – Malk' };
  }
  return getProfileMetadata(user);
} 