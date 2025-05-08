export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { getYouTubeThumbnailUrl } from '@/lib/video-utils';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: Request) {
  try {
    // Get record IDs from query parameters
    const { searchParams } = new URL(request.url);
    const recordIds = searchParams.get('recordIds');
    
    if (!recordIds) {
      return NextResponse.json({ error: 'Record IDs are required' }, { status: 400 });
    }
    
    // Split the record IDs if they're comma-separated
    const recordIdArray = recordIds.split(',');
    
    // Fetch posts from Airtable
    const posts = await base('Posts').select({
      filterByFormula: `OR(${recordIdArray.map(id => `RECORD_ID()='${id}'`).join(',')})`,
      view: 'Grid view'
    }).all();
    
    // Get all unique user IDs from the posts
    const userIds = Array.from(new Set(
      posts.flatMap(post =>
        (Array.isArray(post.fields.FirebaseUID) ? post.fields.FirebaseUID : [post.fields.FirebaseUID])
          .filter(id => typeof id === 'string')
      )
    ));

    // Fetch user data for all authors
    const users = userIds.length > 0 ? await base('Users').select({
      filterByFormula: `OR(${userIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
    }).all() : [];

    // Create a map of user data
    const userMap = new Map(users.map(user => [user.id, user.fields]));

    // Format the response
    const formattedPosts = await Promise.all(posts.map(async post => {
      const postFields = post.fields;
      const authorId = Array.isArray(postFields.FirebaseUID) ? postFields.FirebaseUID[0] : postFields.FirebaseUID;
      const authorData = authorId ? userMap.get(authorId) : null;
      let thumbnailUrl = null;
      const videoId = postFields['Video ID'];
      if (videoId && typeof videoId === 'string') {
        thumbnailUrl = await getYouTubeThumbnailUrl(videoId);
      }
      return {
        id: post.id,
        fields: {
          ...postFields,
          UserName: authorData?.DisplayName || 'Anonymous',
          UserAvatar: authorData?.ProfileImage || null,
          ThumbnailURL: thumbnailUrl
        }
      };
    }));
    
    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('Error fetching posts by record IDs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
} 