'use client';

import { useState, useEffect } from 'react';
import { fetchRecords, ContentItem } from '@/lib/airtable';

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        console.log('Attempting to fetch records from Airtable...');
        // Replace 'Content' with your actual Airtable table name
        const data = await fetchRecords('Content');
        console.log('Airtable response:', data);
        setContent(data);
        setError(null);
      } catch (err) {
        console.error('Detailed error:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading content...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Content</h1>
      
      {content.length === 0 ? (
        <p className="text-gray-500">No content available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{item.fields.Name}</h2>
                {item.fields.Description && (
                  <p className="text-gray-600 mb-4">{item.fields.Description}</p>
                )}
                {item.fields.Status && (
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    item.fields.Status === 'Published' ? 'bg-green-100 text-green-800' :
                    item.fields.Status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.fields.Status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 