import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Listar workspaces (suporta ?scope=current|all; padrão: current)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const scope = (url.searchParams.get("scope") || "current").toLowerCase();

    if (scope === "all") {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          workspaceMembers: {
            include: { workspace: true },
            orderBy: { joinedAt: "asc" },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }

      type MemberWithWorkspace = {
        workspaceId: number;
        role: string;
        workspace: { id: number; name: string; slug: string; companySize: number };
      };

      const workspaces = await Promise.all(
        (user.workspaceMembers as MemberWithWorkspace[]).map(async (member) => {
          const count = await prisma.workspaceMember.count({ where: { workspaceId: member.workspaceId } });
          return {
            id: member.workspace.id,
            nome: member.workspace.name,
            slug: member.workspace.slug,
            tamanhoEmpresa: member.workspace.companySize,
            funcao: member.role,
            membros: count,
          };
        })
      );

      return NextResponse.json({ workspaces });
    }

    // default/current
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          include: { workspace: true },
          orderBy: { joinedAt: "asc" },
          take: 1,
        },
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
    const memberCount = await prisma.workspaceMember.count({ where: { workspaceId: workspace.id } });

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
    console.error("Error in GET /api/workspaces:", error);
    return NextResponse.json({ error: "Erro ao carregar workspaces" }, { status: 500 });
  }
}

// Atualizar workspace
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, companySize } = body;

  const member = await prisma.workspaceMember.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!member) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  const updated = await prisma.workspace.update({
    where: { id: member.workspaceId },
    data: {
      name,
      companySize: parseInt(companySize),
    },
  });

  return NextResponse.json(updated);
}

// Excluir workspace
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!member) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  await prisma.workspace.delete({
    where: { id: member.workspaceId },
  });

  return NextResponse.json({ message: "Workspace deletado" });
}
