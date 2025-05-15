import { base } from './airtable';

export interface Task {
  id?: string;
  fields: {
    Task: string;
    Details?: string;
    Timeline?: string;
    Status?: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
    Dependencies?: string[];
    CreatedAt?: string;
    LastModified?: string;
  };
}

// Function to list all tasks
export async function listTasks(options: {
  filterByFormula?: string;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  maxRecords?: number;
} = {}): Promise<Task[]> {
  try {
    const records = await base('Tasks')
      .select({
        maxRecords: options.maxRecords || 100,
        ...(options.filterByFormula ? { filterByFormula: options.filterByFormula } : {}),
        ...(options.sort ? {
          sort: options.sort.map(sort => ({
            field: sort.field,
            direction: sort.direction
          }))
        } : {})
      })
      .firstPage();

    return records.map(record => ({
      id: record.id,
      fields: record.fields as Task['fields']
    }));
  } catch (error) {
    console.error('Error listing tasks:', error);
    return [];
  }
}

// Function to get a single task by ID
export async function getTask(taskId: string): Promise<Task | null> {
  try {
    const record = await base('Tasks').find(taskId);
    return {
      id: record.id,
      fields: record.fields as Task['fields']
    };
  } catch (error) {
    console.error('Error getting task:', error);
    return null;
  }
}

// Function to create a new task
export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task | null> {
  try {
    const record = await base('Tasks').create([
      {
        fields: {
          ...taskData.fields,
          CreatedAt: new Date().toISOString(),
          LastModified: new Date().toISOString()
        }
      }
    ]);
    
    return {
      id: record[0].id,
      fields: record[0].fields as Task['fields']
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

// Function to update a task
export async function updateTask(taskId: string, taskData: Partial<Task['fields']>): Promise<Task | null> {
  try {
    // Update the task directly with the fields
    const record = await base('Tasks').update(taskId, {
      ...taskData,
      LastModified: new Date().toISOString()
    });
    
    // Return the updated task in our standard format
    return {
      id: record.id,
      fields: record.fields as Task['fields']
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

// Function to delete a task
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    await base('Tasks').destroy(taskId);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Function to get tasks by status
export async function getTasksByStatus(status: Task['fields']['Status']): Promise<Task[]> {
  return listTasks({
    filterByFormula: `{Status} = '${status}'`,
    sort: [{ field: 'Task', direction: 'asc' }]
  });
}

// Function to get tasks by assignee
export async function getTasksByAssignee(assignee: string): Promise<Task[]> {
  return listTasks({
    filterByFormula: `FIND('${assignee}', {AssignedTo})`,
    sort: [{ field: 'Task', direction: 'asc' }]
  });
} 