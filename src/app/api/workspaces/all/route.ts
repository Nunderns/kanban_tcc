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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          include: { workspace: true },
          orderBy: { joinedAt: "asc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    type MemberWithWorkspace = {
      workspaceId: number;
      role: string;
      workspace: {
        id: number;
        name: string;
        slug: string;
        companySize: number;
      };
    };

    const workspaces = await Promise.all(
      (user.workspaceMembers as MemberWithWorkspace[]).map(async (member) => {
        const count = await prisma.workspaceMember.count({
          where: { workspaceId: member.workspaceId },
        });
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
  } catch (error) {
    console.error("Error in /api/workspaces/all:", error);
    return NextResponse.json(
      { error: "Erro ao carregar workspaces" },
      { status: 500 }
    );
  }
}
