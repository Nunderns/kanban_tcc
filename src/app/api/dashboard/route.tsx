import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: Number(session.user.id) },
    });

    if (!membership) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const membersData = await prisma.workspaceMember.findMany({
      where: { workspaceId: membership.workspaceId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const memberIds = membersData.map((m) => m.userId);

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

    const tasks = await prisma.task.findMany({
      where: { userId: { in: memberIds } },
      select: { id: true, title: true, description: true },
    });

    const members = membersData.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    }));

    return NextResponse.json({
      totalProjects,
      totalTasks,
      assignedTasks,
      completedTasks,
      projects,
      tasks,
      members,
    });
  } catch (error) {
    console.error("❌ Erro na API /api/dashboard:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
