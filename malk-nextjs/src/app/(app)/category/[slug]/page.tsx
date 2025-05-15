import dynamic from 'next/dynamic';
import { getCategoryMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const CategoryClient = dynamic(() => import('./CategoryClient'), { ssr: false });

export default function CategoryPage() {
  return <CategoryClient />;
}

export function generateStaticParams() {
  // You can predefine your categories here or fetch them from a config/API if needed
  return [
    { slug: 'music' },
    { slug: 'comedy' },
    { slug: 'gaming' },
    { slug: 'sports' },
    { slug: 'learning' },
    { slug: 'food' },
    { slug: 'travel' },
    { slug: 'beauty-fashion' },
    { slug: 'film-tv-movies' },
    { slug: 'nature' },
    { slug: 'crafting-tech' },
    { slug: 'podcasts' },
    // Add more as needed
  ];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const url = `${base}/api/get-category?slug=${params.slug}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { title: 'Category – Malk' };
  const data = await res.json();
  const category = data.category;
  if (!category) return { title: 'Category – Malk' };
  return getCategoryMetadata(category);
} 