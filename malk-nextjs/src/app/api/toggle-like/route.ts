import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { getUserByFirebaseUID, getPost, createNotification } from '@/lib/airtable';
import { sendNotificationEmail } from '@/lib/sendNotificationEmail';

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
        const postOwnerAirtableId = postRecord.fields.FirebaseUID[0];
        // Fetch the Airtable user record for the post owner by record ID
        const postOwnerRecord = postOwnerAirtableId
          ? await base('Users').find(postOwnerAirtableId)
          : null;
        console.log('Checking notification logic:', {
          postOwnerRecordId: postOwnerRecord?.id,
          userRecordId,
          shouldNotify: postOwnerRecord && postOwnerRecord.id !== userRecordId
        });
        if (postOwnerRecord && postOwnerRecord.id !== userRecordId) {
          console.log('About to create notification for like', {
            user: postOwnerRecord.id,
            type: 'New Like',
            relatedUser: userRecordId,
            relatedPost: postId
          });
          const notification = await createNotification({
            'User': [postOwnerRecord.id],
            'Type': 'New Like',
            'Related User': [userRecordId],
            'Related Post': [postId],
            'Is Read': false
          });
          console.log('createNotification finished for like');
          // Send email notification and mark as sent
          if (notification && postOwnerRecord.fields.Email && postOwnerRecord.fields.DisplayName) {
            try {
              await sendNotificationEmail(
                {
                  type: 'New Like',
                  data: {
                    likerName: userRecord.fields.DisplayName,
                    postTitle: postRecord.fields.VideoTitle,
                    postUrl: `/posts/${postId}`
                  }
                },
                {
                  email: postOwnerRecord.fields.Email,
                  DisplayName: postOwnerRecord.fields.DisplayName
                }
              );
              // Mark notification as emailed
              await base('Notifications').update([
                {
                  id: notification.id,
                  fields: { 'Email Sent': true }
                }
              ]);
            } catch (err) {
              console.error('Failed to send notification email:', err);
            }
          }
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