import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const idParam = url.pathname.split("/").slice(-2, -1)[0];
  const taskId = idParam ? Number(idParam) : null;

  if (!taskId || isNaN(taskId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const activities = await prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return NextResponse.json({ error: "Erro ao buscar atividades" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const idParam = url.pathname.split("/").slice(-2, -1)[0];
  const taskId = idParam ? Number(idParam) : null;

  if (!taskId || isNaN(taskId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const { user, action, field, oldValue, newValue } = await request.json();
    const activity = await prisma.taskActivity.create({
      data: { taskId, user, action, field, oldValue, newValue },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar atividade:", error);
    return NextResponse.json({ error: "Erro ao criar atividade" }, { status: 500 });
  }
}
