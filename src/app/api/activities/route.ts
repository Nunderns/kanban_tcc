import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface WorkspaceMember {
  id: number;
  userId: number;
  workspaceId: number;
  role: string;
}

interface TaskActivity {
  id: number;
  taskId: number;
  user: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  task: {
    title: string;
  };
}

export async function GET() {
  console.log('Activities API called');
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      console.error('No user ID in session');
      return NextResponse.json(
        { error: 'Unauthorized - No user ID in session' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = Number(session.user.id);
    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const workspaces = await prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true }
    }).catch((err: unknown) => {
      console.error('Error fetching workspaces:', err);
      throw err;
    });
    
    if (!workspaces || workspaces.length === 0) {
      return NextResponse.json([], { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const workspaceIds = workspaces.map((ws: WorkspaceMember) => ws.workspaceId);

    const activities = await prisma.taskActivity.findMany({
      where: {
        task: {
          workspaceId: {
            in: workspaceIds
          }
        }
      },
      include: {
        task: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    
    const formattedActivities = activities.map((activity: TaskActivity) => {
      try {
        return {
          id: activity.id,
          user: activity.user || 'Unknown',
          action: activity.action,
          field: activity.field || undefined,
          oldValue: activity.oldValue || undefined,
          newValue: activity.newValue || undefined,
          taskTitle: activity.task?.title || 'Untitled Task',
          createdAt: activity.createdAt ? new Date(activity.createdAt).toISOString() : new Date().toISOString()
        };
      } catch (error) {
        console.error('Error formatting activity:', error, activity);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json(formattedActivities, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in activities API:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Non-error object:',
      errorObject: error
    });
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
