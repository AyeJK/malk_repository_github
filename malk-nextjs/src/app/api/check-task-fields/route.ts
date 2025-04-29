import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    const base = new Airtable({
      apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PAT || process.env.AIRTABLE_PAT,
    }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || '');

    // Get the first record to inspect its fields
    const records = await base('Tasks').select({ maxRecords: 1 }).firstPage();
    
    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No records found in Tasks table'
      });
    }

    const firstRecord = records[0];
    const fields = Object.keys(firstRecord.fields);

    return NextResponse.json({
      success: true,
      message: 'Task fields retrieved successfully',
      fields,
      sampleRecord: firstRecord.fields
    });
  } catch (error: any) {
    console.error('Error checking task fields:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking task fields',
      error: error.message || 'Unknown error'
    });
  }
} 