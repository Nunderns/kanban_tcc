import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface MemberWithUser {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

// GET — lista membros do workspace
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace não encontrada" }, { status: 404 });
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      },
      orderBy: { role: "asc" }
    });

    return NextResponse.json({
      members: members.map((member: MemberWithUser) => ({
        userId: member.userId,
        role: member.role,
        user: member.user
      }))
    });

  } catch (error) {
    console.error("Erro ao buscar membros:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log("PATCH /api/workspaces/[slug]/members - Starting...");
    const { slug } = await params;
    const { userId, role } = await req.json();
    console.log(`Request data - userId: ${userId}, role: ${role}`);

    const session = await auth();
    if (!session?.user?.email) {
      console.log("No session or user email found");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("Finding workspace...");
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!workspace) {
      console.log(`Workspace not found for slug: ${slug}`);
      return NextResponse.json({ error: "Workspace não encontrada" }, { status: 404 });
    }

    console.log("Checking admin status...");
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    const currentMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        userId: currentUser?.id,
        role: "ADMIN"
      }
    });

    if (!currentMember) {
      console.log("Current user is not an admin");
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    console.log("Updating member role...");
    const updated = await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          workspaceId: workspace.id,
          userId: userId
        }
      },
      data: {
        role: role as string
      },
      include: {
        user: true
      }
    });

    console.log("Member role updated successfully");
    return NextResponse.json({
      member: {
        userId: updated.userId,
        role: updated.role,
        user: updated.user
      }
    });

  } catch (error) {
    console.error("Error in PATCH /api/workspaces/[slug]/members:", error);
    return NextResponse.json({
      error: "Erro interno",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


// DELETE — remove um membro do workspace
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { userId } = await req.json();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace não encontrada" }, { status: 404 });
    }

    // Check if the current user is an ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    const currentMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        userId: currentUser?.id,
        role: "ADMIN"
      }
    });

    if (!currentMember) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Prevent removing the last admin
    const adminCount = await prisma.workspaceMember.count({
      where: {
        workspaceId: workspace.id,
        role: "ADMIN"
      }
    });

    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId: workspace.id,
          userId: userId
        }
      }
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
    }

    if (memberToRemove.role === "ADMIN" && adminCount <= 1) {
      return NextResponse.json({
        error: "Não é possível remover o último administrador"
      }, { status: 400 });
    }

    // Remove the member
    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          workspaceId: workspace.id,
          userId: userId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Membro removido com sucesso"
    });

  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
