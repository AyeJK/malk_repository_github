import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { getUserByFirebaseUID, getPost, createNotification } from '@/lib/airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function POST(request: NextRequest) {
  try {
    const { postId, userId } = await request.json();
    
    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to toggle like:', { postId, userId });
    
    // Get the user's Airtable record ID
    const userRecord = await getUserByFirebaseUID(userId);
    if (!userRecord) {
      console.error('User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const userRecordId = userRecord.id;
    console.log('User Airtable record ID:', userRecordId);
    
    // Get the current post
    const postRecords = await base('Posts').select({
      filterByFormula: `RECORD_ID() = '${postId}'`,
      maxRecords: 1
    }).firstPage();
    
    if (postRecords.length === 0) {
      console.error('Post not found:', postId);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    const post = postRecords[0];
    console.log('Current post data:', {
      id: post.id,
      fields: Object.keys(post.fields)
    });
    
    // Get current likes or initialize empty array
    const currentLikes = (post.fields.UserLikes || []) as string[];
    console.log('Current likes:', currentLikes);
    
    // Check if user has already liked the post
    const hasLiked = currentLikes.includes(userRecordId);
    console.log('User has already liked:', hasLiked);
    
    // Update likes based on current state
    const updatedLikes = hasLiked
      ? currentLikes.filter((id: string) => id !== userRecordId)
      : [...currentLikes, userRecordId];
    
    console.log('Updated likes:', updatedLikes);
    
    // Update the post - only update UserLikes since LikeCount is computed
    await post.updateFields({
      UserLikes: updatedLikes
    });
    
    console.log('Post updated successfully');
    
    // Notification logic: only if this is a new like (not an unlike)
    if (!hasLiked) {
      // Fetch post details to get the owner
      const postRecord = await getPost(postId);
      if (postRecord && postRecord.fields.FirebaseUID && postRecord.fields.FirebaseUID.length > 0) {
        const postOwnerId = postRecord.fields.FirebaseUID[0];
        // Only notify if the liker is not the owner
        if (postOwnerId !== userRecordId) {
          await createNotification({
            'User (Recipient)': [postOwnerId],
            'Type': 'New Like',
            'Related User': [userRecordId],
            'Related Post': [postId],
            'Is Read': false
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      hasLiked: !hasLiked,
      likeCount: updatedLikes.length
    });
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: `Failed to toggle like: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 