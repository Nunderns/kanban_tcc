import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse('Token is required', { status: 400 });
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    // Check if invitation exists and is not expired
    if (!invitation || new Date() > new Date(invitation.expiresAt) || invitation.status !== 'pending') {
      return new NextResponse('Convite inválido ou expirado', { status: 400 });
    }

    const session = await auth();
    
    // If user is not logged in, redirect to sign up with email prefilled
    if (!session?.user) {
      return NextResponse.json({
        requiresSignUp: true,
        email: invitation.email,
        workspaceName: invitation.workspace.name,
      });
    }

    // Ensure user has an email address
    if (!session.user.email) {
      return NextResponse.json(
        { error: 'Usuário não possui um endereço de e-mail' },
        { status: 400 }
      );
    }

    // Check if user is already a member of the workspace
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        user: {
          email: session.user.email,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({
        message: 'Você já é membro deste workspace',
        workspaceId: invitation.workspaceId,
      });
    }

    // Add user to workspace
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          userId: parseInt(session.user.id as string),
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' },
      }),
    ]);

    return NextResponse.json({
      message: 'Convite aceito com sucesso',
      workspaceId: invitation.workspaceId,
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
