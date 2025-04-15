import { NextResponse } from 'next/server';
import { createPost, ensurePostsTableExists, upsertUser } from '@/lib/airtable';
import Airtable from 'airtable';

export async function GET() {
  try {
    // First, check if the Posts table exists
    const postsTableExists = await ensurePostsTableExists();
    if (!postsTableExists) {
      return NextResponse.json({
        success: false,
        message: 'Posts table does not exist. Please create it in Airtable first.',
        instructions: 'Create the Posts table in Airtable with the required fields as described in the console logs.'
      });
    }

    // Create a test user if needed
    const testEmail = `test-user-${Date.now()}@example.com`;
    const testUID = `test-uid-${Date.now()}`;
    
    const testUser = await upsertUser({
      email: testEmail,
      firebaseUID: testUID,
      displayName: `Test User ${Date.now()}`,
      role: 'User'
    });

    if (!testUser) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create test user',
        error: 'The upsertUser function returned null'
      });
    }

    // Create a test post using the test user's ID
    const testPost = await createPost({
      firebaseUID: testUID,
      videoURL: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example YouTube URL
      userCaption: 'This is a test post created via the API',
      // Only include tags and categories if they exist in their respective tables
      // You can add them manually in Airtable first
      // userTags: ['test', 'example'],
      // categories: ['test-category']
    });

    if (!testPost) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create test post',
        error: 'The createPost function returned null'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Test post created successfully',
      user: {
        id: testUser.id,
        fields: testUser.fields
      },
      post: {
        id: testPost.id,
        fields: testPost.fields
      }
    });
  } catch (error: any) {
    console.error('Error creating test post:', error);
    return NextResponse.json({
      success: false,
      message: 'Error creating test post',
      error: error.message || 'Unknown error',
      details: error
    });
  }
} 