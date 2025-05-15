import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }
    const tagsTable = base('Tags');
    const records = await tagsTable.select({
      filterByFormula: `LOWER({Name}) = '${slug.toLowerCase()}'`
    }).all();
    if (records.length === 0) {
      return NextResponse.json({ tag: null }, { status: 404 });
    }
    const tag = records[0].fields;
    return NextResponse.json({ tag: { name: tag.Name, slug: tag.Name } });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
} 