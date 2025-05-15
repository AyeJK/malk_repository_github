export const dynamic = 'force-dynamic';
import { getProfileMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) {
    throw new Error('Base URL is not set. Please set VERCEL_URL or NEXT_PUBLIC_BASE_URL.');
  }
  const url = `${base}/api/get-user?ids=${params.id}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { title: 'Profile – Malk' };
  const data = await res.json();
  const user = data.users?.[0];
  if (!user) return { title: 'Profile – Malk' };
  return getProfileMetadata(user);
} 