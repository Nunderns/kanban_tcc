import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { parseLocalDate } from "@/lib/utils";

interface TaskWithIncludes {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: Date | null;
  dueDate: Date | null;
  assignees: string[] | null;
  assignedUserId: number | null;
  parentTaskId: number | null;
  assignedUser: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
  module: string | null;
  cycle: string | null;
  labels: string[] | null;
  user: {
    id: number;
    name: string | null;
    email: string | null;
  };
  subtasks: {
    id: number;
    title: string;
    status: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "Unauthorized",
        details: "No active session or user ID found" 
      }, { status: 401 });
    }

    const statusParam = req.nextUrl.searchParams.get("status");
    const status = statusParam && ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"].includes(statusParam)
      ? statusParam as "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE"
      : undefined;
      
    const workspaceIdParam = req.nextUrl.searchParams.get("workspaceId");
    const workspaceId = workspaceIdParam ? parseInt(workspaceIdParam) : undefined;
    const projectIdParam = req.nextUrl.searchParams.get("projectId");
    const projectId = projectIdParam ? parseInt(projectIdParam) : undefined;
    
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
    
    interface TaskWhere {
      userId: number;
      status?: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
      projectId?: number | null;
    }
    
    const where: TaskWhere = { userId };
    
    if (status) {
      where.status = status;
    }
    if (typeof projectId === 'number' && !isNaN(projectId)) {
      where.projectId = projectId;
    }
    
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(workspaceId && { workspaceId }),
        ...(projectId && { projectId })
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });
    
    return NextResponse.json(
      tasks.map((task: TaskWithIncludes) => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate?.toISOString(),
        dueDate: task.dueDate?.toISOString(),
        assignees: task.assignees,
        assignedUserId: task.assignedUserId?.toString(),
        assignedUserName: task.assignedUser?.name || null,
        module: task.module,
        cycle: task.cycle,
        labels: task.labels,
        parentTaskId: task.parentTaskId?.toString(),
        subtasks: task.subtasks?.map((subtask: { id: number; title: string; status: string }) => subtask.id.toString()) || [],
        creator: task.user?.name || "Desconhecido",
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
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
        assignedUserId: body.assignedUserId ? Number(body.assignedUserId) : null,
        parentTaskId: body.parentTaskId ? Number(body.parentTaskId) : null,
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
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const searchParams = req.nextUrl.searchParams;
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId) }
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const updateData: Record<string, unknown> = {};
    
    if ('projectId' in body) {
      updateData.project = body.projectId
        ? { connect: { id: Number(body.projectId) } }
        : { disconnect: true };
    }
    if ('workspaceId' in body) {
      updateData.workspace = body.workspaceId
        ? { connect: { id: Number(body.workspaceId) } }
        : { disconnect: true };
    }
    const updatableFields = [
      'title', 'description', 'status', 'priority',
      'module', 'cycle', 'assignees', 'labels', 'parentTaskId'
    ] as const;
    type UpdatableField = (typeof updatableFields)[number];
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
    const safeBody: Record<string, unknown> = body;
    
    if (body.assignedUserId !== undefined) {
      updateData.assignedUserId = body.assignedUserId ? Number(body.assignedUserId) : null;
    }

    updatableFields.forEach((field: UpdatableField) => {
      if (field in safeBody && safeBody[field] !== undefined) {
        if (field === 'parentTaskId') {
          const raw = safeBody[field];
          if (raw === null || raw === '' || raw === undefined) {
            updateData.parentTaskId = null;
          } else {
            const asString = String(raw);
            const numeric = Number(asString.replace(/^PRIME-/i, ''));
            updateData.parentTaskId = Number.isNaN(numeric) ? null : numeric;
          }
        } else {
          (updateData as Record<string, unknown>)[field] = safeBody[field];
        }
      }
    });
    updateData.updatedAt = new Date();
    
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
