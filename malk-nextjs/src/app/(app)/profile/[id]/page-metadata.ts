import { getProfileMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch user data from the API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/get-user?ids=${params.id}`);
  if (!res.ok) return { title: 'Profile – Malk' };
  const data = await res.json();
  const user = data.users?.[0];
  if (!user) return { title: 'Profile – Malk' };
  return getProfileMetadata(user);
} 