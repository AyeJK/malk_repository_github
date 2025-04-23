import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    // Get the limit from query params or default to 10
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Fetching tags with limit:', limit);

    // Fetch all tags from Airtable
    const tagsTable = base('Tags');
    const records = await tagsTable.select({
      maxRecords: 100, // Fetch more records to ensure we get enough valid ones
      fields: ['Name', 'Count']
    }).all();

    console.log(`Found ${records.length} total tag records`);

    // Process and sort the records
    const tags = records
      .map(record => ({
        id: record.id,
        name: record.get('Name') as string,
        count: record.get('Count') as number || 0 // Default to 0 if Count is not set
      }))
      .filter(tag => tag.name) // Only include tags that have a name
      .sort((a, b) => (b.count || 0) - (a.count || 0)) // Sort by count, treating undefined as 0
      .slice(0, limit); // Take only the requested number of tags

    console.log(`Returning ${tags.length} processed tags`);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching top tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top tags' },
      { status: 500 }
    );
  }
} 