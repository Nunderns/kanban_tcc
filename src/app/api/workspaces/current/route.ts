// src/app/api/workspaces/current/route.ts

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
        take: 1,
      },
    },
  });

  const workspace = user?.workspaces?.[0];

  if (!workspace) {
    return NextResponse.json({ error: "Workspace não encontrada" }, { status: 404 });
  }

  const membros = await prisma.workspaceMember.count({
    where: { workspaceId: workspace.id },
  });

  return NextResponse.json({
    id: workspace.id,
    nome: workspace.name,
    slug: workspace.slug,
    tamanhoEmpresa: workspace.companySize,
    email: user.email,
    funcao: "Admin",
    membros,
  });
}
