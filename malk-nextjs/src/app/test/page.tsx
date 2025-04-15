'use client';

import { useState, useEffect } from 'react';
import { listTables, fetchRecords, getColumnNames } from '@/lib/airtable';

export default function TestPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('posts');

  useEffect(() => {
    async function loadTables() {
      try {
        setLoading(true);
        console.log('Loading tables...');
        const tableList = await listTables();
        console.log('Tables loaded:', tableList);
        setTables(tableList);
        
        // If 'posts' table is available, select it automatically
        if (tableList.includes('posts')) {
          setSelectedTable('posts');
          // Load data for the 'posts' table
          await handleTableSelect('posts');
        } else if (tableList.length > 0) {
          // Otherwise select the first available table
          setSelectedTable(tableList[0]);
          await handleTableSelect(tableList[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading tables:', err);
        setError('Failed to load tables. Please check your Airtable connection.');
      } finally {
        setLoading(false);
      }
    }

    loadTables();
  }, []);

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    try {
      setLoading(true);
      console.log(`Loading records from table: ${tableName}`);
      
      // Get column names first
      const columns = await getColumnNames(tableName);
      setColumnNames(columns);
      
      // Then get records
      const data = await fetchRecords(tableName);
      console.log(`Records loaded from ${tableName}:`, data);
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error(`Error loading records from ${tableName}:`, err);
      setError(`Failed to load records from ${tableName}.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
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
      <h1 className="text-3xl font-bold mb-8">Airtable Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p><strong>AIRTABLE_PAT:</strong> {process.env.NEXT_PUBLIC_AIRTABLE_PAT ? 'Set' : 'Not set'}</p>
          <p><strong>AIRTABLE_BASE_ID:</strong> {process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'Not set'}</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Tables</h2>
        {tables.length === 0 ? (
          <p className="text-gray-500">No tables found. Please check your Airtable base ID.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => handleTableSelect(table)}
                className={`px-4 py-2 rounded-md ${
                  selectedTable === table
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {table}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {columnNames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Column Names in {selectedTable}</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="flex flex-wrap gap-2">
              {columnNames.map((column) => (
                <span key={column} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {column}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Records from {selectedTable}</h2>
        {records.length === 0 ? (
          <p className="text-gray-500">No records found in this table.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Record ID: {record.id}</h3>
                  <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                    {JSON.stringify(record.fields, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 