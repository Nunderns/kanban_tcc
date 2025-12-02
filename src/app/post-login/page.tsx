import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeSlug(slug: string): string {
  return slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .toLowerCase();
}

export default async function PostLogin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const ownedWorkspaces = await prisma.workspace.findMany({
    where: { userId: user.id },
    take: 1,
  });

  const memberWorkspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId: user.id }
      }
    },
    take: 1,
  });

  const firstWorkspace = ownedWorkspaces[0] || memberWorkspaces[0];

  if (firstWorkspace?.slug) {
    const normalizedSlug = normalizeSlug(firstWorkspace.slug);
    redirect(`/${normalizedSlug}`);
  }
  redirect("/create-workspace");
}
