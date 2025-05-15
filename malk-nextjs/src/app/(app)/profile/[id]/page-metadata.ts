import { getProfileMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const url = `${base}/api/get-user?ids=${params.id}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { title: 'Profile – Malk' };
  const data = await res.json();
  const user = data.users?.[0];
  if (!user) return { title: 'Profile – Malk' };
  return getProfileMetadata(user);
} 