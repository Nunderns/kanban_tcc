import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PostLogin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      workspaceMembers: {
        include: { workspace: true },
        orderBy: { joinedAt: "asc" },
        take: 1,
      },
    },
  });

  const first = user?.workspaceMembers?.[0]?.workspace;

  if (first?.slug) {
    redirect(`/${first.slug}/dashboard`);
  }

  // If user has no workspace yet, send to create workspace flow
  redirect("/create-workspace");
}
