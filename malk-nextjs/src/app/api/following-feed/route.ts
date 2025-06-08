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
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);
    const offset = request.nextUrl.searchParams.get('offset') || undefined;
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get the user's record
    const userRecord = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`,
    }).firstPage();
    if (!userRecord || userRecord.length === 0) {
      return NextResponse.json({ posts: [], nextOffset: null });
    }
    const userFields = userRecord[0].fields as UserFields;
    const userIsFollowing = userFields.UserIsFollowing || [];
    if (!Array.isArray(userIsFollowing) || userIsFollowing.length === 0) {
      return NextResponse.json({ posts: [], nextOffset: null });
    }
    // Map followed Airtable record IDs to FirebaseUIDs
    const followingUsers = await base('Users').select({
      filterByFormula: `OR(${userIsFollowing.map(id => `RECORD_ID()='${id}'`).join(',')})`,
    }).all();
    const followingFirebaseUIDs = followingUsers
      .map(user => user.fields.FirebaseUID)
      .filter(Boolean);
    if (followingFirebaseUIDs.length === 0) {
      return NextResponse.json({ posts: [], nextOffset: null });
    }
    // Build filter formula for FirebaseUIDs
    const filterFormula = `OR(${followingFirebaseUIDs.map(uid => `{FirebaseUID}='${uid}'`).join(',')})`;
    // Use Airtable REST API for pagination
    const apiKey = process.env.AIRTABLE_PAT;
    const baseId = process.env.AIRTABLE_BASE_ID;
    let url = `https://api.airtable.com/v0/${baseId}/Posts?` +
      `pageSize=${limit}` +
      `&sort[0][field]=DateCreated&sort[0][direction]=desc`;
    if (offset) url += `&offset=${offset}`;
    url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!res.ok) throw new Error('Airtable API error');
    const data = await res.json();
    const posts = data.records || [];
    // Get all unique user IDs from the posts
    const userIds = Array.from(new Set(
      posts.flatMap((post: any) => post.fields.FirebaseUID || [])
    ));
    // Fetch user data for all authors
    const users = userIds.length > 0 ? await base('Users').select({
      filterByFormula: `OR(${userIds.map(id => `RECORD_ID()='${id}'`).join(',')})`,
    }).all() : [];
    const userMap = new Map(users.map(user => [user.id, user.fields as UserFields]));
    // Map the records to include only necessary fields and add user data
    const formattedPosts = await Promise.all(posts.map(async (record: any) => {
      const postFields = record.fields as PostFields;
      const authorId = postFields.FirebaseUID?.[0];
      const authorData = authorId ? userMap.get(authorId) : null;
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
    return NextResponse.json({ posts: formattedPosts, nextOffset: data.offset || null });
  } catch (error) {
    console.error('Error fetching following feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch following feed' },
      { status: 500 }
    );
  }
} 