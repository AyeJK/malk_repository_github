import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(request: NextRequest) {
  try {
    const { followerId, followingId } = await request.json();
    console.log('Checking follow status:', { followerId, followingId });

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the following user's record
    const followingUser = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${followingId}'`,
    }).firstPage();

    if (!followingUser || followingUser.length === 0) {
      console.log('Following user not found:', followingId);
      return NextResponse.json(
        { error: 'Following user not found' },
        { status: 404 }
      );
    }

    // Get the follower's record
    const followerRecord = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${followerId}'`,
    }).firstPage();
    
    if (!followerRecord || followerRecord.length === 0) {
      console.log('Follower user not found:', followerId);
      return NextResponse.json({ isFollowing: false });
    }
    
    const followerRecordId = followerRecord[0].id;
    console.log('Follower record ID:', followerRecordId);
    
    // Get the followers list - this could be an array of record IDs or linked records
    const followingThisUser = followingUser[0].get('FollowingThisUser');
    console.log('FollowingThisUser raw value:', followingThisUser);
    
    // Check if the follower's record ID is in the list
    // Handle both cases: array of record IDs or array of linked records
    let isFollowing = false;
    
    if (Array.isArray(followingThisUser)) {
      if (followingThisUser.length > 0) {
        // Check if the first item has an 'id' property (linked records)
        if (followingThisUser[0] && typeof followingThisUser[0] === 'object' && 'id' in followingThisUser[0]) {
          isFollowing = followingThisUser.some(record => record && record.id === followerRecordId);
        } else {
          // It's an array of record IDs
          isFollowing = followingThisUser.includes(followerRecordId);
        }
      }
    }
    
    console.log('Follow status result:', { 
      isFollowing, 
      followingThisUserType: typeof followingThisUser,
      isArray: Array.isArray(followingThisUser),
      length: Array.isArray(followingThisUser) ? followingThisUser.length : 0,
      followerRecordId,
      followingUserId: followingUser[0].id
    });
    
    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
} 