import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WorkItemFullScreenView from "@/components/WorkItemFullScreenView";
import type { WorkItem } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";

interface WorkItemPageProps {
  params: Promise<{ workspaceSlug: string; taskId: string }>;
}

export default async function WorkItemFullScreenPage({ params }: WorkItemPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceSlug, taskId } = await params;
  const numericTaskId = Number(taskId.replace(/^PRIME-/i, ""));

  if (!workspaceSlug || Number.isNaN(numericTaskId)) {
    notFound();
  }

  const userId = typeof session.user.id === "string"
    ? parseInt(session.user.id, 10)
    : session.user.id;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true, members: { where: { userId }, select: { id: true } } }
  });

  if (!workspace) {
    notFound();
  }

  if (!workspace.members.length) {
    redirect(`/${workspaceSlug}`);
  }

  const task = await prisma.task.findFirst({
    where: {
      id: numericTaskId,
      workspaceId: workspace.id
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
      user: { select: { name: true } }
    }
  });

  if (!task) {
    notFound();
  }

  const workItem: WorkItem = {
    id: task.id.toString(),
    title: task.title,
    description: task.description ?? undefined,
    status: task.status as WorkItem["status"],
    priority: task.priority as WorkItem["priority"],
    startDate: task.startDate?.toISOString(),
    dueDate: task.dueDate?.toISOString(),
    assignees: task.assignees ?? undefined,
    assignedUserId: task.assignedUserId?.toString(),
    assignedUserName: task.assignedUser?.name ?? undefined,
    module: task.module ?? undefined,
    cycle: task.cycle ?? undefined,
    labels: task.labels ?? undefined,
    creator: task.user?.name ?? undefined
  };

  return (
    <WorkItemFullScreenView
      workspaceSlug={workspaceSlug}
      initialItem={workItem}
    />
  );
}
