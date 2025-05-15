export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getUserLikedPosts } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const likedPosts = await getUserLikedPosts(userId);
    
    return NextResponse.json({ likedPosts });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json({ error: 'Failed to fetch liked posts' }, { status: 500 });
  }
} 