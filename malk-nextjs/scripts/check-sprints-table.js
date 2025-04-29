// Script to check the Sprints table structure in Airtable
require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

async function checkSprintsTable() {
  try {
    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT,
    }).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

    console.log('Checking Sprints table...');
    
    // Try to access the Sprints table
    const table = base('Sprints');
    
    // Get a sample record to see the fields
    const records = await table.select({ maxRecords: 1 }).firstPage();
    
    if (records.length === 0) {
      console.log('Sprints table exists but has no records.');
      return;
    }
    
    // Get the fields from the first record
    const fields = records[0].fields;
    
    console.log('Sprints table fields:');
    Object.keys(fields).forEach(fieldName => {
      console.log(`- ${fieldName}: ${typeof fields[fieldName]}`);
    });
    
  } catch (error) {
    console.error('Error checking Sprints table:', error);
  }
}

checkSprintsTable(); 