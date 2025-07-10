// src/app/api/workspaces/current/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Find the user with their workspace memberships
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

    // Count all members in the workspace
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
