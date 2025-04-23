import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    // Get the limit from query params or default to 10
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch tags from Airtable
    const tagsTable = base('Tags');
    const records = await tagsTable.select({
      maxRecords: limit,
      fields: ['Name']
    }).all();

    // Format the response
    const tags = records.map(record => ({
      id: record.id,
      name: record.get('Name') as string || 'Unnamed Tag',
      count: 0 // Default count since we don't have this field yet
    }));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching top tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top tags' },
      { status: 500 }
    );
  }
} 