import { NextRequest, NextResponse } from 'next/server';
import Airtable, { FieldSet } from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

interface CategoryFields extends FieldSet {
  Name: string;
  Posts?: string[];
}

interface UserFields extends FieldSet {
  DisplayName?: string;
  ProfileImage?: string;
  FirebaseUID?: string;
}

interface PostFields extends FieldSet {
  VideoURL: string;
  UserCaption: string;
  FirebaseUID?: string[];
  'Video ID'?: string;
  [key: string]: any;
}

// Map URL-safe slugs to actual category names
const categoryMap: { [key: string]: string } = {
  'music': 'Music',
  'comedy': 'Comedy',
  'gaming': 'Gaming',
  'food': 'Food',
  'film-tv-movies': 'Film / TV / Movies',
  'beauty-fashion': 'Beauty / Fashion',
  'learning': 'Learning',
  'nature': 'Nature',
  'crafting-tech': 'Crafting / Tech',
  'podcasts': 'Podcasts',
  'sports': 'Sports',
  'travel': 'Travel'
};

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');
    
    if (!category) {
      return NextResponse.json(
        { error: 'Missing category parameter' },
        { status: 400 }
      );
    }

    // Convert URL-safe slug to actual category name
    const actualCategory = categoryMap[category.toLowerCase()] || category;

    // First, get the category record to ensure it exists and get its linked posts
    const categoryRecords = await base('Categories').select({
      filterByFormula: `LOWER({Name}) = LOWER('${actualCategory.replace(/'/g, "\\'")}')`
    }).all();

    if (categoryRecords.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const categoryRecord = categoryRecords[0];
    const fields = categoryRecord.fields as CategoryFields;
    const linkedPostIds = fields.Posts || [];

    if (!linkedPostIds.length) {
      return NextResponse.json({ posts: [] });
    }

    // Fetch the linked posts using their record IDs
    const posts = await base('Posts').select({
      filterByFormula: `OR(${linkedPostIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
      sort: [{ field: 'DateCreated', direction: 'desc' }],
      maxRecords: 50 // Limit to 50 most recent posts
    }).all();

    // Get all unique user IDs from the posts
    const userIds = Array.from(new Set(
      posts.flatMap(post => (post.fields as PostFields).FirebaseUID || [])
    ));

    // Fetch user data for all authors
    const users = userIds.length > 0 ? await base('Users').select({
      filterByFormula: `OR(${userIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
    }).all() : [];

    // Create a map of user data
    const userMap = new Map(users.map(user => [user.id, user.fields as UserFields]));

    // Map the records to include only necessary fields and add user data
    const formattedPosts = posts.map(record => {
      const postFields = record.fields as PostFields;
      const authorId = postFields.FirebaseUID?.[0];
      const authorData = authorId ? userMap.get(authorId) : null;

      // Extract video ID from VideoURL if not directly provided
      let videoId = postFields['Video ID'];
      const videoUrl = postFields.VideoURL;
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
          ...postFields,
          UserName: authorData?.DisplayName || 'Anonymous',
          UserAvatar: authorData?.ProfileImage || null,
          ThumbnailURL: videoId ? 
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 
            null
        }
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching category feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category feed' },
      { status: 500 }
    );
  }
} 