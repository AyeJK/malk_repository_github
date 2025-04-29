import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    const taskId = 'recfzHlEVr3iEfF6e';
    console.log('Attempting to update task:', taskId);
    
    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT,
    }).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');
    
    // Get the current task first
    const task = await base('Tasks').find(taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    console.log('Current task:', task);

    // Update only the status field
    const updatedTask = await base('Tasks').update(taskId, {
      Status: 'In Progress'
    });
    
    if (!updatedTask) {
      console.error('Failed to update task status');
      return NextResponse.json(
        { error: 'Failed to update task status' },
        { status: 500 }
      );
    }
    
    console.log('Updated task:', updatedTask);
    return NextResponse.json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update task status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 