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
      return NextResponse.json({ followers: [] });
    }
    
    // Get the FollowingThisUser field from the user record
    const followingThisUser = userRecord[0].get('FollowingThisUser') || [];
    
    // If no followers, return empty array
    if (!Array.isArray(followingThisUser) || followingThisUser.length === 0) {
      return NextResponse.json({ followers: [] });
    }
    
    // Extract record IDs from the followingThisUser array
    const followerRecordIds = followingThisUser.map(record => 
      typeof record === 'object' && record.id ? record.id : record
    );
    
    // Fetch the full user records for each follower
    const followers = await base('Users').select({
      filterByFormula: `OR(${followerRecordIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`,
    }).all();
    
    return NextResponse.json({ followers });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    );
  }
} 