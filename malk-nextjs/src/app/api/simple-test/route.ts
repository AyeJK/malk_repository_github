import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Simple test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in simple test endpoint:', error);
    return NextResponse.json({
      success: false,
      message: 'Error in simple test endpoint',
      error: error.message || 'Unknown error'
    });
  }
} 