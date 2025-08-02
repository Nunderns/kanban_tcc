import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { randomBytes } from 'crypto';

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@kanbantcc.com';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email, role, workspaceId } = await req.json();
    
    // Validate input
    if (!email || !role || !workspaceId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if user already exists
    // const existingUser = await prisma.user.findUnique({
    //   where: { email },
    // });

    // Check if invitation already exists and is pending
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
      return new NextResponse('Invitation already sent', { status: 400 });
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    await prisma.invitation.create({
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
      return new NextResponse('Workspace not found', { status: 404 });
    }

    // Prepare the email content
    
    // Generate a secure token for the invitation
    const invitationToken = randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date();
    invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7); // 7 days from now

    // Create the invitation in the database
    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        token: invitationToken,
        expiresAt: invitationExpiresAt,
        workspaceId: workspace.id,
        role: 'MEMBER', // or whatever default role you want
        status: 'PENDING',
      },
    });

    // Prepare the invitation link
    const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite?token=${invitationToken}`;
    
    try {
      // Only try to send email if we have a valid Resend client
      if (resend) {
        const { error } = await resend.emails.send({
          from: `Kanban TCC <${fromEmail}>`,
          to: [email],
          reply_to: fromEmail,
          subject: `Você foi convidado para o workspace ${workspace.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Você foi convidado para o workspace ${workspace.name}</h2>
              <p style="color: #4b5563; margin-bottom: 20px;">Clique no botão abaixo para aceitar o convite:</p>
              <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 500;">
                Aceitar convite
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
              <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 14px;">${inviteLink}</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Este link expirará em 7 dias.</p>
            </div>
          `
        });

        if (error) {
          console.error('Error sending email:', error);
          console.warn('Failed to send invitation email, but invitation was created:', invitation.id);
        }
      } else if (NODE_ENV === 'development') {
        console.log('Email not sent - running in development mode without Resend client');
        console.log('Invitation link:', inviteLink);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error sending invitation:', error);
      return new NextResponse('Internal server error', { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
