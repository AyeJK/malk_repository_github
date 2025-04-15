import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/airtable';

export async function GET() {
  try {
    const posts = await getAllPosts();
    const latestPost = posts[0]; // Since posts are sorted by date in descending order

    if (!latestPost) {
      return NextResponse.json({ error: 'No posts found' }, { status: 404 });
    }

    return NextResponse.json(latestPost);
  } catch (error) {
    console.error('Error fetching latest post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest post' },
      { status: 500 }
    );
  }
} 