import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    context: { params: Promise<{ slug: string }> }
){
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { slug } = await context.params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
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
      prisma.taskActivity.deleteMany({ where: { task: { workspaceId: workspace.id } } }),
      prisma.task.deleteMany({ where: { workspaceId: workspace.id } }),
      prisma.invitation.deleteMany({ where: { workspaceId: workspace.id } }),
      prisma.workspaceMember.deleteMany({ where: { workspaceId: workspace.id } }),
      prisma.workspace.delete({ where: { id: workspace.id } }),
    ]);

    return NextResponse.json({ message: "Workspace excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir workspace:", error);
    return NextResponse.json(
      { error: `Erro ao excluir workspace: ${error instanceof Error ? error.message : "Erro desconhecido"}` },
      { status: 500 }
    );
  }
}
