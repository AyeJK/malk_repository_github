'use client';

import { useEffect, useState } from 'react';
import { listTables, getColumnNames, ensureUsersTableExists } from '@/lib/airtable';

export default function AirtableDebugPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersTableExists, setUsersTableExists] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAirtableConnection() {
      try {
        setLoading(true);
        setError(null);

        // Check if Users table exists
        const usersTableExists = await ensureUsersTableExists();
        setUsersTableExists(usersTableExists);

        // Get available tables
        const availableTables = await listTables();
        setTables(availableTables);

        // Get column names for each table
        const columnNames: Record<string, string[]> = {};
        for (const table of availableTables) {
          columnNames[table] = await getColumnNames(table);
        }
        setColumns(columnNames);
      } catch (err) {
        console.error('Error checking Airtable connection:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    checkAirtableConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Airtable Connection Check</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Airtable Connection Check</h1>
          <div className="bg-red-900/50 border border-red-500 rounded p-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Airtable Connection Check</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Users Table Status</h2>
          {usersTableExists === null ? (
            <p>Checking Users table status...</p>
          ) : usersTableExists ? (
            <div className="bg-green-900/50 border border-green-500 rounded p-4">
              <p className="text-green-400">Users table exists and is accessible</p>
            </div>
          ) : (
            <div className="bg-yellow-900/50 border border-yellow-500 rounded p-4">
              <p className="text-yellow-400">Users table does not exist or cannot be accessed</p>
              <p className="mt-2">Please create the Users table in your Airtable base with the required fields.</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Available Tables</h2>
          {tables.length === 0 ? (
            <p>No tables found</p>
          ) : (
            <div className="space-y-4">
              {tables.map((table) => (
                <div key={table} className="bg-gray-800 rounded p-4">
                  <h3 className="text-lg font-medium mb-2">{table}</h3>
                  {columns[table] ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Columns:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-300">
                        {columns[table].map((column) => (
                          <li key={column}>{column}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No columns found</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 