import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const host = headers().get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const url = `${protocol}://${host}/api/get-tag?slug=${params.slug}`;
  try {
    console.log('[Tag Metadata] Fetching:', url);
    const res = await fetch(url, { cache: 'no-store' });
    console.log('[Tag Metadata] Status:', res.status);
    if (!res.ok) {
      console.log('[Tag Metadata] Fetch failed:', res.statusText);
      return { title: 'Tag – Malk' };
    }
    const data = await res.json();
    console.log('[Tag Metadata] Data:', data);
    const tag = data.tag;
    if (!tag || !tag.name) {
      console.log('[Tag Metadata] No tag or tag.name found');
      return { title: 'Tag – Malk' };
    }
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
  } catch (err) {
    console.log('[Tag Metadata] Error:', err);
    return { title: 'Tag – Malk' };
  }
} 