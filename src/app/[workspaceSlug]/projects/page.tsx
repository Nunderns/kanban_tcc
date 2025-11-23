import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectsPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { workspaceSlug } = await params;
  const session = await auth();
  
  if (!session?.user?.email) {
    return <div>Unauthorized</div>;
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      slug: workspaceSlug,
      members: {
        some: {
          user: {
            email: session.user.email,
          },
        },
      },
    },
    include: {
      projects: {
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!workspace) {
    return <div>Workspace not found or access denied</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {workspace.projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-muted-foreground mt-2">
            Get started by creating a new project
          </p>
          <div className="mt-6">
            <Link href={`/${workspaceSlug}/projects/new`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspace.projects.map((project: Project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${workspaceSlug}/projects/${project.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
