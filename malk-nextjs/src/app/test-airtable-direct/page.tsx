'use client';

import { useState, useEffect } from 'react';

export default function TestAirtableDirectPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch('/api/test-airtable-direct');
        const data = await response.json();
        setConnectionStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check Airtable connection');
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Direct Airtable Connection Test</h1>
        
        {loading ? (
          <p>Loading connection status...</p>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            <div className={`p-4 rounded mb-4 ${connectionStatus?.success ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
              <p className={connectionStatus?.success ? 'text-green-400' : 'text-red-400'}>
                {connectionStatus?.message}
              </p>
              {connectionStatus?.error && (
                <p className="text-red-400 mt-2">Error: {connectionStatus.error}</p>
              )}
              <div className="mt-2 text-sm">
                <p>Base ID: {connectionStatus?.baseId}</p>
                <p>PAT Available: {connectionStatus?.patAvailable ? 'Yes' : 'No'}</p>
                <p>Users Table Exists: {connectionStatus?.usersTableExists ? 'Yes' : 'No'}</p>
                {connectionStatus?.recordCount !== undefined && (
                  <p>Record Count: {connectionStatus.recordCount}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 