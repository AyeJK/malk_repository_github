'use client';

import { useState } from 'react';

export default function NoApiTestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">No API Test Page</h1>
        
        <div className="bg-green-900/50 border border-green-500 rounded p-4 mb-4">
          <p className="text-green-400">
            This page doesn't use any API calls. If you can see this page and interact with the counter, React is working correctly.
          </p>
          <div className="mt-4">
            <p className="text-lg">Counter: {count}</p>
            <button
              onClick={() => setCount(count + 1)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Increment Counter
            </button>
          </div>
          <div className="mt-4 text-sm">
            <p>Timestamp: {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 