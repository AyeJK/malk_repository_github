import { NextRequest, NextResponse } from 'next/server';
import { listTasks, updateTask, createTask } from '@/lib/tasks';

export async function GET(request: NextRequest) {
  try {
    // Get all tasks
    const tasks = await listTasks();
    
    // Find the task with name "Create User Profile Component"
    let targetTask = tasks.find(task => 
      task.fields.Task === "Create User Profile Component"
    );
    
    // If task doesn't exist, create it
    if (!targetTask) {
      const newTask = await createTask({
        fields: {
          Task: "Create User Profile Component",
          Details: "Develop component to display and edit user profiles",
          Status: "Not Started",
          Timeline: "1 day",
          CreatedAt: new Date().toISOString(),
          LastModified: new Date().toISOString()
        }
      });
      
      if (!newTask) {
        return NextResponse.json({ 
          error: 'Failed to create task',
          message: 'Could not create the task'
        });
      }
      
      targetTask = newTask;
    }
    
    // Update the task status to "In Progress"
    const updatedTask = await updateTask(targetTask.id!, {
      Status: "In Progress",
      LastModified: new Date().toISOString()
    });
    
    return NextResponse.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 