import { NextRequest, NextResponse } from 'next/server';
import { getUserByFirebaseUID, getNotificationsForUser, markNotificationAsRead } from '@/lib/airtable';
import { base } from '@/lib/airtable';

// GET /api/notifications?firebaseUID=xxx&onlyUnread=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const firebaseUID = searchParams.get('firebaseUID');
  const onlyUnread = searchParams.get('onlyUnread') === 'true';

  console.log('API /api/notifications called with firebaseUID:', firebaseUID);

  if (!firebaseUID) {
    console.log('Missing firebaseUID in request');
    return NextResponse.json({ error: 'Missing firebaseUID' }, { status: 400 });
  }

  try {
    // Get the user's Airtable record ID and notifications
    const user = await getUserByFirebaseUID(firebaseUID);
    console.log('Fetched user record:', user);
    if (!user) {
      console.log('User not found for firebaseUID:', firebaseUID);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const notificationIds = user.fields.Notifications || [];
    console.log('User notification IDs:', notificationIds);
    if (notificationIds.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    // Fetch notifications by IDs
    const filterByFormula = `OR(${notificationIds.map(id => `RECORD_ID() = '${id}'`).join(',')})` + (onlyUnread ? ` AND {Is Read} = FALSE()` : '');
    console.log('Notifications filterByFormula:', filterByFormula);
    const notifications = await base('Notifications').select({
      filterByFormula,
      sort: [{ field: 'Created At', direction: 'desc' }],
      maxRecords: 100,
    }).all();
    console.log('Fetched notifications:', notifications.length);
    return NextResponse.json({ notifications: notifications.map((record: any) => ({
      id: record.id,
      fields: record.fields,
    })) });
  } catch (err) {
    console.error('Error in /api/notifications:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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