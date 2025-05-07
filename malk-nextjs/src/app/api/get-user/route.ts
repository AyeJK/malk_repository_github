import { NextRequest, NextResponse } from 'next/server';
import { getUserByFirebaseUID } from '@/lib/airtable';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    // Get ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('ids');
    
    console.log('Fetching user with ID:', id);
    
    if (!id) {
      console.log('No ID provided');
      return NextResponse.json({ users: [] });
    }

    let user = null;
    
    // First try to get user by Airtable record ID
    if (id.startsWith('rec')) {
      console.log('ID appears to be an Airtable record ID, fetching directly...');
      try {
        const records = await base('Users').select({
          filterByFormula: `RECORD_ID() = '${id}'`,
          maxRecords: 1
        }).firstPage();
        
        if (records.length > 0) {
          user = {
            id: records[0].id,
            fields: records[0].fields
          };
        }
      } catch (error) {
        console.error('Error fetching by Airtable record ID:', error);
      }
    }
    
    // If not found by record ID, try DisplayName (username)
    if (!user) {
      console.log('Trying to fetch user by DisplayName:', id);
      try {
        const records = await base('Users').select({
          filterByFormula: `{DisplayName} = '${id}'`,
          maxRecords: 1
        }).firstPage();
        if (records.length > 0) {
          user = {
            id: records[0].id,
            fields: records[0].fields
          };
        }
      } catch (error) {
        console.error('Error fetching by DisplayName:', error);
      }
    }
    
    // If not found by DisplayName, try Firebase UID
    if (!user) {
      console.log('Trying to fetch user by Firebase UID:', id);
      user = await getUserByFirebaseUID(id);
    }

    if (!user) {
      console.log('No user found with ID:', id);
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