import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const activities = await prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

// POST: cria uma activity (comentário, alteração etc)
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✔ OBRIGATÓRIO
    const taskId = Number(id);

    const body = await req.json();
    let activityData;

    // Check if this is a comment (from WorkItemSidebar)
    if (body.content) {
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
      }

      activityData = {
        taskId,
        user: session.user.name || session.user.email || session.user.id || 'anonymous',
        action: 'commented',
        field: 'comment',
        oldValue: '',
        newValue: content,
      };
    }
    else {
      const { user, action, field, oldValue, newValue } = body;

      if (!user) {
        return NextResponse.json(
          { error: 'Missing `user` in body' },
          { status: 400 }
        );
      }

      activityData = {
        taskId,
        user,
        action,
        field: field || '',
        oldValue: oldValue?.toString() || '',
        newValue: newValue?.toString() || '',
      };
    }

    const task = await prisma.task.findFirst({ where: { id: taskId } });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const activity = await prisma.taskActivity.create({
      data: activityData,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
