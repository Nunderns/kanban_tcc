import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { token, email, slug } = await req.json();

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: true,
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      },
    });

    // Check if invitation exists and is not expired
    if (!invitation) {
      return NextResponse.json({ message: 'Convite não encontrado' }, { status: 400 });
    }
    
    if (new Date() > new Date(invitation.expiresAt)) {
      return NextResponse.json({ message: 'Convite expirado' }, { status: 400 });
    }
    
    if (invitation.status !== 'pending') {
      return NextResponse.json({ message: 'Convite já utilizado' }, { status: 400 });
    }

    // Validate email and slug if provided (for new URL format)
    if (email) {
      
      if (email.toLowerCase() !== invitation.email.toLowerCase()) {
        console.log('Error: Email does not match invitation');
        return NextResponse.json({ message: 'Email does not match invitation' }, { status: 400 });
      }
    }

    if (slug) {
      // More flexible slug validation - handle special characters and multiple dashes
      const expectedSlug = invitation.workspace.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and dashes
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
      
      if (slug !== expectedSlug) {
        console.log('Slug validation failed:', { slug, expectedSlug, workspaceName: invitation.workspace.name });
        return NextResponse.json({ message: 'Invalid workspace slug' }, { status: 400 });
      }
    }

    const session = await auth();
    
    // If user is not logged in, redirect to sign in with callback URL
    if (!session?.user) {
      return NextResponse.json({
        requiresAuth: true,
        email: invitation.email,
        workspaceName: invitation.workspace.name,
        inviterName: invitation.inviter?.name,
        inviterEmail: invitation.inviter?.email,
        role: invitation.role,
      });
    }

    // Ensure user has an email address
    if (!session.user.email) {
      return NextResponse.json(
        { error: 'Usuário não possui um endereço de e-mail' },
        { status: 400 }
      );
    }
    
    if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({ message: 'Email do usuário não corresponde ao do convite' }, { status: 400 });
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
        workspaceName: invitation.workspace.name,
        redirectUrl: `/dashboard/workspaces/${invitation.workspaceId}`,
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
      workspaceName: invitation.workspace.name,
      redirectUrl: `/dashboard/workspaces/${invitation.workspaceId}`,
    });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
