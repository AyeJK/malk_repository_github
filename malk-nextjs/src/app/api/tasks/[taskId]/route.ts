import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask, deleteTask } from '@/lib/tasks';

// GET /api/tasks/[taskId] - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const task = await getTask(params.taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    return NextResponse.json(
      { error: 'Failed to get task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[taskId] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const taskData = await request.json();
    const task = await updateTask(params.taskId, taskData);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[taskId] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const success = await deleteTask(params.taskId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 