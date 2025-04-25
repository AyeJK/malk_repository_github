import * as admin from 'firebase-admin';

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  try {
    if (admin.apps.length > 0) {
      const app = admin.apps[0];
      if (!app) throw new Error('Firebase Admin app exists but is null');
      return app;
    }

    // Log environment variables (without sensitive data)
    console.log('Firebase Admin initialization with:', {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ? 'present' : 'missing',
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'present' : 'missing',
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'present' : 'missing',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'present' : 'missing'
    });

    // Check if all required environment variables are present
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || 
        !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 
        !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      throw new Error('Missing required Firebase Admin environment variables');
    }

    // Parse the private key, handling escaped newlines
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    // Create the service account object
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    };

    console.log('Initializing Firebase Admin with credential:', {
      project_id: serviceAccount.project_id,
      client_email: serviceAccount.client_email,
      privateKeyLength: serviceAccount.private_key.length
    });

    // Initialize with service account
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export function getFirebaseAdminAuth() {
  const app = initializeFirebaseAdmin();
  return admin.auth();
}

export function getFirebaseAdminStorage() {
  const app = initializeFirebaseAdmin();
  return admin.storage();
} 