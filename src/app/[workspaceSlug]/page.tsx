import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format, formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { redirect } from 'next/navigation';
import { ActionCard } from '@/components/workspace/ActionCard';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';
export const dynamic = 'force-dynamic';

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getTaskIcon(status: string) {
  const icons: Record<string, string> = {
    BACKLOG: '📋',
    TODO: '📝',
    IN_PROGRESS: '🔄',
    DONE: '✅',
  };
  return icons[status] || '📋';
}

function getPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    NONE: 'Nenhuma',
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
  };
  return labels[priority] || priority;
}

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    HIGH: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
    LOW: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    NONE: 'bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400',
  };
  return colors[priority] || 'bg-gray-900/50 text-gray-400';
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  updatedAt: Date;
  assignedUser?: {
    name: string;
  };
}

interface WorkspacePageProps {
  params: Promise<{ workspaceSlug: string }>;
}

function normalizeSlug(slug: string): string {
  return slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .toLowerCase();
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceSlug } = await params;
  const decodedSlug = decodeURIComponent(workspaceSlug);
  const normalizedSlug = normalizeSlug(decodedSlug);

  const session = await getServerSession();
  const now = toZonedTime(new Date(), BRAZIL_TIMEZONE);

  if (!session) return redirect('/login');

  // Debug logging to check session user ID type
  console.log('Session user ID:', session.user.id, 'Type:', typeof session.user.id);

  const workspace = await prisma.workspace.findFirst({
    where: { 
      slug: normalizedSlug,
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
    include: { user: true },
  });

  if (!workspace) return redirect('/create-workspace');

  const recentTasks = await prisma.task.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  const formattedDate = format(now, "EEEE, d 'de' MMMM '·' HH:mm", { 
    locale: ptBR
  });
  const greeting = getGreeting(now);

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <header className="flex flex-col items-center sm:items-start mb-10 text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
        {greeting}, {session.user?.name?.split(' ')[0] || 'Usuário'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
        {formattedDate} {now.getHours() >= 18 ? '🌙' : now.getHours() >= 12 ? '☀️' : '🌅'}
      </p>
    </header>
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <ActionCard
        title="Criar um projeto"
        description="A maioria das coisas começa com um projeto no Plane."
        buttonText="Criar"
        href={`/${workspaceSlug}/new`}
      />
      <ActionCard
        title="Convide sua equipe"
        description="Construa e gerencie com colegas de trabalho."
        buttonText="Convidar"
        href={`/${workspaceSlug}/settings/members`}
      />
      <ActionCard
        title="Personalize o espaço"
        description="Escolha foto, cores e muito mais."
        buttonText="Personalizar"
        href={`/${workspaceSlug}/settings`}
      />
    </section>
    <section>
      <h3 className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs mb-3 font-medium">
        Tarefas Recentes
      </h3>
      <div className="space-y-2">
        {recentTasks.length === 0 ? (
          <div className="flex items-center justify-center bg-white dark:bg-gray-800 px-4 py-8 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Nenhuma tarefa encontrada neste workspace
            </p>
          </div>
        ) : (
          recentTasks.map((task: Task) => (
            <a
              key={task.id}
              href={`/${workspaceSlug}/tasks/${task.id}`}
              className="block no-underline"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-sm">{getTaskIcon(task.status)}</span>
                  <div className="flex flex-col truncate">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      #{String(task.id).padStart(3, '0')}
                    </span>
                    <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {task.title}
                    </span>
                    {task.assignedUser && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Responsável: {task.assignedUser.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0 space-x-2">
                  {task.priority !== 'NONE' && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(task.updatedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  </div>
);

}
