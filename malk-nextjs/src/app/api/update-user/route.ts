import { NextRequest, NextResponse } from 'next/server';
import { base } from '@/lib/airtable';
import { cert, initializeApp, getApps, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    // Get all required credentials
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    // Log credential presence (not the actual values)
    console.log('Firebase Admin credentials check:', {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey,
      privateKeyLength: privateKey?.length
    });

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials');
    }

    // Format the private key
    let formattedPrivateKey = privateKey;
    if (privateKey.includes('\\n')) {
      console.log('Formatting private key - replacing \\n with newlines');
      formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Create the service account config
    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey
    };

    // Initialize Firebase Admin
    initializeApp({
      credential: cert(serviceAccount)
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
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
        console.log('Attempting to verify Firebase ID token');
        const decodedToken = await getAuth().verifyIdToken(idToken);
        uid = decodedToken.uid;
        console.log('Successfully authenticated with Firebase ID token:', uid);
      } catch (verifyError) {
        console.error('Error verifying Firebase ID token:', verifyError);
      }
    } else {
      console.log('No Bearer token found in Authorization header');
    }

    // If Firebase auth failed, try NextAuth session
    if (!uid) {
      console.log('Attempting to get NextAuth session');
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        uid = session.user.id;
        console.log('Successfully authenticated with NextAuth session:', uid);
      } else {
        console.log('No NextAuth session found');
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

    try {
      // Get the user's Airtable record using Firebase UID
      console.log('Fetching user record from Airtable with UID:', uid);
      const userRecords = await base('Users').select({
        filterByFormula: `{FirebaseUID} = '${uid}'`,
        maxRecords: 1
      }).firstPage();

      if (userRecords.length === 0) {
        console.error('User not found in Airtable:', uid);
        return new NextResponse(
          JSON.stringify({ error: 'User not found' }),
          { status: 404 }
        );
      }

      const userRecord = userRecords[0];
      console.log('Found user record:', userRecord.id);

      // Make sure the user is updating their own record
      if (userRecord.id !== data.id) {
        console.error('User ID mismatch:', { recordId: userRecord.id, requestedId: data.id });
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized to update this user' }),
          { status: 403 }
        );
      }

      // Update user record in Airtable
      console.log('Updating user record in Airtable');
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
            BannerImage: data.bannerImage || ''
          }
        }
      ]);

      console.log('User record updated successfully');
      return new NextResponse(
        JSON.stringify({ success: true, record: records[0] }),
        { status: 200 }
      );
    } catch (airtableError) {
      console.error('Airtable operation error:', airtableError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database operation failed',
          details: airtableError instanceof Error ? airtableError.message : 'Unknown database error'
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in update-user route:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 