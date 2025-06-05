import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { createNotification, getPost } from '@/lib/airtable';
import { sendNotificationEmail } from '@/lib/sendNotificationEmail';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

// GET handler to fetch comments for a post
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Missing postId parameter' },
        { status: 400 }
      );
    }
    
    // First, get the post to access its linked comments
    const postsTable = base('Posts');
    const postRecord = await postsTable.find(postId);
    
    if (!postRecord) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Get the linked comments from the post
    const linkedComments = (postRecord.fields.Comments || []) as string[];
    
    if (linkedComments.length === 0) {
      return NextResponse.json({ comments: [] });
    }
    
    // Fetch the full comment records
    const commentsTable = base('comments');
    const commentRecords = await commentsTable.select({
      filterByFormula: `OR(${linkedComments.map((id: string) => `RECORD_ID() = '${id}'`).join(',')})`,
      sort: [{ field: 'created_at', direction: 'desc' }]
    }).all();
    
    // Fetch all unique commenter_ids
    const commenterIds = Array.from(
      new Set(
        commentRecords.map(record => {
          const id = record.fields.commenter_id;
          return Array.isArray(id) ? id[0] : id;
        })
      )
    ).filter(Boolean);
    
    // Fetch user records for all commenters
    const usersTable = base('Users');
    const userRecords = await usersTable.select({
      filterByFormula: `OR(${commenterIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`,
      fields: ['ProfileImage'],
      maxRecords: commenterIds.length
    }).all();
    const userMap = Object.fromEntries(userRecords.map(user => [user.id, user.fields.ProfileImage ? (Array.isArray(user.fields.ProfileImage) ? user.fields.ProfileImage[0] : user.fields.ProfileImage) : null]));
    
    // Map records to comment objects, including profile_image
    const comments = commentRecords.map(record => ({
      id: record.id,
      post_id: Array.isArray(record.fields.post_id) ? record.fields.post_id[0] as string : '',
      post_author_id: Array.isArray(record.fields.post_author_id) ? record.fields.post_author_id[0] as string : '',
      commenter_id: Array.isArray(record.fields.commenter_id) ? record.fields.commenter_id[0] as string : '',
      commentor_display_name: record.fields.commentor_display_name as string,
      content: record.fields.content,
      created_at: record.fields.created_at,
      updated_at: record.fields.updated_at,
      profile_image: userMap[(Array.isArray(record.fields.commenter_id) ? record.fields.commenter_id[0] : record.fields.commenter_id) as string] || null
    }));
    
    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: `Failed to fetch comments: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST handler to create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, commenterId, content } = body;
    
    // Validate required fields
    if (!postId || !commenterId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // First, fetch the Airtable record ID for the user with the given Firebase UID
    const usersTable = base('Users');
    const userRecords = await usersTable.select({
      filterByFormula: `{FirebaseUID} = '${commenterId}'`,
      maxRecords: 1
    }).all();
    
    if (userRecords.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const userRecord = userRecords[0];
    const userAirtableId = userRecord.id;
    
    // Create new comment in Airtable
    const commentsTable = base('comments');
    
    const newComment = await commentsTable.create([
      {
        fields: {
          post_id: [postId],
          commenter_id: [userAirtableId],
          content: content
        }
      }
    ]);
    
    if (!newComment || newComment.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }
    
    const createdComment = newComment[0];
    
    // Update the post's Comments linked field
    const postsTable = base('Posts');
    const postRecord = await postsTable.find(postId);
    const currentComments = (postRecord.fields.Comments || []) as string[];
    
    // Check if the comment ID is already in the array to avoid duplicates
    if (!currentComments.includes(createdComment.id)) {
      await postsTable.update(postId, {
        Comments: [...currentComments, createdComment.id]
      });
    }
    
    // Notification logic: notify post owner if commenter is not the owner
    const postDetails = await getPost(postId);
    if (postDetails && postDetails.fields.FirebaseUID && postDetails.fields.FirebaseUID.length > 0) {
      const postOwnerAirtableId = postDetails.fields.FirebaseUID[0];
      // Fetch the Airtable user record for the post owner by record ID
      const postOwnerRecord = postOwnerAirtableId
        ? await usersTable.find(postOwnerAirtableId)
        : null;
      if (postOwnerRecord && postOwnerRecord.id !== userAirtableId) {
        const notification = await createNotification({
          'User': [postOwnerRecord.id],
          'Type': 'New Comment',
          'Related User': [userAirtableId],
          'Related Post': [postId],
          'Related Comment': [createdComment.id],
          'Is Read': false
        });
        // Send email notification and mark as sent
        if (notification && postOwnerRecord.fields.Email && postOwnerRecord.fields.DisplayName) {
          try {
            await sendNotificationEmail(
              {
                type: 'New Comment',
                data: {
                  commenterName: userRecord.fields.DisplayName,
                  commentText: content,
                  postTitle: postDetails.fields.VideoTitle,
                  postUrl: `/posts/${postId}`
                }
              },
              {
                email: Array.isArray(postOwnerRecord.fields.Email) ? postOwnerRecord.fields.Email[0] : String(postOwnerRecord.fields.Email),
                DisplayName: Array.isArray(postOwnerRecord.fields.DisplayName) ? postOwnerRecord.fields.DisplayName[0] : String(postOwnerRecord.fields.DisplayName)
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
    
    // Return the created comment
    return NextResponse.json({
      success: true,
      comment: {
        id: createdComment.id,
        post_id: Array.isArray(createdComment.fields.post_id) ? createdComment.fields.post_id[0] as string : '',
        commenter_id: Array.isArray(createdComment.fields.commenter_id) ? createdComment.fields.commenter_id[0] as string : '',
        commentor_display_name: createdComment.fields.commentor_display_name as string,
        content: createdComment.fields.content as string,
        created_at: createdComment.fields.created_at as string
      }
    });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: `Failed to create comment: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 