import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace não encontrada" }, { status: 404 });
    }

    const projects = await prisma.project.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ projects });

  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
