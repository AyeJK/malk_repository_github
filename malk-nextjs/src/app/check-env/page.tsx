'use client';

import { useState, useEffect } from 'react';

export default function CheckEnvPage() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkEnv() {
      try {
        const response = await fetch('/api/check-env');
        const data = await response.json();
        setEnvStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check environment variables');
      } finally {
        setLoading(false);
      }
    }

    checkEnv();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
        
        {loading ? (
          <p>Loading environment variables status...</p>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Environment Variables Status</h2>
            <div className={`p-4 rounded mb-4 ${envStatus?.success ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
              <p className={envStatus?.success ? 'text-green-400' : 'text-red-400'}>
                {envStatus?.message}
              </p>
              {envStatus?.error && (
                <p className="text-red-400 mt-2">Error: {envStatus.error}</p>
              )}
              <div className="mt-2 text-sm">
                <p>Airtable PAT Available: {envStatus?.hasPat ? 'Yes' : 'No'}</p>
                <p>Airtable Base ID Available: {envStatus?.hasBaseId ? 'Yes' : 'No'}</p>
                <p>Airtable Base ID: {envStatus?.baseId}</p>
                <p>Node Environment: {envStatus?.nodeEnv}</p>
                <p>Firebase Config Available: {envStatus?.hasFirebaseConfig ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 