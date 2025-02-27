import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Usuário não está autenticado" }, { status: 401 });
    }

    const userSession = await prisma.session.findUnique({
      where: { token },
    });

    if (!userSession) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    await prisma.session.delete({
      where: { id: userSession.id },
    });
    await cookieStore.set("auth_token", "", { expires: new Date(0) });

    return NextResponse.json({ message: "Logout realizado com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao realizar logout:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
