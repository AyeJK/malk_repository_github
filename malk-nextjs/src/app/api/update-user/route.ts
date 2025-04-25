import { NextRequest, NextResponse } from 'next/server';
import { base } from '@/lib/airtable';
import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401 }
      );
    }

    // Get the ID token
    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const data = await request.json();
      console.log('Update data:', data);

      // Validate required fields
      if (!data.displayName) {
        return new NextResponse(
          JSON.stringify({ error: 'Display name is required' }),
          { status: 400 }
        );
      }

      // Get the user's Airtable record using Firebase UID
      const userRecords = await base('Users').select({
        filterByFormula: `{FirebaseUID} = '${uid}'`,
        maxRecords: 1
      }).firstPage();

      if (userRecords.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: 'User not found' }),
          { status: 404 }
        );
      }

      const userRecord = userRecords[0];

      // Make sure the user is updating their own record
      if (userRecord.id !== data.id) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized to update this user' }),
          { status: 403 }
        );
      }

      // Update user record in Airtable
      const records = await base('Users').update([
        {
          id: data.id,
          fields: {
            DisplayName: data.displayName,
            FirstName: data.firstName || '',
            LastName: data.lastName || '',
            Email: data.email || '',
            Bio: data.bio || '',
            SocialLink: data.socialLink || '',
            ProfileImage: data.profileImage || '',
            BannerImage: data.bannerImage || '',
            LastModified: new Date().toISOString()
          }
        }
      ]);

      return new NextResponse(
        JSON.stringify({ success: true, record: records[0] }),
        { status: 200 }
      );
    } catch (verifyError) {
      console.error('Error verifying ID token:', verifyError);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid ID token' }),
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 