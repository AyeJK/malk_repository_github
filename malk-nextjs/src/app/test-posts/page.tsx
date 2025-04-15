'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestPostsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTestPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/create-test-post');
      const data = await response.json();
      setResult(data);
      
      if (!data.success) {
        setError(data.message || 'Failed to create test post');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Posts API</h1>
        
        <div className="mb-8">
          <button
            onClick={createTestPost}
            disabled={loading}
            className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Test Post'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded mb-6">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Result</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8">
          <Link href="/" className="text-blue-400 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 