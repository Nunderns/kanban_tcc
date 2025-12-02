import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendInvitationEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email, role, workspaceId } = await req.json();

    if (!email || !role || !workspaceId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const wsId = parseInt(workspaceId as string, 10);
    if (Number.isNaN(wsId)) {
      return NextResponse.json({ message: 'Invalid workspaceId' }, { status: 400 });
    }

    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: email.toLowerCase(),
        userId: session.user.id,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvitation) {
      return new NextResponse('Invitation already sent', { status: 400 });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const workspace = await prisma.workspace.findUnique({ where: { id: wsId } });
    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        role,
        token,
        workspaceId: wsId,
        inviterId: session.user.id,
        expiresAt,
        status: 'pending',
      },
    });

    try {
      const inviter = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true }
      });

      await sendInvitationEmail({
        to: email.toLowerCase(),
        token,
        workspaceName: workspace.name,
        inviterName: inviter?.name || undefined,
        inviterEmail: inviter?.email || undefined,
      });
    } catch (error) {
      console.error('Error sending invitation email:', error);
      await prisma.invitation.delete({ where: { id: invitation.id } });
      return NextResponse.json({ message: 'Falha ao enviar o email de convite. Por favor, tente novamente mais tarde.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
