'use client';

import { useState, useEffect } from 'react';
import { upsertUser } from '@/lib/airtable';
import Link from 'next/link';

export default function TestAirtablePage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [serverTestResult, setServerTestResult] = useState<any>(null);
  const [serverTestLoading, setServerTestLoading] = useState(false);
  const [serverTestError, setServerTestError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch('/api/test-airtable');
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

  const handleCreateTestUser = async () => {
    try {
      setCreatingUser(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('Starting test user creation...');
      
      // Create a test user with a unique identifier
      const testEmail = `test-${Date.now()}@example.com`;
      const testUid = `test-uid-${Date.now()}`;
      
      console.log('Test user data:', { email: testEmail, firebaseUID: testUid });
      
      // Store debug info before the API call
      setDebugInfo({
        step: 'Before API call',
        email: testEmail,
        firebaseUID: testUid,
        timestamp: new Date().toISOString()
      });
      
      // Create a test user
      const testUser = await upsertUser({
        email: testEmail,
        firebaseUID: testUid,
        displayName: `Test User ${Date.now()}`,
        postCount: 0
      });
      
      console.log('Test user creation result:', testUser);
      
      // Update debug info after the API call
      setDebugInfo((prev: any) => ({
        ...prev,
        step: 'After API call',
        result: testUser ? 'Success' : 'Failed',
        timestamp: new Date().toISOString()
      }));
      
      setTestResult(testUser);
    } catch (err: any) {
      console.error('Error creating test user:', err);
      
      // Update debug info with error details
      setDebugInfo((prev: any) => ({
        ...prev,
        step: 'Error occurred',
        error: {
          message: err.message,
          stack: err.stack,
          name: err.name
        },
        timestamp: new Date().toISOString()
      }));
      
      setError(`Failed to create test user: ${err.message}`);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleServerSideTest = async () => {
    try {
      setServerTestLoading(true);
      setServerTestError(null);
      setServerTestResult(null);
      
      console.log('Starting server-side test user creation...');
      
      const response = await fetch('/api/create-test-user');
      const data = await response.json();
      
      console.log('Server-side test result:', data);
      
      if (data.success) {
        setServerTestResult(data.record);
      } else {
        setServerTestError(`Server-side test failed: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Error with server-side test:', err);
      setServerTestError(`Server-side test error: ${err.message}`);
    } finally {
      setServerTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Airtable Connection Test</h1>
        
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
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Client-Side Test</h2>
          <button
            onClick={handleCreateTestUser}
            disabled={creatingUser || !connectionStatus?.success}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingUser ? 'Creating...' : 'Create Test User (Client-Side)'}
          </button>
          
          {testResult && (
            <div className="mt-4 bg-green-900/50 border border-green-500 rounded p-4">
              <p className="text-green-400">Test user created successfully!</p>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
          
          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-500 rounded p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          {debugInfo && (
            <div className="mt-4 bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="text-lg font-medium mb-2">Debug Information</h3>
              <div className="text-sm">
                <p><strong>Step:</strong> {debugInfo.step}</p>
                <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
                {debugInfo.email && <p><strong>Email:</strong> {debugInfo.email}</p>}
                {debugInfo.firebaseUID && <p><strong>Firebase UID:</strong> {debugInfo.firebaseUID}</p>}
                {debugInfo.result && <p><strong>Result:</strong> {debugInfo.result}</p>}
                {debugInfo.error && (
                  <div className="mt-2">
                    <p><strong>Error:</strong></p>
                    <pre className="mt-1 text-xs overflow-auto bg-gray-900 p-2 rounded">
                      {JSON.stringify(debugInfo.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Server-Side Test</h2>
          <button
            onClick={handleServerSideTest}
            disabled={serverTestLoading || !connectionStatus?.success}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {serverTestLoading ? 'Creating...' : 'Create Test User (Server-Side)'}
          </button>
          
          {serverTestResult && (
            <div className="mt-4 bg-green-900/50 border border-green-500 rounded p-4">
              <p className="text-green-400">Server-side test user created successfully!</p>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(serverTestResult, null, 2)}
              </pre>
            </div>
          )}
          
          {serverTestError && (
            <div className="mt-4 bg-red-900/50 border border-red-500 rounded p-4">
              <p className="text-red-400">{serverTestError}</p>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <Link href="/test-posts" className="text-blue-400 hover:underline">
            Test Posts
          </Link>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-400 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 