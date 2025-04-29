import { base } from './airtable';

export interface Sprint {
  id?: string;
  fields: {
    Name: string;
    Description?: string;
    StartDate?: string;
    EndDate?: string;
    Status?: 'Not Started' | 'In Progress' | 'Completed';
    Tasks?: string[]; // Array of Task record IDs
    CreatedAt?: string;
    LastModified?: string;
  };
}

export async function listSprints(options: {
  filterByFormula?: string;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
} = {}): Promise<Sprint[]> {
  try {
    const selectOptions: any = {
      maxRecords: 100,
      view: 'Grid view',
    };

    if (options.filterByFormula) {
      selectOptions.filterByFormula = options.filterByFormula;
    }

    if (options.sort) {
      selectOptions.sort = options.sort.map(sort => ({
        field: sort.field,
        direction: sort.direction,
      }));
    }

    const query = base('Sprints').select(selectOptions);
    const records = await query.all();
    
    return records.map(record => ({
      id: record.id,
      fields: record.fields as Sprint['fields'],
    }));
  } catch (error) {
    console.error('Error listing sprints:', error);
    throw error;
  }
}

export async function getSprintById(sprintId: string): Promise<Sprint | null> {
  try {
    const record = await base('Sprints').find(sprintId);
    return {
      id: record.id,
      fields: record.fields as Sprint['fields'],
    };
  } catch (error) {
    console.error('Error getting sprint by ID:', error);
    return null;
  }
}

export async function createSprint(sprint: Omit<Sprint, 'id'>): Promise<Sprint | null> {
  try {
    const record = await base('Sprints').create([
      {
        fields: {
          ...sprint.fields,
          CreatedAt: new Date().toISOString(),
          LastModified: new Date().toISOString(),
        },
      },
    ]);
    return {
      id: record[0].id,
      fields: record[0].fields as Sprint['fields'],
    };
  } catch (error) {
    console.error('Error creating sprint:', error);
    return null;
  }
}

export async function updateSprint(sprintId: string, sprint: Partial<Sprint['fields']>): Promise<Sprint | null> {
  try {
    const record = await base('Sprints').update([
      {
        id: sprintId,
        fields: {
          ...sprint,
          LastModified: new Date().toISOString(),
        },
      },
    ]);
    return {
      id: record[0].id,
      fields: record[0].fields as Sprint['fields'],
    };
  } catch (error) {
    console.error('Error updating sprint:', error);
    return null;
  }
}

export async function deleteSprint(sprintId: string): Promise<boolean> {
  try {
    await base('Sprints').destroy([sprintId]);
    return true;
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return false;
  }
} 