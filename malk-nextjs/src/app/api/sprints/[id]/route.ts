import { NextResponse } from 'next/server';
import { getSprintById, updateSprint, deleteSprint } from '@/lib/sprints';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sprint = await getSprintById(params.id);

    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Error in GET /api/sprints/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprint' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const sprint = await updateSprint(params.id, body);

    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Error in PUT /api/sprints/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update sprint' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteSprint(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/sprints/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete sprint' },
      { status: 500 }
    );
  }
} 