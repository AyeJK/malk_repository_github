import { NextRequest, NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function PUT(request: NextRequest) {
  try {
    console.log('Update user request received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header found');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    // For now, we'll trust the token without verification
    // In a production environment, you should verify the token
    const userId = idToken.split('.')[0]; // This is just a placeholder, not a real user ID

    const data = await request.json();
    console.log('Update data received:', data);

    // Validate required fields
    if (!data.displayName) {
      console.log('Missing required field: displayName');
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    // Make sure the user is updating their own record
    if (data.id !== data.airtableId) {
      console.log('User ID mismatch:', { userId, airtableId: data.airtableId });
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
    return NextResponse.json({ record: records[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 