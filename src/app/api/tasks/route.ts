import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, status, userId, projectId } = body;

  if (!title || !userId) {
    return NextResponse.json({ error: "title e userId são obrigatórios" }, { status: 400 });
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      status: status ?? "TODO",
      userId,
      projectId: projectId ?? null,
    },
  });

  return NextResponse.json(newTask);
}
