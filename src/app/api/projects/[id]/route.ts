import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ tipo correto da assinatura
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 observe o Promise
) {
  const { id } = await params; // 👈 precisa dar await
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
  try {
    await prisma.task.deleteMany({ where: { projectId: Number(id) } });
    await prisma.project.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Erro ao excluir projeto' }, { status: 500 });
  }
}
