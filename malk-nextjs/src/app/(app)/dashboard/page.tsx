// Metadata for this page is handled in 'page-metadata.ts' (server file)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOutUser } from '@/lib/firebase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Redirect to login if not authenticated
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-lighter">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          <div className="bg-dark rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Welcome, {user?.email}</h2>
            <p className="text-gray-300 mb-4">
              This is your personal dashboard. You can manage your content and account settings from here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <Link 
                href="/content" 
                className="bg-primary/20 hover:bg-primary/30 p-4 rounded-lg transition-colors"
              >
                <h3 className="text-lg font-medium text-primary-light">Content</h3>
                <p className="text-gray-400 text-sm">Manage your content</p>
              </Link>
              
              <Link 
                href="/posts" 
                className="bg-primary/20 hover:bg-primary/30 p-4 rounded-lg transition-colors"
              >
                <h3 className="text-lg font-medium text-primary-light">Posts</h3>
                <p className="text-gray-400 text-sm">View and edit your posts</p>
              </Link>
              
              <div className="bg-primary/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-primary-light">Account</h3>
                <p className="text-gray-400 text-sm">Manage your account settings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="text-gray-300">You signed in to your account</p>
                <p className="text-gray-500 text-sm">Just now</p>
              </div>
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="text-gray-300">Your account was created</p>
                <p className="text-gray-500 text-sm">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 