import ProfileClient from './ProfileClient';
import { generateMetadata as _generateMetadata } from './page-metadata';

export const generateMetadata = _generateMetadata;

export default function ProfilePage() {
  return <ProfileClient />;
} 