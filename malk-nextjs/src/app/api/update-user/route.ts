import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { base } from '@/lib/airtable';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Log the session for debugging
    console.log('Session in update-user:', session);
    
    if (!session?.user) {
      console.log('No session user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Update data:', data);

    // Validate required fields
    if (!data.displayName) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    // Make sure the user is updating their own record
    if (session.user.airtableId !== data.id) {
      console.log('Session user ID:', session.user.airtableId);
      console.log('Requested update ID:', data.id);
      return NextResponse.json({ error: 'Unauthorized to update this user' }, { status: 403 });
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

    return NextResponse.json({ success: true, record: records[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 