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

export async function GET(request: NextRequest) {
  try {
    const categoryName = request.nextUrl.searchParams.get('category');
    
    if (!categoryName) {
      return NextResponse.json(
        { error: 'Missing category parameter' },
        { status: 400 }
      );
    }

    // Normalize the category name for comparison
    const normalizedSearchName = categoryName
      .replace(/-/g, ' / ')  // Convert hyphens to slashes
      .replace(/\s+/g, ' ')  // Normalize spaces
      .replace(/\s*\/\s*/g, ' / ')  // Normalize spaces around slashes
      .trim()
      .toLowerCase();

    // First, get the category record to ensure it exists and get its linked posts
    const categoryRecords = await base('Categories').select({
      filterByFormula: `LOWER(SUBSTITUTE(SUBSTITUTE({Name}, '-', ' / '), '  ', ' ')) = '${normalizedSearchName.replace(/'/g, "\\'")}'`
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
      sort: [{ field: 'DisplayDate', direction: 'desc' }],
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

      return {
        id: record.id,
        fields: {
          ...postFields,
          UserName: authorData?.DisplayName || 'Anonymous',
          UserAvatar: authorData?.ProfileImage || null,
          ThumbnailURL: postFields['Video ID'] ? 
            `https://img.youtube.com/vi/${postFields['Video ID']}/maxresdefault.jpg` : 
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