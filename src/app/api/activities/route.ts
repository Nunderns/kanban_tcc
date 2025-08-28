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
    
    // session.user.id is a string (see auth.tsx); convert to number for Prisma
    const userId = Number(session.user.id);
    if (Number.isNaN(userId)) {
      console.error('Invalid user ID, expected number but got:', session.user.id);
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching activities for user (numeric id):', userId);

    // Get the current user's workspaces
    console.log('Fetching workspaces for user:', userId);
    const workspaces = await prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true }
    }).catch((err: unknown) => {
      console.error('Error fetching workspaces:', err);
      throw err;
    });
    
    console.log('Workspaces found:', workspaces);
    
    if (!workspaces || workspaces.length === 0) {
      console.log('No workspaces found for user:', session.user.id);
      return NextResponse.json([], { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const workspaceIds = workspaces.map((ws: WorkspaceMember) => ws.workspaceId);
    console.log('Found workspaces:', workspaceIds);

    // Get activities for the current user's workspaces
    console.log('Fetching activities for workspace IDs:', workspaceIds);
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
    
    console.log(`Found ${activities.length} activities`);

    // Format the response
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
    }).filter(Boolean); // Remove any null entries from formatting errors
    
    console.log('Formatted activities:', formattedActivities.length);

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
