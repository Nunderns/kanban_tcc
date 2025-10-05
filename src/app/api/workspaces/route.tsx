import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { workspaceSlug } = await request.json();
    if (!workspaceSlug) {
      return NextResponse.json({ error: "Workspace não especificado" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
      include: {
        members: {
          where: { userId: user.id },
          select: { role: true, userId: true }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
    }

    const isCreator = workspace.userId === user.id;
    if (!isCreator) {
      return NextResponse.json(
        { error: "Apenas o criador pode excluir o workspace" }, 
        { status: 403 }
      );
    }
    await prisma.$transaction([
      prisma.taskActivity.deleteMany({
        where: {
          task: { workspaceId: workspace.id }
        }
      }),
      
      prisma.task.deleteMany({
        where: { workspaceId: workspace.id }
      }),
      
      prisma.invitation.deleteMany({
        where: { workspaceId: workspace.id }
      }),
      prisma.workspaceMember.deleteMany({
        where: { workspaceId: workspace.id }
      }),
      prisma.workspace.delete({
        where: { id: workspace.id }
      })
    ]);

    return NextResponse.json({ message: "Workspace excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir workspace:", error);
    return NextResponse.json(
      { error: `Erro ao excluir o workspace: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
