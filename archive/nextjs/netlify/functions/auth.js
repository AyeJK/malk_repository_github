// Import required modules
const firebaseAdmin = require('firebase-admin');

// Initialize Firebase Admin
let serviceAccount;
try {
  // Try to load service account from environment variable (for Netlify deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback for local development
    serviceAccount = require('../../service-account.json');
  }
} catch (error) {
  console.error('Error loading service account:', error);
}

// Initialize Firebase Admin with service account
if (serviceAccount) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
  });
} else {
  console.error('Firebase Admin initialization failed: No service account found');
}

// Handler for Netlify Functions
exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { idToken } = JSON.parse(event.body);

    if (!idToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID token is required' })
      };
    }

    // Verify the ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    
    // Return user information
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0]
      })
    };
  } catch (error) {
    console.error('Error verifying ID token:', error);
    
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid ID token' })
    };
  }
}; 