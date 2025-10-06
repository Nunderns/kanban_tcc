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

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get workspace slug from URL
    const url = new URL(request.url);
    const workspaceSlug = url.searchParams.get('workspaceSlug');

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: 'Workspace não especificado' },
        { status: 400 }
      );
    }

    // Get the workspace by slug
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

    // Format active members
    const activeMembers = (workspace.members as Member[]).map((member) => ({
      id: member.user.id.toString(),
      fullName: member.user.name || 'Usuário sem nome',
      displayName: member.user.email?.split('@')[0] || 'usuario',
      email: member.user.email || '',
      role: member.role,
      status: 'ACTIVE',
    }));

    // Format pending invitations
    const pendingInvitations = (workspace.invitations as Invitation[]).map((invitation) => ({
      id: `invite-${invitation.id}`,
      fullName: 'Convite pendente',
      displayName: invitation.email.split('@')[0],
      email: invitation.email,
      role: invitation.role,
      status: 'PENDING',
    }));

    // Combine and sort members (active first, then pending)
    const allMembers = [...activeMembers, ...pendingInvitations];

    return NextResponse.json({ members: allMembers });

  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar membros do workspace' },
      { status: 500 }
    );
  }
}
