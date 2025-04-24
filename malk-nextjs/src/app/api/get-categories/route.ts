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
      // Create URL-friendly slug by:
      // 1. Converting to lowercase
      // 2. Preserving existing hyphens
      // 3. Converting spaces to hyphens
      // 4. Removing any special characters
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '') // Remove any special characters except hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

      return {
        id: record.id,
        name,
        slug,
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