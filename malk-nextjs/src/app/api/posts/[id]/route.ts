import { NextResponse } from 'next/server';
import { getAirtableClient } from '@/lib/airtable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PATCH: Edit post
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const postId = params.id;
    const body = await request.json();
    const airtable = getAirtableClient();
    const table = airtable.table('Posts');
    // Fetch post to verify ownership
    const record = await table.find(postId);
    const firebaseUIDs = record.fields.FirebaseUID;
    if (!record || !Array.isArray(firebaseUIDs) || firebaseUIDs[0] !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Only allow editing certain fields
    const allowedFields = ['UserCaption', 'UserTags', 'Categories'];
    const updateFields: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateFields[key] = body[key];
      }
    }
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    const updated = await table.update(postId, updateFields);
    return NextResponse.json({ post: { id: updated.id, ...updated.fields } });
  } catch (error) {
    console.error('Error editing post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete post
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const postId = params.id;
    const airtable = getAirtableClient();
    const table = airtable.table('Posts');
    // Fetch post to verify ownership
    const record = await table.find(postId);
    const firebaseUIDs = record.fields.FirebaseUID;
    if (!record || !Array.isArray(firebaseUIDs) || firebaseUIDs[0] !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await table.destroy(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 