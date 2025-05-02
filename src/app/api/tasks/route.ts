import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// Helper para tratamento de erros
const handleServerError = (error: unknown) => {
    console.error("Server error:", error);
  
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  };
  
// GET: Listar todas as tarefas
export async function GET(request: Request) {
  try {
    // Obter query parameters para filtros
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    // Construir where clause dinâmico
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = Number(userId);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tasks);
    
  } catch (error) {
    return handleServerError(error);
  }
}

// POST: Criar nova tarefa
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação básica
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const userId = Number(body.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
        data: {
          title: body.title,
          description: body.description || null,
          status: body.status || "BACKLOG",
          priority: body.priority || "NONE",
          userId: userId,
          projectId: body.projectId ? Number(body.projectId) : null,
          assignees: body.assignees ?? [], // <- substitui null por array vazio
          labels: body.labels ?? [],       // <- substitui null por array vazio
          startDate: body.startDate || null,
          dueDate: body.dueDate || null
        }
      });
      

    return NextResponse.json(newTask, { status: 201 });
    
  } catch (error) {
    return handleServerError(error);
  }
}