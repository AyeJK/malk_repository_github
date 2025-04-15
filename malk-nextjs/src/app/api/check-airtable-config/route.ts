import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    // Check environment variables
    const hasApiKey = !!process.env.AIRTABLE_PAT;
    const hasBaseId = !!process.env.AIRTABLE_BASE_ID;
    const baseId = process.env.AIRTABLE_BASE_ID;
    
    // Try to initialize Airtable
    let base;
    let connectionTest = false;
    let errorMessage = '';
    
    if (hasApiKey && hasBaseId) {
      try {
        base = new Airtable({
          apiKey: process.env.AIRTABLE_PAT
        }).base(process.env.AIRTABLE_BASE_ID || '');
        
        // Try to access the Users table
        const records = await base('Users').select({
          maxRecords: 1
        }).firstPage();
        
        connectionTest = true;
      } catch (error: any) {
        errorMessage = error.message || 'Unknown error';
      }
    }
    
    return NextResponse.json({
      hasApiKey,
      hasBaseId,
      baseId,
      connectionTest,
      errorMessage
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to check Airtable configuration: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 