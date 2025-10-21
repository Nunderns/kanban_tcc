import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/resend";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: "Este email já está cadastrado!" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    try {
      const workspaceSlug = `${name.toLowerCase().replace(/\s+/g, "-")}`;
      await sendWelcomeEmail({
        to: email,
        name: name,
        workspaceSlug: workspaceSlug
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    const workspace = await db.workspace.create({
      data: {
        name: `Espaço de trabalho do ${name}`,
        slug: `${name.toLowerCase().replace(/\s+/g, "-")}`,
        companySize: 1,
        userId: user.id,
      },
    });

    await db.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      { message: "Conta e workspace criados com sucesso!", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar:", error);
    return NextResponse.json({ error: "Erro interno ao criar conta." }, { status: 500 });
  }
}
