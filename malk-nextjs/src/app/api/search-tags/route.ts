import { NextRequest, NextResponse } from 'next/server';
import { searchTags } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    // Get the search query from the URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ tags: [] });
    }
    
    // Search for tags
    const tags = await searchTags(query);
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error searching tags:', error);
    return NextResponse.json(
      { error: 'Failed to search tags' },
      { status: 500 }
    );
  }
} 