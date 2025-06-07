export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    // Get tag IDs from query parameters
    const searchParams = request.nextUrl.searchParams;
    const tagIds = searchParams.get('ids')?.split(',') || [];
    
    if (tagIds.length === 0) {
      return NextResponse.json({ tags: [] });
    }
    
    // Fetch tags from Airtable
    const tagsTable = base('Tags');
    
    // Try to get all records without specifying a view
    const records = await tagsTable.select({
      filterByFormula: `OR(${tagIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
    }).all();
    
    // Map records to tag objects
    const tags = records.map(record => ({
      id: record.id,
      name: record.fields.Name || 'Unnamed Tag',
      slug: record.fields.Slug || ''
    }));
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    // Check if tag already exists (case-insensitive)
    const tagsTable = base('Tags');
    const existing = await tagsTable.select({
      filterByFormula: `LOWER({Name}) = '${name.toLowerCase()}'`,
      maxRecords: 1
    }).all();

    if (existing.length > 0) {
      const tag = existing[0];
      return NextResponse.json({
        tag: {
          id: tag.id,
          name: tag.fields.Name || name,
          slug: tag.fields.Slug || ''
        }
      });
    }

    // Create new tag (do NOT set Slug, it's computed)
    const created = await tagsTable.create([
      { fields: { Name: name } }
    ]);
    const tag = created[0];
    return NextResponse.json({
      tag: {
        id: tag.id,
        name: tag.fields.Name || name,
        slug: tag.fields.Slug || ''
      }
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
} 