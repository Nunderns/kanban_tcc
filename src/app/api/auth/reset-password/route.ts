import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token de redefinição não fornecido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(Date.now() - 3600000),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { message: 'Erro ao redefinir a senha' },
      { status: 500 }
    );
  }
}
