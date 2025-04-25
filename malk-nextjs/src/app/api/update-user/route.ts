import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { base } from '@/lib/airtable';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    console.log('Update user request received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const session = await getServerSession(authOptions);
    console.log('Session from getServerSession:', session);
    
    if (!session?.user) {
      console.log('No session user found');
      return NextResponse.json({ error: 'Unauthorized - No session user' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Update data received:', data);

    // Validate required fields
    if (!data.displayName) {
      console.log('Missing required field: displayName');
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    // Make sure the user is updating their own record
    if (session.user.airtableId !== data.id) {
      console.log('Session user ID:', session.user.airtableId);
      console.log('Requested update ID:', data.id);
      return NextResponse.json({ error: 'Unauthorized - User ID mismatch' }, { status: 403 });
    }

    // Update user record in Airtable
    console.log('Attempting Airtable update for user:', data.id);
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

    console.log('Airtable update successful:', records[0].id);
    return NextResponse.json({ success: true, record: records[0] });
  } catch (error: any) {
    console.error('Error in update-user:', error);
    return NextResponse.json(
      { error: `Failed to update user profile: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 