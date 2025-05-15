export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  console.log('[SSR-TEST] SSR generateMetadata is running!');
  return {
    title: 'SSR Test – Malk',
    description: 'This is a minimal SSR test page.'
  };
}

export default function SSRTestPage() {
  return <div>SSR Test Page – If you see the correct title in the page source, SSR is working.</div>;
} 