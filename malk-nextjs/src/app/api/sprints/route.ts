import { NextResponse } from 'next/server';
import { listSprints, createSprint } from '@/lib/sprints';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterByFormula = searchParams.get('filterByFormula') || undefined;
    const sortField = searchParams.get('sortField');
    const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc' | undefined;

    const options: Parameters<typeof listSprints>[0] = {};
    
    if (filterByFormula) {
      options.filterByFormula = filterByFormula;
    }

    if (sortField && sortDirection) {
      options.sort = [{ field: sortField, direction: sortDirection }];
    }

    const sprints = await listSprints(options);
    return NextResponse.json(sprints);
  } catch (error) {
    console.error('Error in GET /api/sprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sprint = await createSprint(body);

    if (!sprint) {
      return NextResponse.json(
        { error: 'Failed to create sprint' },
        { status: 500 }
      );
    }

    return NextResponse.json(sprint, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/sprints:', error);
    return NextResponse.json(
      { error: 'Failed to create sprint' },
      { status: 500 }
    );
  }
} 