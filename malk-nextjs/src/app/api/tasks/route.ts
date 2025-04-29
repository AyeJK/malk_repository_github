import { NextRequest, NextResponse } from 'next/server';
import { listTasks, getTask, createTask, updateTask, deleteTask } from '@/lib/tasks';

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phase = searchParams.get('phase');
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');
    
    let tasks;
    if (phase) {
      tasks = await listTasks({
        filterByFormula: `{Phase} = '${phase}'`,
        sort: [{ field: 'Name', direction: 'asc' }]
      });
    } else if (status) {
      tasks = await listTasks({
        filterByFormula: `{Status} = '${status}'`,
        sort: [{ field: 'Priority', direction: 'desc' }, { field: 'Name', direction: 'asc' }]
      });
    } else if (assignee) {
      tasks = await listTasks({
        filterByFormula: `FIND('${assignee}', {AssignedTo})`,
        sort: [{ field: 'Priority', direction: 'desc' }, { field: 'Name', direction: 'asc' }]
      });
    } else {
      tasks = await listTasks();
    }
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error listing tasks:', error);
    return NextResponse.json(
      { error: 'Failed to list tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json();
    const task = await createTask(taskData);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 