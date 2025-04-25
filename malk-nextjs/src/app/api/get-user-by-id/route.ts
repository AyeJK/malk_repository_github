import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// Add initialization check
if (!process.env.AIRTABLE_PAT && !process.env.NEXT_PUBLIC_AIRTABLE_PAT) {
  console.error('Airtable API key is missing in get-user-by-id route');
}
if (!process.env.AIRTABLE_BASE_ID && !process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) {
  console.error('Airtable Base ID is missing in get-user-by-id route');
}

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
    
    console.log('Fetching user with Firebase UID:', id);
    
    // Get the user record from Airtable by Firebase UID
    const userRecords = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${id}'`,
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