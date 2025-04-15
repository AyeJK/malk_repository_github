import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    // Log environment variables (without exposing sensitive data)
    const hasPat = !!(process.env.NEXT_PUBLIC_AIRTABLE_PAT || process.env.AIRTABLE_PAT);
    const hasBaseId = !!(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID);
    
    console.log('Environment variables check:', {
      hasPat,
      hasBaseId,
      baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID
    });

    // Initialize Airtable directly
    const base = new Airtable({
      apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PAT || process.env.AIRTABLE_PAT,
    }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || '');

    // Try to access the Users table
    const records = await base('Users').select({ maxRecords: 1 }).firstPage();
    
    return NextResponse.json({
      success: true,
      message: 'Airtable connection successful',
      usersTableExists: true,
      recordCount: records.length,
      baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID,
      patAvailable: hasPat
    });
  } catch (error: any) {
    console.error('Airtable connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error connecting to Airtable',
      error: error.message || 'Unknown error',
      baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID,
      patAvailable: !!(process.env.NEXT_PUBLIC_AIRTABLE_PAT || process.env.AIRTABLE_PAT)
    });
  }
} 