import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { redirect } from 'next/navigation';

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
    HIGH: 'bg-red-900/50 text-red-400',
    MEDIUM: 'bg-yellow-900/50 text-yellow-400',
    LOW: 'bg-blue-900/50 text-blue-400',
    NONE: 'bg-gray-900/50 text-gray-400',
  };
  return colors[priority] || 'bg-gray-900/50 text-gray-400';
}

interface WorkspacePageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceSlug } = await params;

  const session = await getServerSession();
  const now = new Date();

  if (!session) return redirect('/login');

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: { user: true },
  });

  if (!workspace) return redirect('/dashboard');

  const recentTasks = await prisma.task.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  const formattedDate = format(now, "EEEE, d 'de' MMMM '·' HH:mm", { locale: ptBR });
  const greeting = getGreeting(now);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-2xl font-semibold text-white">
          {greeting}, {session.user?.name?.split(' ')[0] || 'Usuário'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {formattedDate} {now.getHours() >= 18 ? '🌙' : now.getHours() >= 12 ? '☀️' : '🌅'}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {['Criar um projeto', 'Convide sua equipe', 'Personalize o espaço'].map((title, i) => (
          <div
            key={i}
            className="bg-[#1a1a1f] rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all"
          >
            <h2 className="text-gray-300 font-medium mb-1">{title}</h2>
            <p className="text-sm text-gray-500 mb-3">
              {i === 0
                ? 'A maioria das coisas começa com um projeto no Plane.'
                : i === 1
                ? 'Construa e gerencie com colegas de trabalho.'
                : 'Escolha foto, cores e muito mais.'}
            </p>
            <button className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-500">
              {i === 0 ? 'Criar' : i === 1 ? 'Convidar' : 'Personalizar'}
            </button>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h3 className="text-gray-400 uppercase tracking-wider text-xs mb-3">
          Tarefas Recentes
        </h3>
        <div className="space-y-2">
          {recentTasks.length === 0 ? (
            <div className="flex items-center justify-center bg-[#141417] px-4 py-8 rounded-lg border border-gray-800">
              <p className="text-sm text-gray-500">Nenhuma tarefa encontrada neste workspace</p>
            </div>
          ) : (
            recentTasks.map((task: {
              id: number;
              title: string;
              status: string;
              priority: string;
              updatedAt: Date;
              assignedUser?: { name: string };
            }) => (
              <div key={task.id} className="mb-2">
                <a
                  href={`/${workspaceSlug}/tasks/${task.id}`}
                  className="block no-underline"
                >
                  <div className="flex items-center justify-between bg-[#141417] px-4 py-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-all cursor-pointer hover:bg-[#1e1e24]">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm">{getTaskIcon(task.status)}</span>
                      <div className="flex flex-col flex-1">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">#
                            {String(task.id).padStart(3, '0')}</span>
                          <span className="text-sm text-gray-300">{task.title}</span>
                        </div>
                        {task.assignedUser && (
                          <span className="text-xs text-gray-500">
                            Responsável: {task.assignedUser.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.priority !== 'NONE' && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(task.updatedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
