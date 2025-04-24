import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get posts where FirebaseUID matches the provided userId
    const posts = await base('Posts').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`,
      sort: [{ field: 'DateCreated', direction: 'desc' }]
    }).all();

    // Map the records to include only necessary fields
    const formattedPosts = posts.map(record => ({
      id: record.id,
      fields: record.fields
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