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
    const categories = await base('Categories').select().all();

    // Map the records to include only necessary fields
    const formattedCategories = categories.map(record => {
      const rawName = String(record.fields.Name || '');
      const normalizedName = normalizeCategory(rawName);
      // Use the Airtable 'Slug' field if present, otherwise generate one
      const slug = record.fields.Slug ? String(record.fields.Slug) : createSlug(normalizedName);

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

    // Define the desired order of categories
    const categoryOrder = [
      'Music',
      'Comedy',
      'Gaming',
      'Food',
      'Film / TV / Movies',
      'Beauty / Fashion',
      'Learning',
      'Nature',
      'Crafting / Tech',
      'Podcasts',
      'Sports',
      'Travel'
    ];

    // Sort categories according to the predefined order
    const sortedCategories = uniqueCategories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      
      // If both categories are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one category is in the order list, put it first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither category is in the order list, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ categories: sortedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 