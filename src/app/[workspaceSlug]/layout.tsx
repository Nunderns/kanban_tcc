import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

return (
  <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 lg:h-screen lg:flex-row">
    <Sidebar workspaceSlug={workspaceSlug} />
    <main className="flex-1 overflow-y-auto p-0">{children}</main>
  </div>
);

}
