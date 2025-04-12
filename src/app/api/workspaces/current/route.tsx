import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      workspaces: {
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  const workspace = user?.workspaces[0];

  if (!workspace) {
    return NextResponse.json({ error: "Workspace não encontrada" }, { status: 404 });
  }

  const membros = await prisma.workspaceMember.count({
    where: { workspaceId: workspace.id }
  });

  return NextResponse.json({
    id: workspace.id,
    nome: workspace.name,
    slug: workspace.slug,
    tamanhoEmpresa: workspace.companySize,
    email: user.email,
    funcao: "Admin",
    membros
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { name, companySize, slug } = await req.json();

  if (!slug || !name || !companySize || isNaN(parseInt(companySize))) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const workspace = await prisma.workspace.findUnique({ where: { slug } });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace não encontrada" }, { status: 404 });
    }

    const novoSlug = name.toLowerCase().trim().replace(/\s+/g, "-");

    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        name,
        slug: novoSlug,
        companySize: parseInt(companySize),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar workspace:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
