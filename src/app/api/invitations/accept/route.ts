import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

interface UserSession {
  user?: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

const debug = process.env.NODE_ENV === 'development';

function log(...args: unknown[]) {
  if (debug) {
    console.log('[Invitation Accept]', ...args);
  }
}

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);
  
  try {
    log(`[${requestId}] Starting invitation acceptance`);
    log(`[${requestId}] Request URL:`, req.url);
    log(`[${requestId}] Request method:`, req.method);
    
    const session = await auth();
    log(`[${requestId}] Session:`, session ? 'Found' : 'Not found');
    
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    log(`[${requestId}] Request headers:`, JSON.stringify(headers, null, 2));
    
    let token: string | undefined;
    let email: string | undefined;
    let slug: string | undefined;
    
    try {
      const requestData = await req.json() as { token?: string; email?: string; slug?: string };
      log(`[${requestId}] Request data:`, JSON.stringify(requestData, null, 2));
      
      if (!requestData?.token || typeof requestData.token !== 'string') {
        const error = 'Token de convite inválido';
        log(`[${requestId}] ${error}`);
        return NextResponse.json(
          { 
            error, 
            code: 'INVALID_TOKEN',
            requestId,
            receivedToken: requestData?.token
          },
          { status: 400 }
        );
      }
      
      token = requestData.token;
      email = requestData.email;
      slug = requestData.slug;
      log(`[${requestId}] Token from request: Received`);
    } catch (e) {
      const error = 'Erro ao processar a requisição';
      log('Error parsing request body:', e);
      return NextResponse.json(
        { error, code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }
    
    if (!token) {
      const error = 'Token de convite não fornecido';
      log(`[${requestId}] ${error}`);
      return NextResponse.json(
        { 
          error, 
          code: 'MISSING_TOKEN',
          requestId
        },
        { status: 400 }
      );
    }

    log(`[${requestId}] Looking for invitation with token:`, token.substring(0, 8) + '...');
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    log(`[${requestId}] Found invitation:`, invitation ? 'Yes' : 'No');
    
    if (!invitation) {
      const error = 'Convite inválido ou expirado';
      log(`[${requestId}] ${error}`);
      return NextResponse.json(
        { 
          error,
          code: 'INVALID_OR_EXPIRED_INVITATION',
          requestId,
          token: token.substring(0, 8) + '...'
        },
        { status: 400 }
      );
    }
    
    if (!invitation.workspace) {
      const error = 'Workspace não encontrado para o convite';
      log(`[${requestId}] ${error}:`, invitation.id);
      return NextResponse.json(
        { 
          error,
          code: 'WORKSPACE_NOT_FOUND',
          requestId,
          invitationId: invitation.id
        },
        { status: 404 }
      );
    }
    
    if (!invitation.workspaceId) {
      const error = 'ID do workspace não encontrado';
      log(`[${requestId}] ${error} para o convite:`, invitation.id);
      return NextResponse.json(
        { 
          error,
          code: 'WORKSPACE_ID_MISSING',
          requestId,
          invitationId: invitation.id
        },
        { status: 500 }
      );
    }
    
    if (email && invitation.email !== email) {
      const error = 'O email do convite não corresponde ao email fornecido';
      log(`[${requestId}] ${error}`, { 
        invitationEmail: invitation.email, 
        providedEmail: email 
      });
      return NextResponse.json(
        { 
          error, 
          code: 'EMAIL_MISMATCH',
          requestId
        },
        { status: 400 }
      );
    }
    
    if (slug) {
      const expectedSlug = invitation.workspace.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''); 
      
      if (slug !== expectedSlug) {
        const error = 'O slug do workspace não corresponde ao esperado';
        log(`[${requestId}] ${error}`, { 
          expectedSlug, 
          providedSlug: slug,
          workspaceName: invitation.workspace.name
        });
        return NextResponse.json(
          { 
            error, 
            code: 'SLUG_MISMATCH',
            requestId
          },
          { status: 400 }
        );
      }
    }
    
    if (invitation.status !== 'pending') {
      const error = 'Este convite já foi utilizado';
      log(`[${requestId}] ${error}`, { 
        invitationId: invitation.id, 
        status: invitation.status 
      });
      return NextResponse.json(
        { 
          error, 
          code: 'INVITATION_ALREADY_USED',
          requestId,
          invitationId: invitation.id,
          currentStatus: invitation.status
        },
        { status: 400 }
      );
    }
    
    const isExpired = new Date() > new Date(invitation.expiresAt);
    if (isExpired) {
      const error = 'Este convite expirou';
      log(`[${requestId}] ${error}`, { 
        invitationId: invitation.id,
        expiresAt: invitation.expiresAt,
        currentTime: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          error, 
          code: 'INVITATION_EXPIRED',
          requestId,
          invitationId: invitation.id,
          expiresAt: invitation.expiresAt
        },
        { status: 400 }
      );
    }

    const invitationEmail = invitation.email;
    
    log(`[${requestId}] Checking for existing workspace membership`);
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        user: { email: invitationEmail }
      },
      select: {
        id: true,
        role: true,
        joinedAt: true
      }
    });

    if (existingMember) {
      const message = 'Você já é membro deste workspace';
      const redirectUrl = '[workspaceSlug]/dashboard/my-tasks';
      log(`[${requestId}] ${message}`, { 
        redirectUrl,
        existingMembership: existingMember
      });
      
      return NextResponse.json({
        success: true,
        message,
        redirectUrl,
        code: 'ALREADY_MEMBER',
        requestId,
        existingMembership: {
          id: existingMember.id,
          role: existingMember.role,
          since: existingMember.joinedAt
        }
      });
    }

    const userSession = session as UserSession;
    const sessionEmail = userSession?.user?.email;
    
    if (!sessionEmail && !email) {
      const error = 'Usuário não autenticado e email não fornecido';
      log(`[${requestId}] ${error}`);
      return NextResponse.json(
        { error, code: 'NOT_AUTHENTICATED_NO_EMAIL' },
        { status: 401 }
      );
    }
    
    const targetEmail = sessionEmail || email || invitationEmail;
    
    log(`[${requestId}] Fetching user with email:`, targetEmail);
    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { 
        workspaces: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    if (!user) {
      log(`[${requestId}] Creating new user for email:`, targetEmail);
      
      try {
        const newUser = await prisma.user.create({
          data: {
            email: targetEmail,
            name: targetEmail.split('@')[0].charAt(0).toUpperCase() + targetEmail.split('@')[0].slice(1),
            emailVerified: new Date(),
          }
        });
        
        log(`[${requestId}] New user created:`, { 
          userId: newUser.id, 
          email: newUser.email,
          name: newUser.name
        });
        
        user = newUser;
      } catch (error) {
        const errorMessage = 'Erro ao criar novo usuário';
        log(`[${requestId}] ${errorMessage}:`, error);
        return NextResponse.json(
          { 
            error: errorMessage,
            code: 'USER_CREATION_FAILED',
            requestId,
            email: targetEmail
          },
          { status: 500 }
        );
      }
    }
    
    log(`[${requestId}] User found:`, { 
      userId: user.id, 
      name: user.name,
      hasImage: 'image' in user ? !!user.image : false
    });
    
    log(`[${requestId}] Email check:`, { 
      invitationEmail, 
      sessionEmail: sessionEmail || 'N/A',
      match: sessionEmail ? invitationEmail.toLowerCase() === sessionEmail.toLowerCase() : false
    });
    
    if (sessionEmail && invitationEmail.toLowerCase() !== sessionEmail.toLowerCase()) {
      log(`[${requestId}] Email mismatch but allowing acceptance for existing user`);
    }

    log('Adding user to workspace');
    try {
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      if (!invitation.workspaceId) {
        throw new Error('ID do workspace não encontrado');
      }

      log('Starting transaction to accept invitation and add user to workspace');
      log('Invitation ID:', invitation.id);
      log('User ID:', user.id);
      log('Workspace ID:', invitation.workspaceId);
      log('Role:', invitation.role);
      
      try {
        await prisma.$transaction([
          prisma.invitation.update({
            where: { id: invitation.id },
            data: { 
              status: 'accepted',
              expiresAt: new Date()
            }
          }),
          
          prisma.workspaceMember.create({
            data: {
              userId: user.id,
              workspaceId: invitation.workspaceId,
              role: invitation.role
            }
          })
        ]);
        
        log('Transaction completed successfully');
      } catch (transactionError) {
        const errorMessage = transactionError instanceof Error ? transactionError.message : 'Erro desconhecido na transação';
        log('Transaction failed:', errorMessage);
        throw transactionError; 
      }
      const redirectUrl = '/dashboard/my-tasks'; 
      log('Success! Redirecting to:', redirectUrl);
      
      const updatedWorkspace = await prisma.workspace.findUnique({
        where: { id: invitation.workspaceId },
        select: {
          id: true,
          name: true,
          _count: {
            select: { 
              members: true
            }
          }
        }
      });
      
      if (!updatedWorkspace) {
        const error = 'Workspace não encontrado após aceitação do convite';
        log(`[${requestId}] ${error}`);
        return NextResponse.json(
          { 
            error,
            code: 'WORKSPACE_NOT_FOUND_AFTER_ACCEPTANCE',
            details: 'O workspace não pôde ser localizado após a aceitação do convite',
            requestId
          },
          { status: 404 }
        );
      }
      
      const isMember = await prisma.workspaceMember.findFirst({
        where: {
          userId: user.id,
          workspaceId: invitation.workspaceId
        },
        select: { 
          id: true,
          role: true,
          joinedAt: true
        }
      });
      
      if (!isMember) {
        const error = 'Falha ao adicionar usuário ao workspace';
        log(`[${requestId}] ${error}`, { 
          userId: user.id,
          workspaceId: invitation.workspaceId
        });
        return NextResponse.json(
          { 
            error,
            code: 'MEMBERSHIP_CREATION_FAILED',
            details: 'O usuário não pôde ser adicionado ao workspace',
            requestId,
            userId: user.id,
            workspaceId: invitation.workspaceId
          },
          { status: 500 }
        );
      }
      
      interface SuccessResponseData {
        success: boolean;
        redirectUrl: string;
        message: string;
        code: string;
        requestId: string;
        data: {
          workspace: typeof updatedWorkspace;
          user: {
            id: string | number;
            email: string | null;
            name: string | null;
          };
          role: string;
          acceptedAt: string;
          membership: {
            id: string | number;
            role: string;
            joinedAt: string;
          };
        };
      }

      const membershipId = typeof isMember.id === 'number' 
        ? isMember.id.toString() 
        : isMember.id;

      const responseData: SuccessResponseData = {
        success: true,
        redirectUrl,
        message: 'Convite aceito com sucesso!',
        code: 'SUCCESS',
        requestId,
        data: {
          workspace: updatedWorkspace,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          },
          role: invitation.role,
          acceptedAt: new Date().toISOString(),
          membership: {
            id: membershipId,
            role: isMember.role,
            joinedAt: isMember.joinedAt.toISOString()
          }
        }
      };
      
      log(`[${requestId}] Convite aceito com sucesso:`, {
        userId: user.id,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
        membershipId: isMember.id
      });
      
      return NextResponse.json(responseData);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na transação';
      const errorCode = error && typeof error === 'object' && 'code' in error ? 
        (error as { code: string }).code : 'UNKNOWN_ERROR';
      
      log(`[${requestId}] Error in transaction:`, { 
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString()
      });
      
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; meta?: Record<string, unknown> };
        
        switch (prismaError.code) {
          case 'P2002':
            log(`[${requestId}] Duplicate membership detected`, { 
              userId: user?.id,
              workspaceId: invitation?.workspaceId,
              errorMeta: prismaError.meta
            });
            return NextResponse.json({
              error: 'Você já é membro deste workspace',
              code: 'DUPLICATE_MEMBERSHIP',
              requestId,
              details: process.env.NODE_ENV === 'development' ? {
                message: errorMessage,
                meta: prismaError.meta
              } : undefined
            }, { status: 400 });
            
          case 'P2003':
            log(`[${requestId}] Foreign key constraint failed`, { 
              errorMeta: prismaError.meta,
              userId: user?.id,
              invitationId: invitation?.id
            });
            return NextResponse.json({
              error: 'Dados inválidos fornecidos',
              code: 'INVALID_DATA',
              requestId,
              details: process.env.NODE_ENV === 'development' ? {
                message: errorMessage,
                meta: prismaError.meta
              } : undefined
            }, { status: 400 });
            
          case 'P2025':
            log(`[${requestId}] Record not found in database`, { 
              errorMeta: prismaError.meta,
              userId: user?.id,
              invitationId: invitation?.id
            });
            return NextResponse.json({
              error: 'Registro não encontrado',
              code: 'NOT_FOUND',
              requestId,
              details: process.env.NODE_ENV === 'development' ? {
                message: errorMessage,
                meta: prismaError.meta
              } : undefined
            }, { status: 404 });
        }
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Error accepting invitation:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: Record<string, unknown> };
      
      switch (prismaError.code) {
        case 'P2002':
          return NextResponse.json({
            error: 'Conflito de dados - registro duplicado',
            code: 'CONFLICT',
            details: process.env.NODE_ENV === 'development' ? prismaError.meta : undefined
          }, { status: 409 });
          
        case 'P2025':
          return NextResponse.json({
            error: 'Registro não encontrado',
            code: 'NOT_FOUND',
            details: process.env.NODE_ENV === 'development' ? prismaError.meta : undefined
          }, { status: 404 });
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar o convite';
    log('Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        error: 'Ocorreu um erro inesperado',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
