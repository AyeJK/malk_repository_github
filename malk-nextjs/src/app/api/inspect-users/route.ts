import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    // Fetch users from Airtable
    const usersTable = base('Users');
    
    // Get the first few records to inspect the structure
    const records = await usersTable.select({
      maxRecords: 5
    }).all();
    
    // Extract field names from the first record
    const fieldNames = records.length > 0 ? Object.keys(records[0].fields) : [];
    
    // Map records to user objects with all fields
    const users = records.map(record => {
      return {
        id: record.id,
        fields: record.fields
      };
    });
    
    return NextResponse.json({ 
      fieldNames,
      users,
      message: 'Users table structure inspected successfully'
    });
  } catch (error) {
    console.error('Error inspecting users table:', error);
    return NextResponse.json(
      { error: 'Failed to inspect users table' },
      { status: 500 }
    );
  }
} 