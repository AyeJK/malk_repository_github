import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { getUserByFirebaseUID } from '@/lib/airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagName = searchParams.get('tag');
    const userId = searchParams.get('userId');

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
    console.log('Found tag record:', { id: tagId, name: tagRecord.get('Name'), slug: tagRecord.get('Slug') });

    // Get the array of post IDs from the tag's Posts field
    const postIds = tagRecord.get('Posts') as string[] | undefined;
    if (!postIds || postIds.length === 0) {
      return NextResponse.json({
        tag: {
          name: tagRecord.get('Name'),
          postCount: 0
        },
        posts: []
      });
    }

    // Fetch posts by their record IDs
    const postsTable = base('Posts');
    let postRecords = await postsTable.select({
      filterByFormula: `OR(${postIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
      sort: [{ field: 'DateCreated', direction: 'desc' }]
    }).all();
    console.log('Number of posts found:', postRecords.length);
    if (postRecords.length > 0) {
      console.log('UserTags of first post:', postRecords[0].fields.UserTags);
    }

    // If userId is provided, filter posts to only those by that user
    if (userId) {
      // Map Firebase UID to Airtable record ID
      const userRecord = await getUserByFirebaseUID(userId);
      if (!userRecord) {
        postRecords = [];
      } else {
        const airtableUserId = userRecord.id;
        postRecords = postRecords.filter(post => {
          const fuid = post.fields.FirebaseUID;
          if (Array.isArray(fuid)) return fuid.includes(airtableUserId);
          return fuid === airtableUserId;
        });
      }
    }

    // Get all unique user IDs from the posts
    const userIds = Array.from(new Set(
      postRecords.flatMap(post =>
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

    // Map the records to post objects, adding user info
    const posts = postRecords.map(record => {
      const postFields = record.fields;
      const authorId = Array.isArray(postFields.FirebaseUID) ? postFields.FirebaseUID[0] : postFields.FirebaseUID;
      const authorData = authorId ? userMap.get(authorId) : null;
      return {
        id: record.id,
        fields: {
          ...postFields,
          UserName: authorData?.DisplayName || 'Anonymous',
          UserAvatar: authorData?.ProfileImage || null
        }
      };
    });

    // Return the tag info and posts
    return NextResponse.json({
      tag: {
        name: tagRecord.get('Name'),
        postCount: posts.length
      },
      posts
    });
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts by tag' },
      { status: 500 }
    );
  }
} 