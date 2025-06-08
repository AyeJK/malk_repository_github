import { NextRequest, NextResponse } from 'next/server';
import Airtable, { FieldSet } from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

interface CategoryFields extends FieldSet {
  Name: string;
  Slug: string;
  Posts?: string[];
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);
    const offset = request.nextUrl.searchParams.get('offset') || undefined;
    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      );
    }
    // Get the category record using the slug field
    const categoryRecords = await base('Categories').select({
      filterByFormula: `LOWER({Slug}) = LOWER('${slug.replace(/'/g, "\\'")}')`
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
    const postCount = linkedPostIds.length;
    if (!linkedPostIds.length) {
      return NextResponse.json({ 
        posts: [],
        nextOffset: null,
        category: {
          id: categoryRecord.id,
          name: fields.Name,
          postCount: 0
        }
      });
    }
    // Fetch all posts by record IDs (no pagination yet)
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
    const posts = data.records || [];
    // Debug log: print userId and FirebaseUID for each post
    const userId = request.nextUrl.searchParams.get('userId');
    console.log('Filtering posts for userId:', userId);
    posts.forEach((record: any) => {
      console.log('Post ID:', record.id, 'FirebaseUID:', record.fields.FirebaseUID);
    });
    // Map Firebase UID to Airtable record ID
    let userRecordId = null;
    if (userId) {
      const userRecords = await base('Users').select({
        filterByFormula: `{FirebaseUID} = '${userId}'`
      }).firstPage();
      if (userRecords && userRecords.length > 0) {
        userRecordId = userRecords[0].id;
        console.log('Mapped Firebase UID to Airtable record ID:', userRecordId);
      } else {
        console.log('No Airtable user record found for Firebase UID:', userId);
      }
    }
    // Filter posts by userRecordId if provided (before pagination)
    let filteredPosts = posts;
    if (userRecordId) {
      filteredPosts = posts.filter((record: any) => {
        const firebaseUID = record.fields.FirebaseUID;
        if (Array.isArray(firebaseUID)) {
          return firebaseUID.includes(userRecordId);
        }
        return firebaseUID === userRecordId;
      });
    }
    // Sort filtered posts by most recent (DisplayDate or DateCreated desc)
    filteredPosts = filteredPosts.sort((a: any, b: any) => {
      const dateA = a.fields.DisplayDate || a.fields.DateCreated || '';
      const dateB = b.fields.DisplayDate || b.fields.DateCreated || '';
      return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
    });
    // Manual pagination of filtered posts
    const pageSize = limit;
    const startIndex = offset ? parseInt(offset, 10) : 0;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    const nextOffset = endIndex < filteredPosts.length ? String(endIndex) : null;
    // Map the records to include only necessary fields
    const formattedPosts = await Promise.all(paginatedPosts.map(async (record: any) => {
      const postFields = record.fields;
      let thumbnailUrl = null;
      const videoId = postFields['Video ID'];
      if (videoId && typeof videoId === 'string') {
        // Dynamically import getYouTubeThumbnailUrl to avoid top-level await
        const { getYouTubeThumbnailUrl } = await import('@/lib/video-utils');
        thumbnailUrl = await getYouTubeThumbnailUrl(videoId);
      }
      return {
        id: record.id,
        fields: {
          ...postFields,
          ThumbnailURL: thumbnailUrl
        }
      };
    }));
    return NextResponse.json({ 
      posts: formattedPosts,
      nextOffset,
      category: {
        id: categoryRecord.id,
        name: fields.Name,
        postCount
      }
    });
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 