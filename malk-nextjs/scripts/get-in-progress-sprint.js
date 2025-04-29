// Script to get details of the sprint that is currently "In Progress"
require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

async function getInProgressSprint() {
  try {
    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT,
    }).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

    console.log('Fetching sprint with status "In Progress"...');
    
    // Query the Sprints table for records with "Sprint Status" = "In Progress"
    const records = await base('Sprints')
      .select({
        filterByFormula: "{Sprint Status} = 'In Progress'",
        maxRecords: 1
      })
      .firstPage();
    
    if (records.length === 0) {
      console.log('No sprint found with status "In Progress".');
      return;
    }
    
    // Get the sprint record
    const sprint = records[0];
    
    console.log('\n=== SPRINT DETAILS ===');
    console.log(`ID: ${sprint.id}`);
    console.log(`Name: ${sprint.fields['Sprint Name'] || 'N/A'}`);
    console.log(`Status: ${sprint.fields['Sprint Status'] || 'N/A'}`);
    console.log(`Notes: ${sprint.fields['Notes'] || 'N/A'}`);
    console.log(`Total Tasks: ${sprint.fields['Total Tasks'] || 0}`);
    console.log(`Completed Tasks: ${sprint.fields['Completed Tasks'] || 0}`);
    console.log(`Percent Complete: ${sprint.fields['Percent Complete'] || '0%'}`);
    
    // Get linked tasks
    if (sprint.fields['Tasks'] && sprint.fields['Tasks'].length > 0) {
      console.log('\n=== LINKED TASKS ===');
      
      // Fetch details for each linked task
      for (const taskId of sprint.fields['Tasks']) {
        try {
          const task = await base('Tasks').find(taskId);
          console.log(`\nTask: ${task.fields['Task'] || 'Unnamed Task'}`);
          console.log(`Status: ${task.fields['Status'] || 'N/A'}`);
          console.log(`Priority: ${task.fields['Priority'] || 'N/A'}`);
          console.log(`Group: ${task.fields['Group'] || 'N/A'}`);
        } catch (error) {
          console.error(`Error fetching task ${taskId}:`, error.message);
        }
      }
    } else {
      console.log('\nNo linked tasks found for this sprint.');
    }
    
  } catch (error) {
    console.error('Error fetching in-progress sprint:', error);
  }
}

getInProgressSprint(); 