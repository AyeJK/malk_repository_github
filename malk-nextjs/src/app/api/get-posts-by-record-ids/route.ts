import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: Request) {
  try {
    // Get record IDs from query parameters
    const { searchParams } = new URL(request.url);
    const recordIds = searchParams.get('recordIds');
    
    if (!recordIds) {
      return NextResponse.json({ error: 'Record IDs are required' }, { status: 400 });
    }
    
    // Split the record IDs if they're comma-separated
    const recordIdArray = recordIds.split(',');
    
    // Fetch posts from Airtable
    const posts = await base('Posts').select({
      filterByFormula: `OR(${recordIdArray.map(id => `RECORD_ID()='${id}'`).join(',')})`,
      view: 'Grid view'
    }).all();
    
    // Format the response
    const formattedPosts = posts.map(post => ({
      id: post.id,
      fields: post.fields
    }));
    
    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('Error fetching posts by record IDs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
} 