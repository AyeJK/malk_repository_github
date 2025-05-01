import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/lib/airtable';
import { getVideoTitle } from '@/lib/video-utils';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const importFile = formData.get('importFile') as File;

    if (!importFile) {
      return NextResponse.json(
        { error: 'Missing import file' },
        { status: 400 }
      );
    }

    // Read the import file
    const fileContent = await importFile.text();
    const lines = fileContent.split('\n');
    
    // First line should be the FirebaseUID
    const firebaseUID = lines[0].trim().replace('FirebaseUserID:', '').trim();

    // Process each post
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse the line
      const [postId, videoURL, description, tagsStr, category, dateCreated] = line.split('\t');
      
      // Extract tags from the tags string
      const tags = tagsStr.split(',').map(tag => tag.trim().replace('#', ''));
      
      // Get video title from YouTube API
      const videoTitle = await getVideoTitle(videoURL);
      
      // Create the post
      const post = await createPost({
        firebaseUID,
        videoURL,
        userCaption: description,
        userTags: tags,
        categories: [category]
      });

      if (post) {
        // Update the post with the original creation date
        try {
          await base('Posts').update(post.id, {
            'OriginalDateCreated': dateCreated
          });
        } catch (error) {
          console.error('Error setting original creation date:', error);
        }
      }

      results.push({
        postId,
        success: !!post,
        videoTitle,
        error: post ? null : 'Failed to create post'
      });
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error importing posts:', error);
    return NextResponse.json(
      { error: 'Failed to import posts' },
      { status: 500 }
    );
  }
} 