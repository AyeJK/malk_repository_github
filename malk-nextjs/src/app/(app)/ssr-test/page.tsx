export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${base}/api/basic-test`;
  let fetchStatus = 'not started';
  let fetchResult = null;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    fetchStatus = res.status.toString();
    fetchResult = await res.text();
  } catch (err) {
    fetchStatus = 'error';
    fetchResult = String(err);
  }
  console.log('[SSR-TEST] SSR generateMetadata is running! Fetch status:', fetchStatus, 'Result:', fetchResult);
  return {
    title: 'SSR Test – Malk',
    description: `SSR test page. Fetch status: ${fetchStatus}`
  };
}

export default function SSRTestPage() {
  return <div>SSR Test Page – If you see the correct title in the page source, SSR is working. Check logs for fetch status.</div>;
} 