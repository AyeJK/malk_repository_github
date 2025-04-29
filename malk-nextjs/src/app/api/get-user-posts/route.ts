import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

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
    const formattedPosts = posts.map(record => {
      // Extract video ID from VideoURL if not directly provided
      let videoId = record.fields['Video ID'];
      const videoUrl = record.fields.VideoURL;
      if (!videoId && typeof videoUrl === 'string') {
        try {
          const url = new URL(videoUrl);
          if (url.hostname.includes('youtube.com')) {
            videoId = url.searchParams.get('v') || '';
          } else if (url.hostname.includes('youtu.be')) {
            videoId = url.pathname.slice(1);
          }
        } catch (e) {
          console.error('Error parsing video URL:', e);
        }
      }

      return {
        id: record.id,
        fields: {
          ...record.fields,
          UserName: userData.DisplayName || 'Anonymous',
          UserAvatar: userData.ProfileImage || null,
          ThumbnailURL: videoId ? 
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 
            null
        }
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
} 