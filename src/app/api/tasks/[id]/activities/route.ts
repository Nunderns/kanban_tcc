import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params }: Context) {
  const taskId = Number(params.id);
  const activities = await prisma.taskActivity.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });

  const formatted = activities.map((a) =>
    a.field
      ? `${a.user} alterou ${a.field} de "${a.oldValue}" para "${a.newValue}" em ${new Date(a.createdAt).toLocaleDateString()}`
      : `${a.user} ${a.action} em ${new Date(a.createdAt).toLocaleDateString()}`
  );

  return NextResponse.json(formatted);
}

export async function POST(request: NextRequest, { params }: Context) {
  const taskId = Number(params.id);
  const body = await request.json();

  const { user, action, field, oldValue, newValue } = body;

  if (!user || !action) {
    return NextResponse.json({ error: "user e action são obrigatórios" }, { status: 400 });
  }

  try {
    await prisma.taskActivity.create({
      data: {
        taskId,
        user,
        action,
        field,
        oldValue,
        newValue,
      },
    });

    return NextResponse.json({ message: "Atividade registrada com sucesso" });
  } catch (error) {
    console.error("Erro ao criar atividade:", error);
    return NextResponse.json({ error: "Erro ao criar atividade" }, { status: 500 });
  }
}

