import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    const categoryName = request.nextUrl.searchParams.get('category');
    
    if (!categoryName) {
      return NextResponse.json(
        { error: 'Missing category parameter' },
        { status: 400 }
      );
    }

    // First, get the category record to ensure it exists
    const categoryRecords = await base('Categories').select({
      filterByFormula: `LOWER({Name}) = LOWER('${categoryName.replace(/'/g, "\\'")}')`
    }).all();

    if (categoryRecords.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const categoryRecord = categoryRecords[0];

    // Get all posts that have this category
    const posts = await base('Posts').select({
      filterByFormula: `FIND('${categoryRecord.id}', ARRAYJOIN(Categories, ',')) > 0`,
      sort: [{ field: 'DateCreated', direction: 'desc' }]
    }).all();

    // Map the records to include only necessary fields
    const formattedPosts = posts.map(record => ({
      id: record.id,
      fields: record.fields
    }));

    return NextResponse.json({ 
      posts: formattedPosts,
      category: {
        id: categoryRecord.id,
        name: categoryRecord.fields.Name,
        postCount: formattedPosts.length
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