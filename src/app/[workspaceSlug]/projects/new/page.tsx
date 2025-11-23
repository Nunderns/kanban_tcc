import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateProjectForm } from '@/components/projects/CreateProjectForm';

interface NewProjectPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  const { workspaceSlug } = await params;
  const session = await auth();
  
  if (!session?.user?.email) {
    return notFound();
  }

  const workspace = await prisma.workspace.findFirst({
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
  });

  if (!workspace) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Project in {workspace.name}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <CreateProjectForm workspaceSlug={workspaceSlug} />
        </div>
      </div>
    </div>
  );
}
