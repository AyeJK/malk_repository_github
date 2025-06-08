import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedPosts } from '@/lib/airtable';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = searchParams.get('offset') || undefined;

  const { posts, nextOffset } = await getPaginatedPosts({ limit, offset });

  return NextResponse.json({ posts, nextOffset });
} 