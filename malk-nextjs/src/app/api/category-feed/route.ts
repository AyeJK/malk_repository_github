export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import Airtable, { FieldSet } from 'airtable';
import { getYouTubeThumbnailUrl } from '@/lib/video-utils';
import { getUserByFirebaseUID } from '@/lib/airtable';

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
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);
    const offset = request.nextUrl.searchParams.get('offset') || undefined;
    const userId = request.nextUrl.searchParams.get('userId');
    
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
      return NextResponse.json({ posts: [], nextOffset: null });
    }

    // Fetch all post records for the category (do not paginate IDs first)
    const apiKey = process.env.AIRTABLE_PAT;
    const baseId = process.env.AIRTABLE_BASE_ID;
    let url = `https://api.airtable.com/v0/${baseId}/Posts?` +
      `filterByFormula=OR(${linkedPostIds.map(id => `RECORD_ID()='${id}'`).join(',')})` +
      `&sort[0][field]=DisplayDate&sort[0][direction]=desc`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!res.ok) throw new Error('Airtable API error');
    const data = await res.json();
    let posts = data.records || [];

    // If userId is provided, map to Airtable record ID
    let userAirtableId = null;
    if (userId) {
      const userRecord = await getUserByFirebaseUID(userId);
      if (userRecord) userAirtableId = userRecord.id;
    }

    // Filter posts by userAirtableId if provided
    if (userAirtableId) {
      posts = posts.filter((record: any) => {
        const firebaseUID = record.fields.FirebaseUID;
        if (Array.isArray(firebaseUID)) {
          return firebaseUID.includes(userAirtableId);
        }
        return firebaseUID === userAirtableId;
      });
    }

    // Sort all posts by DisplayDate (desc), fallback to DateCreated
    posts = posts.sort((a: any, b: any) => {
      const dateA = a.fields.DisplayDate || a.fields.DateCreated || '';
      const dateB = b.fields.DisplayDate || b.fields.DateCreated || '';
      return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
    });

    // Manual pagination of sorted posts
    const pageSize = limit;
    const startIndex = offset ? parseInt(offset, 10) : 0;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    const nextOffset = endIndex < posts.length ? String(endIndex) : null;

    // Get all unique user IDs from the paginated posts
    const userIds = Array.from(new Set(
      paginatedPosts.flatMap((post: any) => post.fields.FirebaseUID || [])
    ));

    // Fetch user data for all authors
    const users = userIds.length > 0 ? await base('Users').select({
      filterByFormula: `OR(${userIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
    }).all() : [];

    // Create a map of user data
    const userMap = new Map(users.map(user => [user.id, user.fields as UserFields]));

    // Map the records to include only necessary fields and add user data
    const formattedPosts = await Promise.all(paginatedPosts.map(async (record: any) => {
      const postFields = record.fields as PostFields;
      const authorId = postFields.FirebaseUID?.[0];
      const authorData = authorId ? userMap.get(authorId) : null;

      // Get the best available thumbnail URL
      let thumbnailUrl = null;
      if (postFields['Video ID']) {
        thumbnailUrl = await getYouTubeThumbnailUrl(postFields['Video ID']);
      }

      return {
        id: record.id,
        fields: {
          ...postFields,
          UserName: authorData?.DisplayName || 'Anonymous',
          UserAvatar: authorData?.ProfileImage || null,
          ThumbnailURL: thumbnailUrl
        }
      };
    }));

    // Only return a non-null nextOffset if there are actually posts in the response
    return NextResponse.json({
      posts: formattedPosts,
      nextOffset: formattedPosts.length > 0 ? nextOffset : null
    });
  } catch (error) {
    console.error('Error in category-feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category feed', details: error },
      { status: 500 }
    );
  }
} 