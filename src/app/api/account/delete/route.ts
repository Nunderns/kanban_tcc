import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
        workspaces: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.task.deleteMany({
        where: { userId: userId },
      }),
      
      prisma.task.updateMany({
        where: { assignedUserId: userId },
        data: { assignedUserId: null },
      }),
      
      prisma.workspaceMember.deleteMany({
        where: { userId: userId },
      }),

      prisma.invitation.deleteMany({
        where: { inviterId: userId },
      }),

      prisma.notification.deleteMany({
        where: { userId: userId },
      }),

      prisma.project.deleteMany({
        where: { ownerId: userId },
      }),
      prisma.workspace.deleteMany({
        where: { userId: userId },
      }),
      prisma.session.deleteMany({
        where: { userId: userId },
      }),
      
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: "Erro ao excluir a conta: " + (error instanceof Error ? error.message : "Erro desconhecido") },
      { status: 500 }
    );
  }
}
