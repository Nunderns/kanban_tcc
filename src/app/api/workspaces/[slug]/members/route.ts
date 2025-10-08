import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

type Member = {
  userId: number;
  role: string;
  user: {
    id: number;
    name: string | null;
    email: string | null;
  };
};

type Invitation = {
  id: number;
  email: string;
  role: string;
  status: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    const workspaceSlug = slug;

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace não especificado' },
        { status: 400 }
      );
    }
    const workspace = await prisma.workspace.findFirst({
      where: { slug: workspaceSlug },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invitations: {
          where: {
            status: 'PENDING',
          },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace não encontrado' },
        { status: 404 }
      );
    }
    const activeMembers = (workspace.members as Member[]).map((member) => ({
      id: member.user.id.toString(),
      fullName: member.user.name || 'Usuário sem nome',
      displayName: member.user.email?.split('@')[0] || 'usuario',
      email: member.user.email || '',
      role: member.role,
      status: 'ACTIVE',
    }));
    const pendingInvitations = (workspace.invitations as Invitation[]).map((invitation) => ({
      id: `invite-${invitation.id}`,
      fullName: 'Convite pendente',
      displayName: invitation.email.split('@')[0],
      role: invitation.role,
      status: 'PENDING',
    }));
    const allMembers = [...activeMembers, ...pendingInvitations];

    return NextResponse.json({
      members: allMembers,
      pendingInvitations: pendingInvitations
    });
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar membros do workspace' },
      { status: 500 }
    );
  }
}