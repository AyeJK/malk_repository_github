export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import Airtable, { FieldSet } from 'airtable';
import { getYouTubeThumbnailUrl } from '@/lib/video-utils';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

interface UserFields extends FieldSet {
  DisplayName?: string;
  ProfileImage?: string;
  FirebaseUID?: string;
  UserIsFollowing?: string[];
}

interface PostFields extends FieldSet {
  VideoURL: string;
  UserCaption: string;
  FirebaseUID?: string[];
  'Video ID'?: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    console.log('Following feed requested for user:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // First get the list of users we're following
    const followingResponse = await base('Users').select({
      filterByFormula: `FIND('${userId}', {FirebaseUID}) > 0`,
    }).firstPage();
    console.log('Found user records:', followingResponse.length);

    if (!followingResponse || followingResponse.length === 0) {
      console.log('No user record found for Firebase UID:', userId);
      return NextResponse.json({ posts: [] });
    }

    const userFields = followingResponse[0].fields as UserFields;
    const userIsFollowing = userFields.UserIsFollowing || [];
    console.log('Raw UserIsFollowing data:', userIsFollowing);
    console.log('User is following count:', userIsFollowing.length);
    
    if (!Array.isArray(userIsFollowing) || userIsFollowing.length === 0) {
      console.log('User is not following anyone');
      return NextResponse.json({ posts: [] });
    }

    // Extract record IDs from the userIsFollowing array
    const followingRecordIds = userIsFollowing.map((record: any) => {
      console.log('Processing following record:', record);
      return typeof record === 'string' ? record : (record.id || record);
    });
    console.log('Following record IDs:', followingRecordIds);

    // Get posts from all followed users
    const posts = await base('Posts').select({
      filterByFormula: `OR(${followingRecordIds.map(id => 
        `FIND('${id}', ARRAYJOIN({FirebaseUID})) > 0`
      ).join(',')})`,
      sort: [{ field: 'DateCreated', direction: 'desc' }],
      maxRecords: 50 // Limit to 50 most recent posts
    }).all();
    console.log('Found posts count:', posts.length);

    // Get all unique user IDs from the posts
    const userIds = Array.from(new Set(
      posts.flatMap(post => (post.fields as PostFields).FirebaseUID || [])
    ));
    console.log('Unique user IDs in posts:', userIds.length);

    // Fetch user data for all authors
    const users = userIds.length > 0 ? await base('Users').select({
      filterByFormula: `OR(${userIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
    }).all() : [];
    console.log('Found user data count:', users.length);

    // Create a map of user data
    const userMap = new Map(users.map(user => [user.id, user.fields as UserFields]));

    // Map the records to include only necessary fields and add user data
    const formattedPosts = await Promise.all(posts.map(async record => {
      const postFields = record.fields as PostFields;
      const authorId = postFields.FirebaseUID?.[0];
      const authorData = authorId ? userMap.get(authorId) : null;

      // Get the best available thumbnail URL
      let thumbnailUrl = null;
      const videoId = postFields['Video ID'];
      if (videoId && typeof videoId === 'string') {
        thumbnailUrl = await getYouTubeThumbnailUrl(videoId);
      }

      return {
        id: record.id,
        fields: {
          ...postFields,
          UserName: authorData?.DisplayName || 'Anonymous',
          UserAvatar: authorData?.ProfileImage || null,
          ThumbnailURL: thumbnailUrl
        }
      };
    }));
    console.log('Formatted posts count:', formattedPosts.length);

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching following feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch following feed' },
      { status: 500 }
    );
  }
} 