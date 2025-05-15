export const dynamic = 'force-dynamic';

import { generateMetadata as _generateMetadata } from './page-metadata';

export const generateMetadata = _generateMetadata;

import nextDynamic from 'next/dynamic';

const PostPageClient = nextDynamic(() => import('./PostPageClient'), { ssr: false });

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  return <PostPageClient params={params} />;
} 