// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfWIzEqGFTDkjA7_6LxskGO1_qriBhTqk",
  authDomain: "malk-6e13e.firebaseapp.com",
  projectId: "malk-6e13e",
  storageBucket: "malk-6e13e.firebasestorage.app",
  messagingSenderId: "162966769538",
  appId: "1:162966769538:web:b9f5d460660228f109499b",
  measurementId: "G-M1WCT9YVK7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// API endpoints
const API_ENDPOINTS = {
  auth: {
    verify: '/.netlify/functions/auth',
    login: '/.netlify/functions/login',
    register: '/.netlify/functions/register'
  },
  airtable: {
    base: '/.netlify/functions/airtable'
  }
};

// Application settings
const APP_SETTINGS = {
  itemsPerPage: 12,
  maxUploadSize: 100 * 1024 * 1024, // 100MB
  supportedFormats: {
    video: ['mp4', 'webm', 'mov'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
}; 