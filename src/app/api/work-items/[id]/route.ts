import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: { id: string };
};

export async function PATCH(request: NextRequest, { params }: Context) {
  const id = Number(params.id);
  const data = await request.json();

  try {
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
