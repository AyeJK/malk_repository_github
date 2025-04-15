// Import required modules
const Airtable = require('airtable');

// Initialize Airtable
let base;
try {
  // Get Airtable API key and base ID from environment variables
  const apiKey = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  
  if (apiKey && baseId) {
    base = new Airtable({ apiKey }).base(baseId);
  } else {
    console.error('Airtable configuration missing: API key or base ID not found');
  }
} catch (error) {
  console.error('Error initializing Airtable:', error);
}

// Handler for Netlify Functions
exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Check if Airtable is initialized
  if (!base) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Airtable configuration error' })
    };
  }

  try {
    // Parse request body
    const { table, action, recordId, data } = JSON.parse(event.body || '{}');

    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Table name is required' })
      };
    }

    // Get the specified table
    const airtableTable = base(table);

    // Perform the requested action
    let result;
    switch (action) {
      case 'list':
        // List records
        result = await airtableTable.select().all();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.map(record => ({
            id: record.id,
            ...record.fields
          })))
        };
      
      case 'get':
        // Get a single record
        if (!recordId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Record ID is required for get action' })
          };
        }
        result = await airtableTable.find(recordId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            id: result.id,
            ...result.fields
          })
        };
      
      case 'create':
        // Create a new record
        if (!data) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Data is required for create action' })
          };
        }
        result = await airtableTable.create(data);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            id: result.id,
            ...result.fields
          })
        };
      
      case 'update':
        // Update an existing record
        if (!recordId || !data) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Record ID and data are required for update action' })
          };
        }
        result = await airtableTable.update(recordId, data);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            id: result.id,
            ...result.fields
          })
        };
      
      case 'delete':
        // Delete a record
        if (!recordId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Record ID is required for delete action' })
          };
        }
        result = await airtableTable.destroy(recordId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, id: recordId })
        };
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Error handling Airtable request:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
}; 