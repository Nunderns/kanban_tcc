import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const memberRecord = await prisma.workspaceMember.findFirst({
    where: {
      user: {
        email: session.user.email,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!memberRecord) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  const { workspace } = memberRecord;

  return NextResponse.json({
    nome: workspace.name,
    tamanhoEmpresa: workspace.companySize ?? "Just myself",
    slug: workspace.slug,
  });
}
