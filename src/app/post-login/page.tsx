import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostLoginRedirect } from "./PostLoginRedirect";

function ensureValidSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export default async function PostLogin() {
  const session = await auth();

  if (!session?.user?.email) {
    return <PostLoginRedirect workspaceSlug="login" />;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return <PostLoginRedirect workspaceSlug="login" />;
    }
    const ownedWorkspaces = await prisma.workspace.findMany({
      where: { userId: user.id },
    });

    const memberWorkspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId: user.id }
        }
      },
    });

    const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces];

    if (allWorkspaces.length === 0) {
      return <PostLoginRedirect workspaceSlug="create-workspace" />;
    }
    const uniqueWorkspaces = allWorkspaces.filter(
      (workspace, index, self) =>
        index === self.findIndex((w) => w.id === workspace.id)
    );

    const sortedWorkspaces = [...uniqueWorkspaces].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const targetWorkspace = sortedWorkspaces[0];

    if (targetWorkspace?.slug) {
      const normalizedSlug = ensureValidSlug(targetWorkspace.slug);
      return <PostLoginRedirect workspaceSlug={normalizedSlug} />;
    }

    return <PostLoginRedirect workspaceSlug="create-workspace" />;

  } catch {
    return <PostLoginRedirect workspaceSlug="create-workspace" />;
  }
}