import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendInvitationEmail } from '@/lib/resend';

// Using environment variables directly

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email, role, workspaceId } = await req.json();

    // Validate input
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
        workspaceId: parseInt(workspaceId as string),
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvitation) {
      return new NextResponse('Invitation already sent', { status: 400 });
    }

    // Generate token and expiry
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Ensure workspace exists before creating invitation
    const workspace = await prisma.workspace.findUnique({ where: { id: wsId } });
    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    // Create invitation (single creation)
    const invitation = await prisma.invitation.create({
      data: {
        email: email.toLowerCase(),
        role,
        token,
        workspaceId: wsId,
        expiresAt,
        status: 'pending',
      },
    });

    // Send email via centralized helper
    try {
      await sendInvitationEmail({
        to: email.toLowerCase(),
        token,
        workspaceName: workspace.name,
      });
    } catch (error) {
      console.error('Error sending invitation email:', error);
      // rollback: delete invitation if email send fails
      await prisma.invitation.delete({ where: { id: invitation.id } });
      return NextResponse.json({ message: 'Falha ao enviar o email de convite. Por favor, tente novamente mais tarde.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
