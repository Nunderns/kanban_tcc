import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TaskActivity } from "@prisma/client";

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

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Verify the task belongs to the user
    const task = await prisma.task.findUnique({
      where: { id: taskId, userId: Number(session.user.id) },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Fetch activities for this task
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
    const session = await getServerSession(authOptions);

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

    // Verify the task exists and belongs to the user
    const task = await prisma.task.findUnique({
      where: { id: taskId, userId: Number(session.user.id) },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Create activity log
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
