import { NextRequest, NextResponse } from 'next/server';
import { getUserByFirebaseUID } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    // Get Firebase UID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const firebaseUID = searchParams.get('ids');
    
    console.log('Fetching user with Firebase UID:', firebaseUID);
    
    if (!firebaseUID) {
      console.log('No Firebase UID provided');
      return NextResponse.json({ users: [] });
    }
    
    // Fetch user from Airtable using Firebase UID
    const user = await getUserByFirebaseUID(firebaseUID);
    
    if (!user) {
      console.log('No user found with Firebase UID:', firebaseUID);
      return NextResponse.json({ users: [] });
    }
    
    console.log('Found user record');
    
    // Map record to user object
    const userData = {
      id: user.id,
      name: user.fields.DisplayName || user.fields.Email || 'Anonymous User',
      fields: user.fields
    };
    
    return NextResponse.json({ users: [userData] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 