import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    console.log('Inspect user API called');
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    console.log('Inspecting user with ID:', userId);
    
    // Get the user record
    const userRecords = await base('Users').select({
      filterByFormula: `RECORD_ID() = '${userId}'`,
      maxRecords: 1
    }).firstPage();
    
    if (userRecords.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userRecords[0];
    
    // Get all field names
    const fieldNames = Object.keys(user.fields);
    
    // Get field values for specific fields we're interested in
    const userIsFollowing = user.fields.UserIsFollowing || [];
    const followingThisUser = user.fields.FollowingThisUser || [];
    
    return NextResponse.json({
      id: user.id,
      fieldNames,
      userIsFollowing,
      followingThisUser,
      // Include a sample of the fields (first 5) to avoid sending too much data
      sampleFields: Object.fromEntries(
        Object.entries(user.fields).slice(0, 5)
      )
    });
  } catch (error: any) {
    console.error('Error inspecting user:', error);
    return NextResponse.json(
      { error: `Failed to inspect user: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 