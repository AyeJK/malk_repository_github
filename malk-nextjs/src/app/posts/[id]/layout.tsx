import { Metadata } from 'next';
import { getPost } from '@/lib/airtable';

interface PostLayoutProps {
  params: {
    id: string;
  };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: PostLayoutProps): Promise<Metadata> {
  const post = await getPost(params.id);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.fields.VideoTitle || 'Untitled Video',
    description: post.fields.UserCaption || undefined,
  };
}

export default function PostLayout({ children }: PostLayoutProps) {
  return children;
} 