import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
  });

  return NextResponse.json(workspaces);
}
