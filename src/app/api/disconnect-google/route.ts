import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await prisma.account.deleteMany({
            where: {
                provider: "google",
                user: {
                    email: session.user.email,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao desconectar Google:", error);
        return NextResponse.json(
            { error: "Erro ao desconectar conta Google" },
            { status: 500 }
        );
    }
}
