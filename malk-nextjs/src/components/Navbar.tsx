'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, airtableUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-lobster text-white">
          Malk.tv <span className="text-blue-300 text-sm bg-blue-900/30 px-2 py-0.5 rounded-full">Beta</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            href="/posts" 
            className="text-white hover:text-blue-300 transition-colors"
          >
            Browse Videos
          </Link>
          
          {user ? (
            <>
              <Link 
                href="/posts/create" 
                className="text-white hover:text-blue-300 transition-colors"
              >
                Share Video
              </Link>
              <span className="text-white">
                {airtableUser?.fields.DisplayName || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-blue-300 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/signup" 
                className="text-white hover:text-blue-300 transition-colors"
              >
                Sign Up
              </Link>
              <Link 
                href="/login" 
                className="text-white hover:text-blue-300 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="text-white hover:text-blue-300 transition-colors"
              >
                Share Video
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 