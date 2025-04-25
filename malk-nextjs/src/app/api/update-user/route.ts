import { NextRequest, NextResponse } from 'next/server';
import { base } from '@/lib/airtable';
import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  // Get the private key
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  
  // Check if we have all required credentials
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
    console.error('Missing Firebase Admin credentials:', {
      projectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: !!privateKey
    });
    throw new Error('Firebase Admin credentials not configured');
  }

  // Format the private key correctly
  const formattedPrivateKey = privateKey.includes('\\n') 
    ? privateKey.replace(/\\n/g, '\n')
    : privateKey;

  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export async function PUT(request: NextRequest) {
  try {
    let uid: string | undefined;

    // First try to get the user from the Firebase ID token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(idToken);
        uid = decodedToken.uid;
        console.log('Authenticated with Firebase ID token:', uid);
      } catch (verifyError) {
        console.error('Error verifying Firebase ID token:', verifyError);
      }
    }

    // If Firebase auth failed, try NextAuth session
    if (!uid) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        uid = session.user.id;
        console.log('Authenticated with NextAuth session:', uid);
      }
    }

    // If both auth methods failed, return unauthorized
    if (!uid) {
      console.error('No valid authentication found');
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401 }
      );
    }

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