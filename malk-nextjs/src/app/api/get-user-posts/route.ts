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

    // Get posts where FirebaseUID matches the provided userId
    const posts = await base('Posts').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`,
      sort: [{ field: 'DateCreated', direction: 'desc' }]
    }).all();

    // Map the records to include only necessary fields and add user data
    const formattedPosts = await Promise.all(posts.map(async record => {
      // Get the best available thumbnail URL
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

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
} 