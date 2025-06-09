import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { getYouTubeThumbnailUrl } from '@/lib/video-utils';

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT 
}).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// Add initialization check
if (!process.env.AIRTABLE_PAT && !process.env.NEXT_PUBLIC_AIRTABLE_PAT) {
  console.error('Airtable API key is missing in get-user-posts route');
}
if (!process.env.AIRTABLE_BASE_ID && !process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) {
  console.error('Airtable Base ID is missing in get-user-posts route');
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0', 10);
    const sort = request.nextUrl.searchParams.get('sort') || 'latest';
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    // First get the user data
    const userRecords = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`
    }).firstPage();
    if (!userRecords || userRecords.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    const userData = userRecords[0].fields;
    // Get all post IDs for this user
    const allPosts = await base('Posts').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`,
      // No sort here, we'll sort in-memory for full control
    }).all();
    // Sort in-memory
    let sortedPosts = [...allPosts];
    if (sort === 'latest') {
      sortedPosts.sort((a, b) => {
        const dateA = typeof a.fields.DisplayDate === 'string' ? a.fields.DisplayDate : '';
        const dateB = typeof b.fields.DisplayDate === 'string' ? b.fields.DisplayDate : '';
        return dateB.localeCompare(dateA);
      });
    } else if (sort === 'oldest') {
      sortedPosts.sort((a, b) => {
        const dateA = typeof a.fields.DisplayDate === 'string' ? a.fields.DisplayDate : '';
        const dateB = typeof b.fields.DisplayDate === 'string' ? b.fields.DisplayDate : '';
        return dateA.localeCompare(dateB);
      });
    } else if (sort === 'popular') {
      sortedPosts.sort((a, b) => {
        const likeA = typeof a.fields.LikeCount === 'number' ? a.fields.LikeCount : 0;
        const likeB = typeof b.fields.LikeCount === 'number' ? b.fields.LikeCount : 0;
        return likeB - likeA;
      });
    }
    // Pagination
    const paginatedPosts = sortedPosts.slice(offset, offset + limit);
    const nextOffset = offset + limit < sortedPosts.length ? String(offset + limit) : null;
    // Map the records to include only necessary fields and add user data
    const formattedPosts = await Promise.all(paginatedPosts.map(async record => {
      let thumbnailUrl = null;
      const videoId = record.fields['Video ID'];
      if (videoId && typeof videoId === 'string') {
        thumbnailUrl = await getYouTubeThumbnailUrl(videoId);
      }
      return {
        id: record.id,
        fields: {
          ...record.fields,
          UserName: userData.DisplayName || 'Anonymous',
          UserAvatar: userData.ProfileImage || null,
          ThumbnailURL: thumbnailUrl
        }
      };
    }));
    return NextResponse.json({ posts: formattedPosts, nextOffset });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
} 