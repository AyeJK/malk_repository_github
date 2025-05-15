import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const url = `${base}/api/get-tag?slug=${params.slug}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { title: 'Tag – Malk' };
  const data = await res.json();
  const tag = data.tag;
  if (!tag || !tag.name) return { title: 'Tag – Malk' };
  return {
    title: `#${tag.name} – Malk - Social Video Discovery`,
    description: `See posts tagged with ${tag.name} on Malk.`,
    openGraph: {
      title: `#${tag.name} – Malk - Social Video Discovery`,
      description: `See posts tagged with ${tag.name} on Malk.`,
      images: ['/images/default-profile.svg'],
      url: `https://malk.tv/tags/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${tag.name} – Malk - Social Video Discovery`,
      description: `See posts tagged with ${tag.name} on Malk.`,
      images: ['/images/default-profile.svg'],
    },
  };
} 