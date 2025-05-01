import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

// Function to normalize category name
function normalizeCategory(name: string): string {
  // Convert any dashes to forward slashes with spaces
  const withSlashes = name.replace(/-/g, ' / ');
  
  // Normalize multiple spaces and slashes
  return withSlashes
    .replace(/\s+/g, ' ')  // Normalize spaces
    .replace(/\s*\/\s*/g, ' / ')  // Normalize spaces around slashes
    .trim();
}

// Function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')  // Replace slash with hyphen
    .replace(/\s+/g, '-')  // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')  // Remove special characters
    .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

export async function GET(request: NextRequest) {
  try {
    // Get all categories from the Categories table
    const categories = await base('Categories').select({
      sort: [{ field: 'Name', direction: 'asc' }]
    }).all();

    // Map the records to include only necessary fields
    const formattedCategories = categories.map(record => {
      const rawName = String(record.fields.Name || '');
      const normalizedName = normalizeCategory(rawName);
      const slug = createSlug(normalizedName);

      return {
        id: record.id,
        name: normalizedName,
        slug,
        postCount: record.fields.PostCount || 0
      };
    });

    // Remove duplicates based on normalized names
    const uniqueCategories = Array.from(
      new Map(formattedCategories.map(cat => [cat.name.toLowerCase(), cat])).values()
    );

    return NextResponse.json({ categories: uniqueCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 