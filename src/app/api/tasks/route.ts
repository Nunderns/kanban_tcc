import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { parseLocalDate } from "@/lib/utils";

const handleServerError = (error: unknown) => {
  return NextResponse.json(
    {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
};

export async function GET(req: NextRequest) {
  try {
    console.log('Tasks API: GET request received');
    const session = await auth();
    console.log('Session:', session ? 'Authenticated' : 'Not authenticated');

    if (!session?.user?.id) {
      console.error('Unauthorized: No session or user ID');
      return NextResponse.json({ 
        error: "Unauthorized",
        details: "No active session or user ID found" 
      }, { status: 401 });
    }

    // Parse query parameters
    const statusParam = req.nextUrl.searchParams.get("status");
    const status = statusParam && ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"].includes(statusParam)
      ? statusParam as "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE"
      : undefined;
      
    const workspaceIdParam = req.nextUrl.searchParams.get("workspaceId");
    const workspaceId = workspaceIdParam ? parseInt(workspaceIdParam) : undefined;
    
    console.log('Query params:', { status, workspaceId });

    // Convert session user ID to number if it's a string
    const userId = typeof session.user.id === 'string' 
      ? parseInt(session.user.id, 10) 
      : session.user.id;
      
    if (isNaN(userId)) {
      console.error('Invalid user ID:', session.user.id);
      return NextResponse.json(
        { error: "Internal server error", details: "Invalid user ID format" },
        { status: 500 }
      );
    }
    
    // Define proper type for the where clause
    interface TaskWhere {
      userId: number;
      status?: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
    }
    
    // Build the where clause with proper typing
    const where: TaskWhere = { userId };
    
    // Only add status if provided
    if (status) {
      where.status = status;
    }
    
    // Skip workspace filtering since the column doesn't exist in the database
    // This is a temporary fix - you should run database migrations to add the column
    console.warn('workspaceId filtering is disabled because the column does not exist in the database');
    
    console.log('Database query:', JSON.stringify(where, null, 2));

    console.log('Querying database for tasks...');
    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100 // Limit number of results for safety
    });
    
    console.log(`Found ${tasks.length} tasks`);

    type TaskResult = {
      user?: { name: string | null } | null;
      [key: string]: unknown;
    };

    return NextResponse.json(
      (tasks as TaskResult[]).map((task) => ({
        ...task,
        creator: task.user?.name || "Desconhecido"
      }))
    );

  } catch (error) {
    return handleServerError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || "BACKLOG",
        priority: body.priority || "NONE",
        userId: typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id,
        projectId: body.projectId ? Number(body.projectId) : null,
        workspaceId: body.workspaceId ? Number(body.workspaceId) : null,
        assignees: body.assignees ?? [],
        labels: body.labels ?? [],
        startDate: body.startDate ? parseLocalDate(body.startDate) : null,
        dueDate: body.dueDate ? parseLocalDate(body.dueDate) : null
      }
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return handleServerError(error);
  }
}

export async function PATCH(req: NextRequest) {
  console.log('PATCH /api/tasks - Starting request');
  
  try {
    console.log('1. Authenticating session...');
    const session = await auth();

    if (!session || !session.user?.id) {
      console.log('Unauthorized: No valid session or user ID');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log('2. Session authenticated for user ID:', session.user.id);

    const searchParams = req.nextUrl.searchParams;
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      console.log('Bad Request: Task ID is required');
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    console.log('Processing task ID:', taskId);
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Verify the task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId) }
    });

    if (!existingTask) {
      console.log('Task not found:', taskId);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== Number(session.user.id)) {
      console.log('Forbidden: User does not own this task');
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // We'll build the update data object dynamically
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    // Handle project update separately as it's a relation
    if ('projectId' in body) {
      updateData.project = body.projectId 
        ? { connect: { id: Number(body.projectId) } }
        : { disconnect: true };
    }
    
    // Handle workspace update separately as it's a relation
    if ('workspaceId' in body) {
      updateData.workspace = body.workspaceId
        ? { connect: { id: Number(body.workspaceId) } }
        : { disconnect: true };
    }
    
    // Fields we allow updating directly (exclude relational workspaceId)
    const updatableFields = [
      'title', 'description', 'status', 'priority',
      'module', 'cycle', 'assignees', 'labels'
    ] as const;
    type UpdatableField = (typeof updatableFields)[number];

    // Handle date fields separately to ensure they're proper Date objects
    if (body.startDate) {
      updateData.startDate = parseLocalDate(body.startDate);
    } else if ('startDate' in body) {
      updateData.startDate = null;
    }

    if (body.dueDate) {
      updateData.dueDate = parseLocalDate(body.dueDate);
    } else if ('dueDate' in body) {
      updateData.dueDate = null;
    }

    // Create a type-safe body object with only the fields we expect
    const safeBody: Record<string, unknown> = body;
    
    updatableFields.forEach((field: UpdatableField) => {
      if (field in safeBody && safeBody[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = safeBody[field];
      }
    });
    
    // Always update the updatedAt field
    updateData.updatedAt = new Date();

    console.log('5. Update data prepared:', JSON.stringify(updateData, null, 2));

    try {
      console.log('6. Attempting to update task in database...');
      const updatedTask = await prisma.task.update({
        where: { id: Number(taskId) },
        data: updateData,
        include: {
          user: { select: { id: true } },
          project: { select: { id: true } }
        }
      });

      console.log('7. Task updated successfully:', {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
        updatedAt: updatedTask.updatedAt
      });
      
      return NextResponse.json(updatedTask);
    } catch (dbError) {
      console.error('Database update error:', dbError);
      if (dbError instanceof Error) {
        console.error('Error details:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error in PATCH /api/tasks:', error);
    
    const errorDetails: Record<string, unknown> = {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'UnknownError',
    };

    if (typeof error === 'object' && error !== null && 'code' in error) {
      const errObj = error as { code: unknown; meta?: unknown };
      if (typeof errObj.code === 'string') {
        (errorDetails as Record<string, unknown>).code = errObj.code;
        if ('meta' in errObj) {
          (errorDetails as Record<string, unknown>).meta = errObj.meta;
        }
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      errorDetails.stack = error instanceof Error ? error.stack : undefined;
    }

    console.error('Full error details:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
