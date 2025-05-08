import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID!);

export const dynamic = "force-dynamic";

// GET endpoint to fetch profile sections
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get the user record to find their custom sections
    const userRecords = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`
    }).all();

    if (userRecords.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRecord = userRecords[0];
    let customSections = userRecord.fields.CustomSections || '[]';
    if (typeof customSections === 'string') {
      try {
        customSections = JSON.parse(customSections);
      } catch (e) {
        customSections = [];
      }
    }

    return NextResponse.json({ sections: customSections });
  } catch (error) {
    console.error('Error fetching profile sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile sections' },
      { status: 500 }
    );
  }
}

// POST endpoint to save profile sections
export async function POST(request: NextRequest) {
  try {
    const { userId, sections } = await request.json();

    if (!userId || !sections) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the user record
    const userRecords = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${userId}'`
    }).all();

    if (userRecords.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRecord = userRecords[0];

    // Update the user's custom sections as a JSON string
    await base('Users').update([
      {
        id: userRecord.id,
        fields: {
          CustomSections: JSON.stringify(sections)
        }
      }
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving profile sections:', error);
    return NextResponse.json(
      { error: 'Failed to save profile sections' },
      { status: 500 }
    );
  }
} 