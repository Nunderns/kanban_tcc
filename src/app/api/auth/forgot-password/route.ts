import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Se o email existir em nosso sistema, você receberá um link de recuperação.' },
        { status: 200 }
      );
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // @ts-expect-error - The Resend types might be outdated
    const { error } = await resend.emails.send({
      from: 'TaskFlow <suporte@genovatranslations.com>',
      to: email,
      subject: 'Redefinição de Senha - TaskFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a365d;">Redefinição de Senha</h2>
          <p>Olá,</p>
          <p>Você solicitou a redefinição de senha para a sua conta no TaskFlow.</p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <div style="margin: 25px 0;">
            <a 
              href="${resetUrl}" 
              style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;"
            >
              Redefinir Senha
            </a>
          </div>
          <p>Se você não solicitou esta redefinição, por favor ignore este email.</p>
          <p>Atenciosamente,<br>Equipe TaskFlow</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending reset email:', error);
      return NextResponse.json(
        { message: 'Erro ao enviar email de recuperação' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Se o email existir em nosso sistema, você receberá um link de recuperação.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}