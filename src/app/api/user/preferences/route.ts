import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  console.log('GET /api/user/preferences - Iniciando...');
  
  try {
    console.log('Obtendo sessão...');
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return new NextResponse("Não autorizado", { status: 401 });
    }

    console.log('Buscando preferências do usuário:', session.user.email);
    
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { firstDayOfWeek: true }
      });

      if (!user) {
        console.log('Usuário não encontrado no banco de dados');
        return new NextResponse("Usuário não encontrado", { status: 404 });
      }

      console.log('Preferências encontradas:', { firstDayOfWeek: user.firstDayOfWeek });
      
      return NextResponse.json({
        firstDayOfWeek: user.firstDayOfWeek || 'sunday'
      });
      
    } catch (dbError) {
      console.error('Erro ao buscar no banco de dados:', dbError);
      return new NextResponse("Erro ao acessar o banco de dados", { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro inesperado ao processar requisição:', error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  } finally {
    console.log('GET /api/user/preferences - Finalizado');
  }
}

export async function PUT(request: Request) {
  console.log('PUT /api/user/preferences - Iniciando...');
  
  try {
    console.log('Obtendo sessão...');
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return new NextResponse("Não autorizado", { status: 401 });
    }

    console.log('Processando corpo da requisição...');
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Corpo da requisição:', requestBody);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      return new NextResponse("Formato de requisição inválido", { status: 400 });
    }

    const { firstDayOfWeek } = requestBody;

    if (!firstDayOfWeek || (firstDayOfWeek !== 'sunday' && firstDayOfWeek !== 'monday')) {
      console.error('Valor inválido para primeiro dia da semana:', firstDayOfWeek);
      return new NextResponse("Valor inválido para primeiro dia da semana. Deve ser 'sunday' ou 'monday'.", { status: 400 });
    }

    console.log('Atualizando preferências do usuário:', session.user.email, { firstDayOfWeek });
    
    try {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { firstDayOfWeek }
      });

      console.log('Preferências atualizadas com sucesso');
      return NextResponse.json({ 
        success: true,
        firstDayOfWeek 
      });
      
    } catch (dbError) {
      console.error('Erro ao atualizar banco de dados:', dbError);
      return new NextResponse("Erro ao atualizar as preferências no banco de dados", { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro inesperado ao processar requisição:', error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  } finally {
    console.log('PUT /api/user/preferences - Finalizado');
  }
}
