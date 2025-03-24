import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Certifique-se de que o caminho está correto

export async function GET() {
  try {
    // Contar o total de projetos
    const totalProjects = await prisma.project.count();

    // Contar o total de tarefas
    const totalTasks = await prisma.task.count();

    // Contar as tarefas atribuídas a usuários
    const assignedTasks = await prisma.task.count({
      where: { userId: { not: undefined } }, // ✅ Agora funciona corretamente
    });

    // Contar as tarefas concluídas
    const completedTasks = await prisma.task.count({
      where: { status: "DONE" },
    });

    // Buscar detalhes das tarefas e projetos
    const projects = await prisma.project.findMany({
      select: { id: true, name: true },
    });

    const tasks = await prisma.task.findMany({
      select: { id: true, title: true, description: true },
    });

    const members = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({
      totalProjects,
      totalTasks,
      assignedTasks,
      completedTasks,
      projects,
      tasks,
      members,
    });
  } catch (error) {
    console.error("❌ Erro na API /api/dashboard:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
