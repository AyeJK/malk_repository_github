import { NextRequest, NextResponse } from 'next/server';
import { getUserByFirebaseUID, getNotificationsForUser, markNotificationAsRead } from '@/lib/airtable';

// GET /api/notifications?firebaseUID=xxx&onlyUnread=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const firebaseUID = searchParams.get('firebaseUID');
  const onlyUnread = searchParams.get('onlyUnread') === 'true';

  if (!firebaseUID) {
    return NextResponse.json({ error: 'Missing firebaseUID' }, { status: 400 });
  }

  // Get the user's Airtable record ID
  const user = await getUserByFirebaseUID(firebaseUID);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const notifications = await getNotificationsForUser(user.id, { onlyUnread });
  return NextResponse.json({ notifications });
}

// PATCH /api/notifications (body: { notificationId })
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { notificationId } = body;
  if (!notificationId) {
    return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
  }
  const success = await markNotificationAsRead(notificationId);
  if (!success) {
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 