import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { createNotification } from '@/lib/airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(request: NextRequest) {
  try {
    const { followerId, followingId } = await request.json();
    console.log('Toggle follow status:', { followerId, followingId });

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

    // Get the current FollowingThisUser value
    const currentFollowingThisUser = followingUser[0].get('FollowingThisUser') || [];
    const isFollowing = Array.isArray(currentFollowingThisUser) && 
      currentFollowingThisUser.some(record => 
        (typeof record === 'object' && record.id === followerRecord[0].id) || 
        record === followerRecord[0].id
      );

    // Update the following user's record with the new FollowingThisUser value
    let newFollowing;
    if (isFollowing) {
      // Remove the follower from the list
      newFollowing = Array.isArray(currentFollowingThisUser) 
        ? currentFollowingThisUser.filter(record => 
            (typeof record === 'object' ? record.id !== followerRecord[0].id : record !== followerRecord[0].id)
          )
        : [];
    } else {
      // Add the follower to the list
      newFollowing = Array.isArray(currentFollowingThisUser)
        ? [...currentFollowingThisUser, followerRecord[0].id]
        : [followerRecord[0].id];
    }

    // Get the current UserIsFollowing value from the follower's record
    const currentUserIsFollowing = followerRecord[0].get('UserIsFollowing') || [];
    
    // Update the UserIsFollowing field in the follower's record
    let newUserIsFollowing;
    if (isFollowing) {
      // Remove the user being followed from the list
      newUserIsFollowing = Array.isArray(currentUserIsFollowing)
        ? currentUserIsFollowing.filter(record => 
            (typeof record === 'object' ? record.id !== followingUser[0].id : record !== followingUser[0].id)
          )
        : [];
    } else {
      // Add the user being followed to the list
      newUserIsFollowing = Array.isArray(currentUserIsFollowing)
        ? [...currentUserIsFollowing, followingUser[0].id]
        : [followingUser[0].id];
    }

    // Update both records
    await base('Users').update(followingUser[0].id, {
      FollowingThisUser: newFollowing,
    });

    await base('Users').update(followerRecord[0].id, {
      UserIsFollowing: newUserIsFollowing,
    });

    console.log('Follow status updated successfully');

    // Notification logic: only if this is a new follow
    if (!isFollowing) {
      await createNotification({
        'User (Recipient)': [followingUser[0].id],
        'Type': 'New Follow',
        'Related User': [followerRecord[0].id],
        'Is Read': false
      });
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