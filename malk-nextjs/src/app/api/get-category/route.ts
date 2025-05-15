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
    const categoriesTable = base('Categories');
    const records = await categoriesTable.select({
      filterByFormula: `LOWER({Slug}) = '${slug.toLowerCase()}'`
    }).all();
    if (records.length === 0) {
      return NextResponse.json({ category: null }, { status: 404 });
    }
    const category = records[0].fields;
    return NextResponse.json({ category: { name: category.Name, slug: category.Slug, description: category.Description || '' } });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
} 