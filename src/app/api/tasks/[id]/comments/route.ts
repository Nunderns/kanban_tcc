import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const handleServerError = (error: unknown) => {
  return NextResponse.json(
    {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
};

const parseTaskId = async (paramsPromise: Promise<{ id: string }>) => {
  const { id } = await paramsPromise;
  const taskId = parseInt(id, 10);

  if (Number.isNaN(taskId)) {
    throw new Error("INVALID_TASK_ID");
  }

  return taskId;
};

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let taskId: number;
    try {
      taskId = await parseTaskId(context.params);
    } catch (error) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const userId = Number(session.user.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId, userId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comments = await prisma.taskActivity.findMany({
      where: { taskId, action: "commented" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TASK_ID") {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    return handleServerError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let taskId: number;
    try {
      taskId = await parseTaskId(context.params);
    } catch (error) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const userId = Number(session.user.id);
    const task = await prisma.task.findUnique({
      where: { id: taskId, userId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const displayUser = session.user.name || session.user.email || "Usuário";

    const comment = await prisma.taskActivity.create({
      data: {
        taskId,
        user: displayUser,
        action: "commented",
        field: "comment",
        oldValue: "",
        newValue: content,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TASK_ID") {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    return handleServerError(error);
  }
}
