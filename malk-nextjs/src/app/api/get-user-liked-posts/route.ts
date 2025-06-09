export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getUserLikedPosts } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sort = searchParams.get('sort') || 'latest';
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    // Get the user record to access the LikedPosts field
    const { getUserByFirebaseUID } = await import('@/lib/airtable');
    const userRecord = await getUserByFirebaseUID(userId);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const likedPostIds = userRecord.fields.LikedPosts || [];
    if (likedPostIds.length === 0) {
      return NextResponse.json({ posts: [], nextOffset: null });
    }
    // Fetch all liked posts
    const allPosts = await Promise.all(likedPostIds.map(async (id: string) => {
      try {
        const post = await (await import('@/lib/airtable')).getPost(id);
        return post;
      } catch {
        return null;
      }
    }));
    const validPosts = allPosts.filter(Boolean);
    // Sort in-memory
    let sortedPosts = [...validPosts];
    if (sort === 'latest') {
      sortedPosts.sort((a, b) => {
        if (!a || !b) return 0;
        const dateA = typeof a.fields.DisplayDate === 'string' ? a.fields.DisplayDate : '';
        const dateB = typeof b.fields.DisplayDate === 'string' ? b.fields.DisplayDate : '';
        return dateB.localeCompare(dateA);
      });
    } else if (sort === 'oldest') {
      sortedPosts.sort((a, b) => {
        if (!a || !b) return 0;
        const dateA = typeof a.fields.DisplayDate === 'string' ? a.fields.DisplayDate : '';
        const dateB = typeof b.fields.DisplayDate === 'string' ? b.fields.DisplayDate : '';
        return dateA.localeCompare(dateB);
      });
    } else if (sort === 'popular') {
      sortedPosts.sort((a, b) => {
        if (!a || !b) return 0;
        const likeA = typeof a.fields.LikeCount === 'number' ? a.fields.LikeCount : 0;
        const likeB = typeof b.fields.LikeCount === 'number' ? b.fields.LikeCount : 0;
        return likeB - likeA;
      });
    }
    // Pagination
    const paginatedPosts = sortedPosts.slice(offset, offset + limit);
    const nextOffset = offset + limit < sortedPosts.length ? String(offset + limit) : null;
    // Add thumbnail and user info
    const formattedPosts = await Promise.all(paginatedPosts.map(async (record: any) => {
      let thumbnailUrl = null;
      const videoId = record.fields['Video ID'];
      if (videoId && typeof videoId === 'string') {
        const { getYouTubeThumbnailUrl } = await import('@/lib/video-utils');
        thumbnailUrl = await getYouTubeThumbnailUrl(videoId);
      }
      // Get user info for the post
      let userData = null;
      let firebaseUID = record.fields.FirebaseUID;
      if (Array.isArray(firebaseUID)) {
        firebaseUID = firebaseUID[0];
      }
      if (typeof firebaseUID === 'string' && firebaseUID) {
        const { getUserByFirebaseUID } = await import('@/lib/airtable');
        userData = await getUserByFirebaseUID(firebaseUID);
      }
      return {
        id: record.id,
        fields: {
          ...record.fields,
          UserName: userData?.fields?.DisplayName || 'Anonymous',
          UserAvatar: userData?.fields?.ProfileImage || null,
          ThumbnailURL: thumbnailUrl
        }
      };
    }));
    return NextResponse.json({ posts: formattedPosts, nextOffset });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json({ error: 'Failed to fetch liked posts' }, { status: 500 });
  }
} 