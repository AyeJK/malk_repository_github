'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ processed: number; total: number; percentage: number } | null>(null);
  const [skippedPosts, setSkippedPosts] = useState<string[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setResults([]);
      setProgress(null);
      setSkippedPosts([]);
      setImportErrors([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv']
    },
    maxFiles: 1
  });

  const handleImport = async () => {
    if (!file || !user) return;

    setIsImporting(true);
    setError(null);
    setResults([]);
    setProgress(null);
    setSkippedPosts([]);
    setImportErrors([]);

    try {
      const formData = new FormData();
      formData.append('importFile', file);

      const response = await fetch('/api/import-posts', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import posts');
      }

      setResults(data.results || []);
      setProgress(data.progress || null);
      setSkippedPosts(data.skippedPosts || []);
      setImportErrors(data.errors || []);

    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.message || 'An error occurred during import');
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Import Posts</h1>
        <p>Loading authentication status...</p>
      </div>
    );
  }

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
      
      <div {...getRootProps()} className={`border-2 border-dashed p-8 mb-4 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
        <input {...getInputProps()} />
        {file ? (
          <p>Selected file: {file.name}</p>
        ) : isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag and drop a file here, or click to select a file</p>
        )}
      </div>

      {file && (
        <button
          onClick={handleImport}
          disabled={isImporting}
          className={`bg-blue-500 text-white px-4 py-2 rounded ${isImporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {isImporting ? 'Importing...' : 'Start Import'}
        </button>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {progress && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Import Progress</h2>
          <p>Processed {progress.processed} of {progress.total} posts ({progress.percentage}%)</p>
        </div>
      )}

      {skippedPosts.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Skipped Posts</h2>
          <p>The following posts were skipped because they already exist:</p>
          <ul className="list-disc pl-6 mt-2">
            {skippedPosts.map((url, index) => (
              <li key={index} className="text-gray-700">{url}</li>
            ))}
          </ul>
        </div>
      )}

      {importErrors.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Import Errors</h2>
          <ul className="list-disc pl-6 mt-2">
            {importErrors.map((error, index) => (
              <li key={index} className="text-red-600">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Import Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Video URL</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Video Title</th>
                  <th className="px-4 py-2 text-left">Error</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 break-all">{result.videoURL}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.success ? (result.skipped ? 'Skipped' : 'Success') : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{result.videoTitle || 'N/A'}</td>
                    <td className="px-4 py-2 text-red-600">{result.error || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 