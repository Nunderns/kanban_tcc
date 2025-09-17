// src/app/api/workspaces/current/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          include: {
            workspace: true
          },
          orderBy: { joinedAt: "asc" },
          take: 1
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const workspaceMember = user.workspaceMembers[0];

    if (!workspaceMember) {
      return NextResponse.json({ error: "Nenhum workspace encontrado" }, { status: 404 });
    }

    const workspace = workspaceMember.workspace;
    const memberCount = await prisma.workspaceMember.count({
      where: { workspaceId: workspace.id },
    });

    return NextResponse.json({
      id: workspace.id,
      nome: workspace.name,
      slug: workspace.slug,
      tamanhoEmpresa: workspace.companySize,
      email: user.email,
      funcao: workspaceMember.role,
      membros: memberCount,
    });
  } catch (error) {
    console.error('Error in /api/workspaces/current:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar o workspace' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, companySize, slug } = body;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          include: {
            workspace: true
          },
          orderBy: { joinedAt: "asc" },
          take: 1
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const workspaceMember = user.workspaceMembers[0];

    if (!workspaceMember) {
      return NextResponse.json({ error: "Nenhum workspace encontrado" }, { status: 404 });
    }

    if (workspaceMember.role !== "OWNER" && workspaceMember.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão para atualizar o workspace" }, { status: 403 });
    }
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceMember.workspaceId },
      data: {
        ...(name && { name }),
        ...(companySize && { companySize: parseInt(companySize) }),
        ...(slug && { slug }),
      },
    });

    return NextResponse.json({
      id: updatedWorkspace.id,
      nome: updatedWorkspace.name,
      slug: updatedWorkspace.slug,
      tamanhoEmpresa: updatedWorkspace.companySize,
    });
  } catch (error) {
    console.error('Error in PATCH /api/workspaces/current:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar o workspace' },
      { status: 500 }
    );
  }
}
