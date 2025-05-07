import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT
}).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    if (!username) {
      return NextResponse.json({ exists: false });
    }
    const records = await base('Users').select({
      filterByFormula: `{DisplayName} = '${username}'`,
      maxRecords: 1
    }).firstPage();
    if (records.length > 0) {
      return NextResponse.json({ exists: true });
    }
    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json({ exists: false, error: 'Server error' }, { status: 500 });
  }
} 