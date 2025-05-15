import type { Metadata } from 'next';

// User Profile Metadata
export function getProfileMetadata(user: any): Metadata {
  const displayName = user?.fields?.DisplayName || user?.name || 'User';
  const bio = user?.fields?.Bio || `Check out ${displayName}'s profile on Malk.`;
  const profileImage = user?.fields?.ProfileImage || '/images/default-profile.svg';
  return {
    title: `${displayName} – Malk - Social Video Discovery`,
    description: bio,
    openGraph: {
      title: `${displayName} – Malk - Social Video Discovery`,
      description: bio,
      images: [profileImage],
      url: `https://malk.tv/profile/${displayName}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} – Malk - Social Video Discovery`,
      description: bio,
      images: [profileImage],
    },
  };
}

// Post Metadata (using correct Airtable field names)
export function getPostMetadata(post: any): Metadata {
  const title = post?.fields?.VideoTitle || 'Post on Malk';
  const author = post?.fields?.DisplayName || 'Unknown';
  const excerpt = post?.fields?.UserCaption || 'Check out this post on Malk!';
  const image = post?.fields?.ThumbnailURL || '/images/default-profile.svg';
  return {
    title: `${title} by ${author} – Malk - Social Video Discovery`,
    description: excerpt,
    openGraph: {
      title: `${title} by ${author} – Malk - Social Video Discovery`,
      description: excerpt,
      images: [image],
      url: `https://malk.tv/posts/${post.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} by ${author} – Malk - Social Video Discovery`,
      description: excerpt,
      images: [image],
    },
  };
}

// Category Metadata (using correct Airtable field names)
export function getCategoryMetadata(category: any): Metadata {
  const name = category?.name || category?.Name || 'Category';
  const description = category?.description || category?.Description || `Explore the best of ${name} on Malk.`;
  const slug = category?.slug || category?.Slug || '';
  return {
    title: `${name} – Malk - Social Video Discovery`,
    description,
    openGraph: {
      title: `${name} – Malk - Social Video Discovery`,
      description,
      images: ['/images/default-profile.svg'],
      url: `https://malk.tv/category/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} – Malk - Social Video Discovery`,
      description,
      images: ['/images/default-profile.svg'],
    },
  };
}

// Home Metadata
export const homeMetadata: Metadata = {
  title: 'Malk – Discover and Share Your Creativity',
  description: 'Join Malk to explore, create, and connect with a vibrant creative community.',
  openGraph: {
    title: 'Malk – Discover and Share Your Creativity',
    description: 'Join Malk to explore, create, and connect with a vibrant creative community.',
    images: ['/images/default-profile.svg'],
    url: 'https://malk.tv/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Malk – Discover and Share Your Creativity',
    description: 'Join Malk to explore, create, and connect with a vibrant creative community.',
    images: ['/images/default-profile.svg'],
  },
}; 