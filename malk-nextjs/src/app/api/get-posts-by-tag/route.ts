import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { getUserByFirebaseUID } from '@/lib/airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID || '');

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagName = searchParams.get('tag');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = searchParams.get('offset') || undefined;

    if (!tagName) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // First, find the tag record
    const tagsTable = base('Tags');
    const tagRecords = await tagsTable.select({
      filterByFormula: `{Slug} = '${tagName}'`,
      maxRecords: 1
    }).firstPage();

    if (tagRecords.length === 0) {
      console.log('No tag record found for slug:', tagName);
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    const tagRecord = tagRecords[0];
    const tagId = tagRecord.id;
    const tagNameValue = tagRecord.get('Name') || tagName;
    const postIds = tagRecord.get('Posts') as string[] | undefined;
    const postCount = Array.isArray(postIds) ? postIds.length : 0;
    console.log('Found tag record:', { id: tagId, name: tagNameValue, slug: tagRecord.get('Slug') });

    if (!postIds || postIds.length === 0) {
      return NextResponse.json({ posts: [], nextOffset: null, tag: { name: tagNameValue, postCount } });
    }

    // Manual pagination will happen after filtering
    // Fetch all posts by record IDs (no pagination yet)
    const apiKey = process.env.AIRTABLE_PAT;
    const baseId = process.env.AIRTABLE_BASE_ID;
    let url = `https://api.airtable.com/v0/${baseId}/Posts?` +
      `filterByFormula=OR(${postIds.map(id => `RECORD_ID()='${id}'`).join(',')})` +
      `&sort[0][field]=DateCreated&sort[0][direction]=desc`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!res.ok) throw new Error('Airtable API error');
    const data = await res.json();
    const posts = data.records || [];
    // Debug log: print userId and FirebaseUID for each post
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
    // Get all unique user IDs from the posts (for author info)
    const userIds = Array.from(new Set(
      paginatedPosts.flatMap((post: any) => post.fields.FirebaseUID || [])
    ));
    // Fetch user data for all authors
    const users = userIds.length > 0 ? await base('Users').select({
      filterByFormula: `OR(${userIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
    }).all() : [];
    // Create a map of user data
    const userMap = new Map(users.map(user => [user.id, user.fields]));
    // Map the records to post objects, adding user info
    const formattedPosts = await Promise.all(paginatedPosts.map(async (record: any) => {
      const postFields = record.fields;
      const authorId = Array.isArray(postFields.FirebaseUID) ? postFields.FirebaseUID[0] : postFields.FirebaseUID;
      const authorData = authorId ? userMap.get(authorId) : null;
      let thumbnailUrl = null;
      const videoId = postFields['Video ID'];
      if (videoId && typeof videoId === 'string') {
        const { getYouTubeThumbnailUrl } = await import('@/lib/video-utils');
        thumbnailUrl = await getYouTubeThumbnailUrl(videoId);
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
    return NextResponse.json({ posts: formattedPosts, nextOffset, tag: { name: tagNameValue, postCount } });
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 