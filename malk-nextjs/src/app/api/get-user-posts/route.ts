import { NextRequest, NextResponse } from 'next/server';
import { getUserPosts } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching posts for user ID:', userId);
    
    // Get the user's posts from Airtable
    const posts = await getUserPosts(userId);
    
    console.log(`Found ${posts.length} posts for user`);
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
} 