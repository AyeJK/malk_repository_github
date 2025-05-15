import dynamic from 'next/dynamic';

const PostsClient = dynamic(() => import('./PostsClient'), { ssr: false });

export default function PostsPage() {
  return <PostsClient />;
}

export const metadata = {
  title: 'Activity – Malk - Social Video Discovery',
  description: 'See your activity feed and recent posts on Malk.',
}; 