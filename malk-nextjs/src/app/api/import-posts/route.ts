import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/lib/airtable';
import { getVideoTitle } from '@/lib/video-utils';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if a post exists
async function checkPostExists(postId: string): Promise<boolean> {
  try {
    const records = await base('Posts').select({
      filterByFormula: `{ImportId} = '${postId}'`,
      maxRecords: 1
    }).firstPage();
    return records.length > 0;
  } catch (error) {
    console.error('Error checking for existing post:', error);
    return false;
  }
}

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
    console.log('File content:', fileContent.substring(0, 100)); // Log first 100 chars for debugging
    
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('Number of lines:', lines.length);
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Import file must contain at least 2 lines (FirebaseUID and at least one post)' },
        { status: 400 }
      );
    }
    
    // First line should be the FirebaseUID
    const firebaseUID = lines[0].replace('FirebaseUserID:', '').trim();
    console.log('FirebaseUID:', firebaseUID);

    // Process each post
    const results = [];
    const errors = [];
    const skippedPosts = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      console.log(`Processing line ${i + 1}:`, line);

      try {
        // Parse the line
        const [videoURL, description, tagsStr, category, dateCreated] = line.split('\t');
        
        if (!videoURL) {
          throw new Error('Missing required field: videoURL is required');
        }

        console.log('Parsed fields:', { videoURL, description, tagsStr, category, dateCreated });

        // Check if post already exists by video URL
        const exists = await checkPostExists(videoURL);
        if (exists) {
          console.log(`Post with URL ${videoURL} already exists, skipping...`);
          skippedPosts.push(videoURL);
          results.push({
            videoURL,
            success: true,
            videoTitle: 'Already exists',
            error: null,
            skipped: true
          });
          continue;
        }

        // Extract tags from the tags string - handle #tags with spaces
        const tags = tagsStr ? tagsStr
          .split(',')
          .map(tag => tag.trim())
          .map(tag => tag.startsWith('#') ? tag.substring(1) : tag)
          .filter(tag => tag.length > 0) : [];
        
        console.log('Extracted tags:', tags);
        
        // Get video title from YouTube API with retry logic
        let videoTitle = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            videoTitle = await getVideoTitle(videoURL);
            break;
          } catch (error: any) {
            retryCount++;
            console.error(`Attempt ${retryCount} failed to get video title:`, error.message);
            
            // Check for rate limit errors
            if (error.message.includes('quota exceeded') || error.message.includes('rate limit exceeded')) {
              console.error('API rate limit reached, continuing with default title');
              videoTitle = 'Title unavailable (API limit reached)';
              break;
            }
            
            if (retryCount === maxRetries) {
              console.error(`Failed to get video title after ${maxRetries} attempts:`, error);
              videoTitle = 'Title unavailable';
            } else {
              // Exponential backoff with jitter
              const backoffTime = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 10000);
              console.log(`Waiting ${backoffTime}ms before retry...`);
              await delay(backoffTime);
            }
          }
        }
        
        try {
          // Create the post
          const post = await createPost({
            firebaseUID,
            videoURL,
            userCaption: description || '',
            userTags: tags,
            categories: category ? [category] : []
          });

          if (post) {
            // Update the post with the original creation date
            try {
              await base('Posts').update(post.id, {
                'OriginalDateCreated': dateCreated
              });
            } catch (error: any) {
              console.error('Error setting original creation date:', error);
              errors.push(`Failed to set creation date for post ${videoURL}: ${error.message}`);
            }

            results.push({
              videoURL,
              success: true,
              videoTitle,
              error: null
            });
          } else {
            throw new Error('Post creation returned null');
          }
        } catch (postError: any) {
          console.error(`Error creating post ${videoURL}:`, postError);
          errors.push(`Failed to create post ${videoURL}: ${postError.message}`);
          results.push({
            videoURL,
            success: false,
            videoTitle,
            error: postError.message
          });
        }

        // Add a delay between posts to avoid rate limiting
        await delay(2000);

      } catch (error: any) {
        console.error(`Error processing post at line ${i + 1}:`, error);
        errors.push(`Line ${i + 1}: ${error.message}`);
        
        results.push({
          videoURL: `Line ${i + 1}`,
          success: false,
          videoTitle: null,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors: errors.length > 0 ? errors : null,
      totalProcessed: results.length,
      successfulImports: results.filter(r => r.success && !r.skipped).length,
      skippedPosts: skippedPosts.length > 0 ? skippedPosts : null,
      errorDetails: errors.length > 0 ? {
        count: errors.length,
        messages: errors
      } : null
    });

  } catch (error: any) {
    console.error('Error importing posts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import posts',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 