import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendInvitationEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ message: 'Não autorizado' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new NextResponse(
        JSON.stringify({ message: 'Corpo da requisição inválido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { email, role, workspaceId } = requestBody;
    
    // Validate input
    if (!email || !role || !workspaceId) {
      return new NextResponse(
        JSON.stringify({ message: 'Campos obrigatórios faltando: email, cargo e ID do workspace são necessários' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: parseInt(workspaceId as string),
        user: {
          email: email,
        },
      },
    });

    if (existingMember) {
      return new NextResponse(
        JSON.stringify({ message: 'Este usuário já é membro do workspace' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        workspaceId: parseInt(workspaceId as string),
        status: 'pending',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return new NextResponse(
        JSON.stringify({ message: 'Já existe um convite pendente para este email' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        workspaceId: parseInt(workspaceId as string),
        expiresAt,
      },
    });

    // Get workspace info
    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(workspaceId as string) },
    });

    if (!workspace) {
      return new NextResponse(
        JSON.stringify({ message: 'Workspace não encontrado' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Enviar e-mail de convite
    try {
      await sendInvitationEmail({
        to: email,
        token,
        workspaceName: workspace.name
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      
      // Delete the invitation if email sending fails
      await prisma.invitation.delete({
        where: { id: invitation.id }
      });
      
      return new NextResponse(
        JSON.stringify({ 
          message: 'Falha ao enviar o email de convite. Por favor, tente novamente mais tarde.' 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'Convite enviado com sucesso' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Ocorreu um erro inesperado ao processar sua solicitação' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
