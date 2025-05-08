import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.pathname.split("/").pop(); // extrai o ID da URL
    const id = idParam ? Number(idParam) : null;

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const data = await request.json();

    const updated = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar task:", error);
    return NextResponse.json({ error: "Erro ao atualizar task" }, { status: 500 });
  }
}
