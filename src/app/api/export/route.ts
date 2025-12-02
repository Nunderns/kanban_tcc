import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PrismaTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: Date | null;
  dueDate: Date | null;
  module: string | null;
  cycle: string | null;
  assignees: string[];
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  projectId: number | null;
  workspaceId: number | null;
  project: { id: number; name: string } | null;
  user: { id: number; name: string | null } | null;
}

interface PrismaProject {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaWorkspace {
  id: number;
  name: string;
  companySize: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: number; name: string | null } | null;
  members: Array<{
    id: number;
    user: { id: number; name: string | null } | null;
  }>;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: Date | null;
  dueDate: Date | null;
  module: string | null;
  cycle: string | null;
  assignees: string[];
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  project: string | null;
  creator: string;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  taskCount: number;
}

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  memberCount: number;
  taskCount: number;
}

interface User {
  id: number;
  name: string | null;
  email: string | null;
}

interface ExportData {
  tasks: Task[];
  projects: Project[];
  workspaces: Workspace[];
  exportDate: string;
  user: User;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" }
    });
    const workspaces = await prisma.workspace.findMany({
      where: { 
        OR: [
          { userId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedTasks: Task[] = tasks.map((task: PrismaTask) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate,
      dueDate: task.dueDate,
      module: task.module,
      cycle: task.cycle,
      assignees: task.assignees,
      labels: task.labels,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.project?.name || null,
      creator: task.user?.name || "Desconhecido"
    }));

    const formattedProjects: Project[] = projects.map((project: PrismaProject) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      taskCount: tasks.filter((task: PrismaTask) => task.projectId === project.id).length
    }));

    const formattedWorkspaces: Workspace[] = workspaces.map((workspace: PrismaWorkspace) => ({
      id: workspace.id,
      name: workspace.name,
      description: null,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      owner: workspace.user?.name || "Desconhecido",
      memberCount: workspace.members.length,
      taskCount: tasks.filter((task: PrismaTask) => task.workspaceId === workspace.id).length
    }));

    return NextResponse.json<ExportData>({
      tasks: formattedTasks,
      projects: formattedProjects,
      workspaces: formattedWorkspaces,
      exportDate: new Date().toISOString(),
      user: {
        id: parseInt(userId),
        name: session.user.name || null,
        email: session.user.email || null
      }
    });

  } catch (error) {
    console.error("Error fetching export data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
