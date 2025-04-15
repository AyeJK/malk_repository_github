import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PAT || process.env.AIRTABLE_PAT,
    }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || '');

    // Generate unique test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testUid = `test-uid-${Date.now()}`;
    const now = new Date().toISOString();

    // Create a new user record
    const newFields = {
      FirebaseUID: testUid,
      Email: testEmail,
      CreatedAt: now,
      LastLogin: now,
      Role: 'User',
      DisplayName: `Test User ${Date.now()}`
    };

    try {
      // Try to create the record
      const newRecord = await base('Users').create([
        {
          fields: newFields
        }
      ]);

      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        record: {
          id: newRecord[0].id,
          fields: newRecord[0].fields
        }
      });
    } catch (createError: any) {
      return NextResponse.json({
        success: false,
        message: 'Error creating test user',
        error: createError.message || 'Unknown error',
        details: createError
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Error connecting to Airtable',
      error: error.message || 'Unknown error'
    });
  }
} 