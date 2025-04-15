import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    // Get the user's record
    const userRecord = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`,
    }).firstPage();
    
    if (!userRecord || userRecord.length === 0) {
      return NextResponse.json({ following: [] });
    }
    
    // Get the UserIsFollowing field from the user record
    const userIsFollowing = userRecord[0].get('UserIsFollowing') || [];
    
    // If not following anyone, return empty array
    if (!Array.isArray(userIsFollowing) || userIsFollowing.length === 0) {
      return NextResponse.json({ following: [] });
    }
    
    // Extract record IDs from the userIsFollowing array
    const followingRecordIds = userIsFollowing.map(record => 
      typeof record === 'object' && record.id ? record.id : record
    );
    
    // Fetch the full user records for each user being followed
    const following = await base('Users').select({
      filterByFormula: `OR(${followingRecordIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`,
    }).all();
    
    return NextResponse.json({ following });
  } catch (error) {
    console.error('Error fetching following users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch following users' },
      { status: 500 }
    );
  }
} 