import { NextResponse } from 'next/server';
import { getAirtableClient } from '@/lib/airtable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuth } from 'firebase-admin/auth';

export const dynamic = 'force-dynamic';

// PATCH: Edit post
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    let uid: string | undefined;

    // 1. Check for Firebase ID token in Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(idToken);
        uid = decodedToken.uid;
      } catch (err) {
        console.error('Error verifying Firebase ID token:', err);
      }
    }

    // 2. Fallback to NextAuth session if no Firebase token
    if (!uid) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        uid = session.user.id;
      }
    }

    // 3. If no valid auth, reject
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const airtable = getAirtableClient();
    const table = airtable.table('Posts');
    // Fetch post to verify ownership
    const record = await table.find(postId);
    const firebaseUIDs = record.fields.FirebaseUID;
    // Look up Airtable user record ID for this Firebase UID
    const usersTable = airtable.table('Users');
    const userRecords = await usersTable.select({
      filterByFormula: `{FirebaseUID} = '${uid}'`,
      maxRecords: 1
    }).firstPage();
    const userAirtableId = userRecords[0]?.id;
    if (!record || !Array.isArray(firebaseUIDs) || firebaseUIDs[0] !== userAirtableId) {
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
    // LOGGING: Show incoming body, updateFields, and UserTags
    console.log('PATCH /api/posts/[id] incoming body:', body);
    console.log('PATCH /api/posts/[id] computed updateFields:', updateFields);
    if (updateFields.UserTags) {
      console.log('PATCH /api/posts/[id] UserTags:', updateFields.UserTags);
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
    let uid: string | undefined;

    // 1. Check for Firebase ID token in Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(idToken);
        uid = decodedToken.uid;
      } catch (err) {
        console.error('Error verifying Firebase ID token:', err);
      }
    }

    // 2. Fallback to NextAuth session if no Firebase token
    if (!uid) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        uid = session.user.id;
      }
    }

    // 3. If no valid auth, reject
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const airtable = getAirtableClient();
    const table = airtable.table('Posts');
    // Fetch post to verify ownership
    const record = await table.find(postId);
    const firebaseUIDs = record.fields.FirebaseUID;
    // Look up Airtable user record ID for this Firebase UID
    const usersTable = airtable.table('Users');
    const userRecords = await usersTable.select({
      filterByFormula: `{FirebaseUID} = '${uid}'`,
      maxRecords: 1
    }).firstPage();
    const userAirtableId = userRecords[0]?.id;
    if (!record || !Array.isArray(firebaseUIDs) || firebaseUIDs[0] !== userAirtableId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await table.destroy(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 