import { Metadata } from 'next';
import { getPost } from '@/lib/airtable';

interface PostLayoutProps {
  params: {
    id: string;
  };
  children: React.ReactNode;
}

export default function PostLayout({ children }: PostLayoutProps) {
  return children;
} 