import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
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

    // Get the follower's record
    const followerRecord = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${followerId}'`,
    }).firstPage();

    if (!followerRecord || followerRecord.length === 0) {
      console.log('Follower user not found:', followerId);
      return NextResponse.json(
        { error: 'Follower user not found' },
        { status: 404 }
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

    // Check if the follower's record ID is in the FollowingThisUser list
    const followingThisUser = followingUser[0].get('FollowingThisUser') || [];
    const isFollowing = Array.isArray(followingThisUser) && 
      followingThisUser.some(record => 
        (typeof record === 'object' && record.id === followerRecord[0].id) || 
        record === followerRecord[0].id
      );

    console.log('Follow status:', { isFollowing });
    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
} 