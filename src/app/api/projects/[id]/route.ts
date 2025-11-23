import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Erro ao buscar projeto' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json();

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Erro ao atualizar projeto' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = Number(id);
  
  if (isNaN(projectId)) {
    return NextResponse.json(
      { error: 'ID do projeto inválido' }, 
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.task.deleteMany({
        where: { projectId: projectId }
      }),
      prisma.project.delete({
        where: { id: projectId }
      })
    ]);

    return NextResponse.json(
      { message: 'Projeto e tarefas associadas excluídos com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: Record<string, unknown> };
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { 
            error: 'Projeto não encontrado',
            code: 'NOT_FOUND',
            details: process.env.NODE_ENV === 'development' ? prismaError.meta : undefined
          },
          { status: 404 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir projeto';
    return NextResponse.json(
      { 
        error: errorMessage,
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : undefined
      }, 
      { status: 500 }
    );
  }
}
