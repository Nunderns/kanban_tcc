import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar o workspace do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!user?.workspaceMembers?.[0]?.workspaceId) {
      return NextResponse.json(
        { error: 'Workspace não encontrado' },
        { status: 404 }
      );
    }

    const workspaceId = user.workspaceMembers[0].workspaceId;

    // Buscar todos os membros do workspace
    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Formatar a resposta
    const formattedMembers = workspaceMembers.map(member => ({
      id: member.userId.toString(),
      fullName: member.user.name || 'Usuário sem nome',
      displayName: member.user.email?.split('@')[0] || 'usuario',
      email: member.user.email || '',
      role: member.role
    }));

    return NextResponse.json({ members: formattedMembers });

  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar membros do workspace' },
      { status: 500 }
    );
  }
}
