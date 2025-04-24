import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    // Get all categories from the Categories table
    const categories = await base('Categories').select({
      sort: [{ field: 'Name', direction: 'asc' }]
    }).all();

    // Map the records to include only necessary fields
    const formattedCategories = categories.map(record => {
      const name = String(record.fields.Name || '');
      return {
        id: record.id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        postCount: record.fields.PostCount || 0
      };
    });

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 