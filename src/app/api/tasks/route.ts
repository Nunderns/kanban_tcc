import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const handleServerError = (error: unknown) => {
  // console.error("Server error:", error);
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
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statusParam = req.nextUrl.searchParams.get("status");
    const status = statusParam && ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"].includes(statusParam)
      ? (statusParam as Status)
      : undefined;

    const where: Prisma.TaskWhereInput = {
      userId: Number(session.user.id),
      ...(status ? { status } : {})
    };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(
      tasks.map((task) => ({
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
    const session = await getServerSession(authOptions);

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
        userId: Number(session.user.id),
        projectId: body.projectId ? Number(body.projectId) : null,
        assignees: body.assignees ?? [],
        labels: body.labels ?? [],
        startDate: body.startDate || null,
        dueDate: body.dueDate || null
      }
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return handleServerError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    console.log('PATCH /api/tasks - Starting request');
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      console.log('Unauthorized: No valid session or user ID');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Use Prisma's generated types for update data
    type TaskUpdateData = Prisma.TaskUpdateInput;

    // Only include fields that can be updated
    const updateData: TaskUpdateData = { updatedAt: new Date() };
    
    // Handle project update separately as it's a relation
    if ('projectId' in body) {
      updateData.project = body.projectId 
        ? { connect: { id: Number(body.projectId) } }
        : { disconnect: true };
    }
    
    // Define other updatable fields (non-relation fields)
    type UpdatableField = keyof Pick<Prisma.TaskUpdateInput, 
      'title' | 'description' | 'status' | 'priority' | 'startDate' | 
      'dueDate' | 'module' | 'cycle' | 'assignees' | 'labels'
    >;
    
    const updatableFields: UpdatableField[] = [
      'title', 'description', 'status', 'priority', 'startDate', 
      'dueDate', 'module', 'cycle', 'assignees', 'labels'
    ];

    // Create a type-safe body object with only the fields we expect
    const safeBody: Record<string, unknown> = body;
    
    updatableFields.forEach((field: UpdatableField) => {
      if (field in safeBody) {
        // We know the field is in UpdatableField and safeBody
        (updateData as Record<string, unknown>)[field] = safeBody[field];
      }
    });
    
    // Always update the updatedAt field
    updateData.updatedAt = new Date();

    console.log('Update data prepared:', JSON.stringify(updateData, null, 2));

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: updateData
    });

    console.log('Task updated successfully:', updatedTask.id);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error in PATCH /api/tasks:', error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
