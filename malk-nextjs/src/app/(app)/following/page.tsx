import dynamic from 'next/dynamic';

const FollowingClient = dynamic(() => import('./FollowingClient'), { ssr: false });

export default function FollowingPage() {
  return <FollowingClient />;
}

export const metadata = {
  title: 'Following – Malk - Social Video Discovery',
  description: 'See posts from users you follow on Malk.',
}; 