import { NextResponse } from 'next/server';
import { getAirtableClient } from '@/lib/airtable';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const airtable = getAirtableClient();
    const table = airtable.table('Posts');

    // First try to fetch by record ID
    try {
      const record = await table.find(id);
      return NextResponse.json(record);
    } catch (error) {
      console.error('Error fetching post:', error);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in get-post route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 