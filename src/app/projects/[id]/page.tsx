import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectViewClient from "@/components/ProjectViewClient";

type RouteParams = { 
  id: string;
  workspaceSlug: string;
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;

  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    notFound();
  }

  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    notFound();
  }

  const project = await prisma.project.findFirst({
    where: {
      id: idNum,
      owner: { email },
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!project) {
    notFound();
  }

  const { workspaceSlug } = await params;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {project.name}
        </h1>
        <Link href={`/${workspaceSlug}/dashboard`} className="text-sm text-indigo-600 hover:underline">
          Voltar ao Dashboard
        </Link>
      </div>

      {project.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6">{project.description}</p>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>Criado em: {new Date(project.createdAt).toLocaleString()}</p>
        <p>Atualizado em: {new Date(project.updatedAt).toLocaleString()}</p>
      </div>

      <ProjectViewClient 
        projectId={project.id} 
        projectName={project.name} 
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
