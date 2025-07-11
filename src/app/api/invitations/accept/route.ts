import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Tipagem para a sessão do usuário
interface UserSession {
  user?: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

// Enable debug logging
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
    
    const session = await getServerSession(authOptions);
    log(`[${requestId}] Session:`, session ? 'Found' : 'Not found');
    
    // Registrar headers úteis para depuração
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    log(`[${requestId}] Request headers:`, JSON.stringify(headers, null, 2));
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      const error = 'Usuário não autenticado';
      log(`[${requestId}] ${error}`);
      return NextResponse.json(
        { 
          error, 
          code: 'NOT_AUTHENTICATED',
          requestId
        },
        { status: 401 }
      );
    }

    let token: string | undefined;
    
    try {
      const requestData = await req.json() as { token?: string };
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
      log(`[${requestId}] Token from request: Received`);
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

    // Find the invitation
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
    
    // Check if invitation exists and is not expired
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
    
    // Type guard para garantir que o workspace está presente
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
    
    // Garantir que o workspaceId está definido
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
    
    // Check if invitation is already used
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

    // Check if user is already a member of the workspace
    log(`[${requestId}] Checking for existing workspace membership`);
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        user: { email: session.user.email }
      },
      select: {
        id: true,
        role: true,
        joinedAt: true
      }
    });

    if (existingMember) {
      const message = 'Você já é membro deste workspace';
      const redirectUrl = '/dashboard/my-tasks'; // Redirect to tasks dashboard
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

    // Get the current user
    const userSession = session as UserSession;
    const userEmail = userSession?.user?.email;
    
    if (!userEmail) {
      const error = 'Usuário não autenticado';
      log(`[${requestId}] ${error}`);
      return NextResponse.json(
        { error, code: 'NOT_AUTHENTICATED' },
        { status: 401 }
      );
    }

    log(`[${requestId}] Fetching user with email:`, userEmail);
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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
      const error = 'Usuário não encontrado';
      log(`[${requestId}] ${error}`, { email: userEmail });
      return NextResponse.json(
        { 
          error,
          code: 'USER_NOT_FOUND',
          requestId,
          email: userEmail
        },
        { status: 404 }
      );
    }
    
    log(`[${requestId}] User found:`, { 
      userId: user.id, 
      name: user.name,
      hasImage: 'image' in user ? !!user.image : false
    });
    
    // Verificar se o e-mail do convite corresponde ao e-mail do usuário autenticado
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      const error = 'Este convite não é para o seu endereço de e-mail';
      log(`[${requestId}] ${error}`, { 
        invitationEmail: invitation.email, 
        userEmail 
      });
      return NextResponse.json(
        { 
          error,
          code: 'INVALID_INVITATION_RECIPIENT',
          details: 'O convite foi enviado para um endereço de e-mail diferente',
          requestId
        },
        { status: 403 }
      );
    }

    // Add user to workspace
    log('Adding user to workspace');
    try {
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      if (!invitation.workspaceId) {
        throw new Error('ID do workspace não encontrado');
      }

      // Usar uma transação para garantir a atomicidade das operações
      log('Starting transaction to accept invitation and add user to workspace');
      log('Invitation ID:', invitation.id);
      log('User ID:', user.id);
      log('Workspace ID:', invitation.workspaceId);
      log('Role:', invitation.role);
      
      try {
        await prisma.$transaction([
          // Atualizar o convite primeiro para evitar condições de corrida
          prisma.invitation.update({
            where: { id: invitation.id },
            data: { 
              status: 'accepted',
              expiresAt: new Date() // Invalidar o token
            }
          }),
          
          // Adicionar usuário ao workspace
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
        throw transactionError; // Será capturado pelo bloco catch externo
      }
      
      // Nota: Comentado o log de auditoria até que o modelo AuditLog seja definido
      /*
      await prisma.auditLog.create({
        data: {
          action: 'INVITATION_ACCEPTED',
          userId: user.id,
          workspaceId: invitation.workspaceId,
          metadata: {
            invitationId: invitation.id,
            invitedEmail: invitation.email,
            role: invitation.role
          }
        }
      });
      */

      const redirectUrl = '/dashboard/my-tasks'; // Redirect to tasks dashboard
      log('Success! Redirecting to:', redirectUrl);
      
      // Buscar detalhes atualizados do workspace para a resposta
      const updatedWorkspace = await prisma.workspace.findUnique({
        where: { id: invitation.workspaceId },
        select: {
          id: true,
          name: true,
          _count: {
            select: { 
              members: true
              // Apenas membros, pois é o único contador disponível no modelo
            }
          }
        }
      });
      
      // Verificar se o workspace foi encontrado
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
      
      // Verificar se o usuário foi realmente adicionado ao workspace
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
      
      // Criar tipo para a resposta de sucesso
      interface SuccessResponseData {
        success: boolean;
        redirectUrl: string;
        message: string;
        code: string;
        requestId: string;
        data: {
          workspace: typeof updatedWorkspace;
          user: {
            id: string;
            email: string | null;
            name: string | null;
          };
          role: string;
          acceptedAt: string;
          membership: {
            id: string | number;  // Handle both string and number types for ID
            role: string;
            joinedAt: string;
          };
        };
      }

      // Ensure consistent typing for membership ID
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
            joinedAt: isMember.joinedAt.toISOString() // Convert Date to ISO string
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
      
      // Handle specific Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; meta?: Record<string, unknown> };
        
        switch (prismaError.code) {
          case 'P2002': // Unique constraint violation
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
            
          case 'P2003': // Foreign key constraint violation
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
            
          case 'P2025': // Record not found
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
      
      // For all other errors, re-throw to be caught by the outer catch
      throw error;
    }

  } catch (error) {
    console.error('Error accepting invitation:', error);
    
    // Tratar erros específicos do Prisma
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
    
    // Tratar outros erros
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
