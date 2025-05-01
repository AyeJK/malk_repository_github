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

// Helper function to check if a post exists by video URL
async function checkPostExists(videoURL: string): Promise<boolean> {
  try {
    // Extract video ID from URL for more accurate comparison
    const videoId = extractVideoId(videoURL);
    if (!videoId) {
      console.error('Could not extract video ID from URL:', videoURL);
      return false;
    }

    // Check for existing post with same video ID
    const records = await base('Posts').select({
      filterByFormula: `OR(FIND('${videoId}', {VideoURL}) > 0, FIND('${videoId}', {Video ID}) > 0)`,
      maxRecords: 1
    }).firstPage();

    const exists = records.length > 0;
    if (exists) {
      console.log(`Found existing post with video ID ${videoId}`);
    } else {
      console.log(`No existing post found with video ID ${videoId}`);
    }
    return exists;
  } catch (error) {
    console.error('Error checking for existing post:', error);
    return false;
  }
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    console.error('Could not extract video ID from URL:', url);
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

// Process a batch of posts
async function processBatch(
  firebaseUID: string,
  posts: string[],
  startIndex: number,
  batchSize: number
) {
  const results = [];
  const errors = [];
  const skippedPosts = [];
  
  for (let i = startIndex; i < Math.min(startIndex + batchSize, posts.length); i++) {
    const line = posts[i];
    console.log(`\nProcessing line ${i + 1}:`, line);

    try {
      // Parse the line
      const [videoURL, description, tagsStr, category, dateCreated] = line.split('\t').map(field => field.trim());
      
      if (!videoURL) {
        throw new Error('Missing required field: videoURL is required');
      }

      // Clean up the videoURL (remove any quotes if present)
      const cleanVideoURL = videoURL.replace(/^["']|["']$/g, '');

      console.log('Parsed fields:', {
        videoURL: cleanVideoURL,
        description,
        tagsStr,
        category,
        dateCreated
      });

      // Check if post already exists by video URL
      const exists = await checkPostExists(cleanVideoURL);
      if (exists) {
        console.log(`Post with URL ${cleanVideoURL} already exists, skipping...`);
        skippedPosts.push(cleanVideoURL);
        results.push({
          videoURL: cleanVideoURL,
          success: true,
          videoTitle: 'Already exists',
          error: null,
          skipped: true
        });
        continue;
      }

      console.log('Post does not exist, proceeding with creation...');

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
          videoTitle = await getVideoTitle(cleanVideoURL);
          console.log('Successfully got video title:', videoTitle);
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
        console.log('Creating post with data:', {
          firebaseUID,
          videoURL: cleanVideoURL,
          userCaption: description || '',
          userTags: tags,
          categories: category ? [category] : []
        });

        // Create the post
        const post = await createPost({
          firebaseUID,
          videoURL: cleanVideoURL,
          userCaption: description || '',
          userTags: tags,
          categories: category ? [category] : []
        });

        if (post) {
          console.log('Post created successfully:', post.id);
          // Update the post with the original creation date
          try {
            await base('Posts').update(post.id, {
              'OriginalDateCreated': dateCreated
            });
            console.log('Updated post creation date:', dateCreated);
          } catch (error: any) {
            console.error('Error setting original creation date:', error);
            errors.push(`Failed to set creation date for post ${cleanVideoURL}: ${error.message}`);
          }

          results.push({
            videoURL: cleanVideoURL,
            success: true,
            videoTitle,
            error: null
          });
        } else {
          throw new Error('Post creation returned null');
        }
      } catch (postError: any) {
        console.error(`Error creating post ${cleanVideoURL}:`, postError);
        errors.push(`Failed to create post ${cleanVideoURL}: ${postError.message}`);
        results.push({
          videoURL: cleanVideoURL,
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

  return {
    results,
    errors,
    skippedPosts,
    processedCount: Math.min(startIndex + batchSize, posts.length)
  };
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

    // Process posts in batches of 5
    const BATCH_SIZE = 5;
    const posts = lines.slice(1);
    const totalPosts = posts.length;
    let processedCount = 0;
    let allResults: Array<{
      videoURL: string;
      success: boolean;
      videoTitle: string | null;
      error: string | null;
      skipped?: boolean;
    }> = [];
    let allErrors: string[] = [];
    let allSkippedPosts: string[] = [];

    // Process all batches
    while (processedCount < totalPosts) {
      console.log(`Processing batch starting at index ${processedCount}`);
      const batchResult = await processBatch(firebaseUID, posts, processedCount, BATCH_SIZE);
      allResults = allResults.concat(batchResult.results);
      allErrors = allErrors.concat(batchResult.errors);
      allSkippedPosts = allSkippedPosts.concat(batchResult.skippedPosts);
      processedCount = batchResult.processedCount;

      // Add a small delay between batches to avoid rate limiting
      await delay(1000);
    }

    // Return final results after all batches are processed
    return NextResponse.json({
      success: true,
      progress: {
        processed: processedCount,
        total: totalPosts,
        percentage: Math.round((processedCount / totalPosts) * 100)
      },
      results: allResults,
      errors: allErrors.length > 0 ? allErrors : null,
      skippedPosts: allSkippedPosts.length > 0 ? allSkippedPosts : null,
      completed: true
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