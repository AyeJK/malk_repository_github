'use client';

import { useState } from 'react';

export default function ManualTestPage() {
  const [testStatus, setTestStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/basic-test');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTestStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test basic endpoint');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manual Test Page</h1>
        
        <button
          onClick={runTest}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-500"
        >
          {loading ? 'Testing...' : 'Run Test'}
        </button>
        
        {loading ? (
          <p>Loading test status...</p>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : testStatus ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Test Status</h2>
            <div className={`p-4 rounded mb-4 ${testStatus?.success ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
              <p className={testStatus?.success ? 'text-green-400' : 'text-red-400'}>
                {testStatus?.message}
              </p>
              {testStatus?.error && (
                <p className="text-red-400 mt-2">Error: {testStatus.error}</p>
              )}
              <div className="mt-2 text-sm">
                <p>Timestamp: {testStatus?.timestamp}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 