import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagName = searchParams.get('tag');

    if (!tagName) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // First, find the tag record
    const tagsTable = base('Tags');
    const tagRecords = await tagsTable.select({
      filterByFormula: `LOWER({Name}) = LOWER('${tagName}')`,
      maxRecords: 1
    }).firstPage();

    if (tagRecords.length === 0) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    const tagRecord = tagRecords[0];
    const tagId = tagRecord.id;

    // Then, find all posts that have this tag
    const postsTable = base('Posts');
    const postRecords = await postsTable.select({
      filterByFormula: `OR(
        SEARCH('${tagId}', ARRAYJOIN({UserTags}, ',')),
        SEARCH('${tagName.toLowerCase()}', LOWER(ARRAYJOIN({UserTags}, ',')))
      )`,
      sort: [{ field: 'DateCreated', direction: 'desc' }]
    }).all();

    // Map the records to post objects
    const posts = postRecords.map(record => ({
      id: record.id,
      fields: record.fields
    }));

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