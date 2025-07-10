import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Enable debug logging
const debug = process.env.NODE_ENV === 'development';

function log(...args: any[]) {
  if (debug) {
    console.log('[Invitation Accept]', ...args);
  }
}

export async function POST(req: Request) {
  try {
    log('Starting invitation acceptance');
    
    const session = await getServerSession(authOptions);
    log('Session:', session ? 'Found' : 'Not found');
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      const error = 'Usuário não autenticado';
      log(error);
      return NextResponse.json(
        { error, code: 'NOT_AUTHENTICATED' },
        { status: 401 }
      );
    }

    let token;
    try {
      const body = await req.json();
      token = body?.token;
      log('Token from request:', token ? 'Provided' : 'Missing');
    } catch (e) {
      const error = 'Erro ao processar a requisição';
      log('Error parsing request body:', e);
      return NextResponse.json(
        { error, code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }
    
    // Validate token
    if (!token) {
      const error = 'Token de convite não fornecido';
      log(error);
      return NextResponse.json(
        { error, code: 'MISSING_TOKEN' },
        { status: 400 }
      );
    }

    // Find the invitation
    log('Looking for invitation with token:', token);
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: true
      }
    });

    log('Found invitation:', invitation ? 'Yes' : 'No');
    
    // Check if invitation exists and is not expired
    if (!invitation) {
      const error = 'Convite não encontrado';
      log(error);
      return NextResponse.json(
        { error, code: 'INVITATION_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    const isExpired = new Date() > new Date(invitation.expiresAt);
    if (isExpired) {
      const error = 'Este convite expirou';
      log(error, 'Expiration date:', invitation.expiresAt);
      return NextResponse.json(
        { error, code: 'INVITATION_EXPIRED' },
        { status: 400 }
      );
    }

    // Check if user is already a member of the workspace
    log('Checking for existing workspace membership');
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        user: { email: session.user.email }
      }
    });

    if (existingMember) {
      const message = 'Você já é membro deste workspace';
      const redirectUrl = '/dashboard/my-tasks'; // Redirect to tasks dashboard
      log(message, 'Redirecting to:', redirectUrl);
      
      return NextResponse.json({
        success: true,
        message,
        redirectUrl,
        code: 'ALREADY_MEMBER'
      });
    }

    // Get the current user
    log('Fetching user:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      const error = 'Usuário não encontrado';
      log(error);
      return NextResponse.json(
        { 
          error,
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Add user to workspace
    log('Adding user to workspace');
    try {
      await prisma.$transaction([
        prisma.workspaceMember.create({
          data: {
            userId: user.id,
            workspaceId: invitation.workspaceId,
            role: invitation.role as any // Cast to any to avoid type issues
          }
        }),
        // Mark invitation as used
        prisma.invitation.update({
          where: { id: invitation.id },
          data: { 
            status: 'accepted',
            expiresAt: new Date() // Invalidate the token
          }
        })
      ]);

      const redirectUrl = '/dashboard/my-tasks'; // Redirect to tasks dashboard
      log('Success! Redirecting to:', redirectUrl);
      
      return NextResponse.json({
        success: true,
        redirectUrl,
        message: 'Convite aceito com sucesso!',
        code: 'SUCCESS'
      });
      
    } catch (error: any) {
      log('Error in transaction:', error);
      throw error; // Will be caught by the outer catch
    }

  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'Você já é membro deste workspace',
        code: 'DUPLICATE_MEMBERSHIP'
      }, { status: 400 });
    }
    
    // Handle other errors
    const errorMessage = error.message || 'Erro ao processar o convite';
    log('Error details:', error);
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
