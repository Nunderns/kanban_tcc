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

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId, userId: Number(session.user.id) },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const activities = await prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    return handleServerError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const { user: userName, action, field, oldValue, newValue } = body;

    const task = await prisma.task.findUnique({
      where: { id: taskId, userId: Number(session.user.id) },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const activity = await prisma.taskActivity.create({
      data: {
        taskId,
        user: userName,
        action,
        field: field || "",
        oldValue: oldValue?.toString() || "",
        newValue: newValue?.toString() || "",
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return handleServerError(error);
  }
}
