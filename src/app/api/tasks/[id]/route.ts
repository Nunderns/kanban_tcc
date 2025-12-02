import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface TaskUpdateData {
  title?: string;
  description?: string | null;
  status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  startDate?: string | null;
  dueDate?: string | null;
  module?: string | null;
  assignedUserId?: number | null;
  projectId?: number | null;
  workspaceId?: number | null;
}

type PrismaTaskUpdate = Omit<TaskUpdateData, 'dueDate' | 'startDate'> & {
  dueDate?: Date | null;
  startDate?: Date | null;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'ID da tarefa inválido' }, { status: 400 });
    }

    const sessionUserId = session.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        workspace: {
          include: {
            members: {
              where: { userId: sessionUserId },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    if (task.workspace && task.workspace.members.length === 0 && task.user.id !== sessionUserId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sessionUserId = session.user.id;

    const { id } = await context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'ID da tarefa inválido' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: { select: { id: true } },
        workspace: { select: { id: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    if (task.workspace?.id) {
      const hasAccess = await prisma.workspaceMember.findFirst({
        where: { workspaceId: task.workspace.id, userId: sessionUserId },
      });
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Você não tem permissão para editar esta tarefa' },
          { status: 403 }
        );
      }
    } else if (task.user.id !== sessionUserId) {
      return NextResponse.json(
        { error: 'Apenas o criador pode editar esta tarefa' },
        { status: 403 }
      );
    }

    const updateData: TaskUpdateData = await request.json();
    const dataToUpdate: PrismaTaskUpdate = { ...updateData } as PrismaTaskUpdate;
    if (updateData.dueDate) dataToUpdate.dueDate = new Date(updateData.dueDate);
    if (updateData.startDate) dataToUpdate.startDate = new Date(updateData.startDate);

    const cleanedData = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([, v]) => v !== undefined)
    ) as PrismaTaskUpdate;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: cleanedData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        workspace: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const sessionUserId = session.user.id;

    const { id } = await context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'ID da tarefa inválido' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        workspace: {
          include: {
            members: { where: { userId: sessionUserId } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    if (task.workspace) {
      if (!task.workspace.members || task.workspace.members.length === 0) {
        return NextResponse.json(
          { error: 'Você não tem permissão para excluir esta tarefa' },
          { status: 403 }
        );
      }
    } else if (task.userId !== sessionUserId) {
      return NextResponse.json(
        { error: 'Apenas o criador pode excluir esta tarefa' },
        { status: 403 }
      );
    }

    await prisma.task.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    return NextResponse.json({ error: 'Erro ao excluir tarefa' }, { status: 500 });
  }
}
