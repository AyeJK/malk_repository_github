import { generateMetadata as _generateMetadata } from './page-metadata';

export const generateMetadata = _generateMetadata;

import dynamic from 'next/dynamic';

const PostPageClient = dynamic(() => import('./PostPageClient'), { ssr: false });

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  return <PostPageClient params={params} />;
} 