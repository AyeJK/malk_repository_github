import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(request: NextRequest) {
  try {
    const { followerId, followingId } = await request.json();
    console.log('Received follow/unfollow request:', { followerId, followingId });

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get both users' records
    console.log('Fetching user records...');
    const [followerUser, followingUser] = await Promise.all([
      base('Users').select({
        filterByFormula: `{FirebaseUID} = '${followerId}'`,
      }).firstPage(),
      base('Users').select({
        filterByFormula: `{FirebaseUID} = '${followingId}'`,
      }).firstPage(),
    ]);

    console.log('Follower user found:', followerUser.length > 0);
    console.log('Following user found:', followingUser.length > 0);

    if (!followerUser || followerUser.length === 0 || !followingUser || followingUser.length === 0) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    const followerRecord = followerUser[0];
    const followingRecord = followingUser[0];

    // Get current following/followers lists
    const userIsFollowing = followerRecord.get('UserIsFollowing');
    const followingThisUser = followingRecord.get('FollowingThisUser');
    
    console.log('Current lists:', {
      userIsFollowing,
      followingThisUser
    });

    // Convert to arrays if they're not already
    const followerFollowing = Array.isArray(userIsFollowing) ? userIsFollowing : [];
    const followingFollowers = Array.isArray(followingThisUser) ? followingThisUser : [];
    
    // Check if already following by comparing record IDs
    // Handle both cases: array of record IDs or array of linked records
    let isFollowing = false;
    
    if (followerFollowing.length > 0) {
      // Check if the first item has an 'id' property (linked records)
      if (followerFollowing[0] && typeof followerFollowing[0] === 'object' && 'id' in followerFollowing[0]) {
        isFollowing = followerFollowing.some(record => record && record.id === followingRecord.id);
      } else {
        // It's an array of record IDs
        isFollowing = followerFollowing.includes(followingRecord.id);
      }
    }
    
    console.log('Is currently following:', isFollowing);

    if (isFollowing) {
      // Unfollow - remove record IDs from both lists
      console.log('Unfollowing...');
      
      // Handle both cases for both lists
      let newFollowerFollowing = [];
      let newFollowingFollowers = [];
      
      if (followerFollowing.length > 0 && followerFollowing[0] && typeof followerFollowing[0] === 'object' && 'id' in followerFollowing[0]) {
        // Linked records
        newFollowerFollowing = followerFollowing.filter(record => record && record.id !== followingRecord.id);
      } else {
        // Record IDs
        newFollowerFollowing = followerFollowing.filter(id => id !== followingRecord.id);
      }
      
      if (followingFollowers.length > 0 && followingFollowers[0] && typeof followingFollowers[0] === 'object' && 'id' in followingFollowers[0]) {
        // Linked records
        newFollowingFollowers = followingFollowers.filter(record => record && record.id !== followerRecord.id);
      } else {
        // Record IDs
        newFollowingFollowers = followingFollowers.filter(id => id !== followerRecord.id);
      }
      
      await Promise.all([
        base('Users').update(followerRecord.id, {
          UserIsFollowing: newFollowerFollowing,
        }),
        base('Users').update(followingRecord.id, {
          FollowingThisUser: newFollowingFollowers,
        }),
      ]);
      console.log('Unfollow successful');
    } else {
      // Follow - add record IDs to both lists
      console.log('Following...');
      
      // Handle both cases for both lists
      let newFollowerFollowing = [...followerFollowing];
      let newFollowingFollowers = [...followingFollowers];
      
      if (followerFollowing.length > 0 && followerFollowing[0] && typeof followerFollowing[0] === 'object' && 'id' in followerFollowing[0]) {
        // Linked records - add the record object
        newFollowerFollowing.push({ id: followingRecord.id });
      } else {
        // Record IDs - add the ID string
        newFollowerFollowing.push(followingRecord.id);
      }
      
      if (followingFollowers.length > 0 && followingFollowers[0] && typeof followingFollowers[0] === 'object' && 'id' in followingFollowers[0]) {
        // Linked records - add the record object
        newFollowingFollowers.push({ id: followerRecord.id });
      } else {
        // Record IDs - add the ID string
        newFollowingFollowers.push(followerRecord.id);
      }
      
      await Promise.all([
        base('Users').update(followerRecord.id, {
          UserIsFollowing: newFollowerFollowing,
        }),
        base('Users').update(followingRecord.id, {
          FollowingThisUser: newFollowingFollowers,
        }),
      ]);
      console.log('Follow successful');
    }

    // Return the new follow status (opposite of what it was before)
    return NextResponse.json({ success: true, isFollowing: !isFollowing });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to toggle follow status' },
      { status: 500 }
    );
  }
} 