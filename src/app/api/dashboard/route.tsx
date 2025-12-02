import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const workspaceSlug = url.searchParams.get('workspaceSlug');

    if (!workspaceSlug) {
      return NextResponse.json({ error: "Workspace slug required" }, { status: 400 });
    }
    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: workspace.id
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const membersData = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    type MemberWithUser = {
      userId: string;
      user: { id: string; name: string | null; email: string | null };
    };

    const memberIds = (membersData as MemberWithUser[]).map((m) => m.userId);

    const totalProjects = await prisma.project.count({
      where: { ownerId: { in: memberIds } },
    });

    const totalTasks = await prisma.task.count({
      where: { userId: { in: memberIds } },
    });

    const assignedTasks = await prisma.task.count({
      where: { userId: { in: memberIds } },
    });

    const completedTasks = await prisma.task.count({
      where: { status: "DONE", userId: { in: memberIds } },
    });

    const projects = await prisma.project.findMany({
      where: { ownerId: { in: memberIds } },
      select: { id: true, name: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: { userId: { in: memberIds } },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true
      },
    });

    const tasksWithRemainingDays = tasks.map((task: Task) => ({
      ...task,
      remainingDays: task.dueDate ?
        Math.ceil((new Date(task.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) :
        null
    }));

    const members = (membersData as MemberWithUser[]).map((m) => ({
      id: m.user.id,
      name: m.user.name || "Usuário Sem Nome",
      email: m.user.email || "email@nao.informado",
    }));

    return NextResponse.json({
      totalProjects,
      totalTasks,
      assignedTasks,
      completedTasks,
      projects,
      tasks: tasksWithRemainingDays,
      members,
    });
  } catch (error) {
    console.error("❌ Erro na API /api/dashboard:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
