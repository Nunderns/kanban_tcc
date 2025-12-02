import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { slug } = await context.params;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
    }
    interface WorkspaceMemberWithUser {
      user: {
        id: string;
        email: string | null;
        name: string | null;
      };
    }
    
    const isOwner = workspace.userId === user.id;
    const isMember = workspace.members.some((member: WorkspaceMemberWithUser) => member.user.id === user.id);
    
    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Acesso negado ao workspace" }, { status: 403 });
    }
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: workspace.id,
        ...(isOwner ? {} : {
          OR: [
            { assignedUserId: user.id },
            { createdById: user.id }
          ]
        })
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
      }
    });
    const formattedTasks = tasks.map((task: TaskWithIncludes) => ({
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
    }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    console.error("Erro ao buscar tarefas do workspace:", error);
    return NextResponse.json(
      { error: `Erro ao buscar tarefas: ${error instanceof Error ? error.message : "Erro desconhecido"}` },
      { status: 500 }
    );
  }
}
