import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables (without exposing sensitive data)
    const hasPat = !!(process.env.NEXT_PUBLIC_AIRTABLE_PAT || process.env.AIRTABLE_PAT);
    const hasBaseId = !!(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID);
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables checked',
      hasPat,
      hasBaseId,
      baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'Not set',
      nodeEnv: process.env.NODE_ENV,
      // Add other environment variables that might be relevant
      hasFirebaseConfig: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                           process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
                           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    });
  } catch (error: any) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking environment variables',
      error: error.message || 'Unknown error'
    });
  }
} 