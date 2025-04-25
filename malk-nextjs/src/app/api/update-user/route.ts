import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { base } from '@/lib/airtable';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Log headers for debugging
    const headers = Object.fromEntries(request.headers);
    console.log('Request headers:', headers);
    
    const session = await getServerSession(authOptions);
    
    // Log the session and auth options for debugging
    console.log('Auth options:', {
      secret: authOptions.secret ? 'present' : 'missing',
      providers: authOptions.providers.map(p => p.name),
      cookies: authOptions.cookies ? 'configured' : 'not configured'
    });
    console.log('Session in update-user:', session);
    
    if (!session?.user) {
      console.log('No session user found');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - No session' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await request.json();
    console.log('Update data:', data);

    // Validate required fields
    if (!data.displayName) {
      return new NextResponse(
        JSON.stringify({ error: 'Display name is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Make sure the user is updating their own record
    if (!session.user.airtableId || session.user.airtableId !== data.id) {
      console.log('Session user ID:', session.user.airtableId);
      console.log('Requested update ID:', data.id);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized to update this user',
          sessionUserId: session.user.airtableId,
          requestedId: data.id
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
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
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 