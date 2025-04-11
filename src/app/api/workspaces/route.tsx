import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/app/lib/prisma";

// Atualizar workspace
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
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
  const session = await getServerSession(authOptions);
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
