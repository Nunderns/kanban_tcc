import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const handleServerError = (error: unknown) => {
  console.error("Server error:", error);
  return NextResponse.json(
    {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    },
    { status: 500 }
  );
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    // ⚠️ Conversão segura de string para enum
    const status = (statusParam && ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"].includes(statusParam))
      ? statusParam as Status
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

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
