import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { firstDayOfWeek: true }
      });

      if (!user) {
        return new NextResponse("Usuário não encontrado", { status: 404 });
      }
      return NextResponse.json({
        firstDayOfWeek: user.firstDayOfWeek || 'sunday'
      });
      
    } catch {
      return new NextResponse("Erro ao acessar o banco de dados", { status: 500 });
    }
    
  } catch {
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return new NextResponse("Formato de requisição inválido", { status: 400 });
    }

    const { firstDayOfWeek } = requestBody;

    if (!firstDayOfWeek || (firstDayOfWeek !== 'sunday' && firstDayOfWeek !== 'monday')) {
      return new NextResponse("Valor inválido para primeiro dia da semana. Deve ser 'sunday' ou 'monday'.", { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { firstDayOfWeek }
      });

      return NextResponse.json({ 
        success: true,
        firstDayOfWeek 
      });
      
    } catch {
      return new NextResponse("Erro ao atualizar as preferências no banco de dados", { status: 500 });
    }
    
  } catch {
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
