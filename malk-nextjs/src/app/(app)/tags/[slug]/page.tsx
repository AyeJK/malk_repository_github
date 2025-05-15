import dynamic from 'next/dynamic';
import { generateMetadata as _generateMetadata } from './page-metadata';

export const generateMetadata = _generateMetadata;

const TagClient = dynamic(() => import('./TagClient'), { ssr: false });

export default function TagPage() {
  return <TagClient />;
} 