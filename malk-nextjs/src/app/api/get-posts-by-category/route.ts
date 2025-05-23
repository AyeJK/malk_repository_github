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

    if (!linkedPostIds.length) {
      return NextResponse.json({ 
        posts: [],
        category: {
          id: categoryRecord.id,
          name: fields.Name,
          postCount: 0
        }
      });
    }

    // Fetch the linked posts using their record IDs
    const posts = await base('Posts').select({
      filterByFormula: `OR(${linkedPostIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
      sort: [{ field: 'DisplayDate', direction: 'desc' }]
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
        name: fields.Name,
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