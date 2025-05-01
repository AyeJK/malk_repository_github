'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function ImportPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('importFile', file);

      const response = await fetch('/api/import-posts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import posts');
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsImporting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Import Posts</h1>
        <p>Please log in to import posts.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Import Posts</h1>
      
      <div className="mb-6">
        <label className="block mb-2">
          Import File:
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="block w-full mt-1"
          />
        </label>
      </div>

      <button
        onClick={handleImport}
        disabled={!file || isImporting}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isImporting ? 'Importing...' : 'Import Posts'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Import Results</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded ${
                  result.success ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <p className="font-bold">{result.postId}</p>
                <p>Video Title: {result.videoTitle || 'N/A'}</p>
                {result.error && (
                  <p className="text-red-700">Error: {result.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 