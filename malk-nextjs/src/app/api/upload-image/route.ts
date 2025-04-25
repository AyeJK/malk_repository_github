import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminStorage } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No Bearer token' }, { status: 401 });
    }

    // Verify the token using Admin SDK
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const auth = getFirebaseAdminAuth();
      await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ 
        error: 'Invalid token',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${type}_${timestamp}_${file.name}`;
    
    try {
      // Get the storage instance
      const storage = getFirebaseAdminStorage();
      const bucket = storage.bucket();
      
      // Create a file in the bucket
      const fileBuffer = await file.arrayBuffer();
      const fileBufferArray = new Uint8Array(fileBuffer);
      
      const fileUpload = bucket.file(`uploads/${filename}`);
      await fileUpload.save(Buffer.from(fileBufferArray), {
        metadata: {
          contentType: file.type,
        },
      });

      // Make the file publicly accessible
      await fileUpload.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

      return NextResponse.json({ url: publicUrl });
    } catch (error) {
      console.error('Storage operation error:', error);
      return NextResponse.json({ 
        error: 'Failed to upload file to storage',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 