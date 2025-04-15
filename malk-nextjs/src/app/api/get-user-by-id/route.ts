import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching user with Airtable ID:', id);
    
    // Get the user record from Airtable
    const userRecords = await base('Users').select({
      filterByFormula: `RECORD_ID() = '${id}'`,
      maxRecords: 1
    }).firstPage();
    
    if (userRecords.length === 0) {
      console.error('User not found:', id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userRecords[0];
    console.log('User record found:', {
      id: user.id,
      fields: Object.keys(user.fields)
    });
    
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: `Failed to fetch user: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 