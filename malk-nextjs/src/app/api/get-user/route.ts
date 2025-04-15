import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    // Get user IDs from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userIds = searchParams.get('ids')?.split(',') || [];
    
    console.log('Fetching users with IDs:', userIds);
    
    if (userIds.length === 0) {
      console.log('No user IDs provided');
      return NextResponse.json({ users: [] });
    }
    
    // Fetch users from Airtable
    const usersTable = base('Users');
    
    // Try to get all records without specifying a view
    const records = await usersTable.select({
      filterByFormula: `OR(${userIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
    }).all();
    
    console.log(`Found ${records.length} user records`);
    
    // Map records to user objects
    const users = records.map(record => {
      console.log('User record fields:', Object.keys(record.fields));
      
      // Try different field names for the display name
      let displayName = null;
      
      // Check for common field names
      if (record.fields.DisplayName) {
        displayName = record.fields.DisplayName;
      } else if (record.fields.displayName) {
        displayName = record.fields.displayName;
      } else if (record.fields.Name) {
        displayName = record.fields.Name;
      } else if (record.fields.name) {
        displayName = record.fields.name;
      } else if (record.fields.Username) {
        displayName = record.fields.Username;
      } else if (record.fields.username) {
        displayName = record.fields.username;
      } else if (record.fields.Email) {
        displayName = record.fields.Email;
      } else if (record.fields.email) {
        displayName = record.fields.email;
      }
      
      console.log('DisplayName found:', displayName);
      
      return {
        id: record.id,
        name: displayName || 'Anonymous User',
        fields: record.fields
      };
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 