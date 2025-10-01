import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { token, email, slug } = await req.json();
    console.log('Verify invitation request:', { token, email, slug });

    if (!token) {
      console.log('Error: Token is required but not provided');
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

    console.log('Found invitation:', {
      id: invitation?.id,
      email: invitation?.email,
      status: invitation?.status,
      expiresAt: invitation?.expiresAt,
      workspaceName: invitation?.workspace.name
    });

    // Check if invitation exists and is not expired
    if (!invitation) {
      console.log('Error: Invitation not found for token:', token);
      return NextResponse.json({ message: 'Convite não encontrado' }, { status: 400 });
    }
    
    if (new Date() > new Date(invitation.expiresAt)) {
      console.log('Error: Invitation expired at:', invitation.expiresAt);
      return NextResponse.json({ message: 'Convite expirado' }, { status: 400 });
    }
    
    if (invitation.status !== 'pending') {
      console.log('Error: Invitation already processed, status:', invitation.status);
      return NextResponse.json({ message: 'Convite já utilizado' }, { status: 400 });
    }

    // Validate email and slug if provided (for new URL format)
    if (email) {
      console.log('Email validation:', { 
        providedEmail: email, 
        invitationEmail: invitation.email,
        match: email.toLowerCase() === invitation.email.toLowerCase()
      });
      
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
      
      console.log('Slug validation:', { 
        providedSlug: slug, 
        expectedSlug, 
        workspaceName: invitation.workspace.name,
        match: slug === expectedSlug
      });
      
      if (slug !== expectedSlug) {
        console.log('Slug validation failed:', { slug, expectedSlug, workspaceName: invitation.workspace.name });
        return NextResponse.json({ message: 'Invalid workspace slug' }, { status: 400 });
      }
    }

    const session = await auth();
    console.log('Session check:', { 
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });
    
    // If user is not logged in, redirect to sign in with callback URL
    if (!session?.user) {
      console.log('User not logged in, redirecting to sign in');
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
      console.log('User has no email address');
      return NextResponse.json(
        { error: 'Usuário não possui um endereço de e-mail' },
        { status: 400 }
      );
    }

    // Check if the logged-in user email matches the invitation email
    console.log('Email match check:', {
      sessionEmail: session.user.email.toLowerCase(),
      invitationEmail: invitation.email.toLowerCase(),
      match: session.user.email.toLowerCase() === invitation.email.toLowerCase()
    });
    
    // Allow users to accept invitations even if emails don't match
    // This enables users to invite others who are already logged in
    if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      console.log('Email mismatch but allowing acceptance for existing user');
      // Continue with the process - don't return error
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
  } catch (error) {
    console.error('Error verifying invitation:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
