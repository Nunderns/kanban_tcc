import { notFound, redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { TaskActions } from '@/components/task/TaskActions';

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

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    BACKLOG: 'Backlog',
    TODO: 'A Fazer',
    IN_PROGRESS: 'Em Andamento',
    DONE: 'Concluído',
  };
  return statusMap[status] || status;
}

interface TaskDetailPageProps {
  params: Promise<{ workspaceSlug: string; taskId: string }>;
}

export default async function TaskDetailPage({
  params,
}: TaskDetailPageProps) {
  const { workspaceSlug, taskId } = await params;
  const session = await getServerSession();

  if (!session) redirect('/login');


  const task = await prisma.task.findUnique({
    where: { id: Number(taskId) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!task) notFound();

  return (
    <div className="flex h-screen bg-[#0e0e11] text-gray-200">
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href={`/${workspaceSlug}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors"
          >
            ← Voltar para o workspace
          </Link>

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-semibold text-white">{task.title}</h1>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                  task.priority
                )}`}
              >
                {getPriorityLabel(task.priority)}
              </span>
              <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">
                {getStatusLabel(task.status)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
            {task.project && (
              <div className="flex items-center">
                <span className="mr-1">Projeto:</span>
                <span className="text-white">{task.project.name}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <span className="mr-1">Criado por:</span>
              <span className="text-white">{task.user.name}</span>
              <span className="mx-1 text-gray-500">•</span>
              <span className="text-gray-400">
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>

            {task.assignedUser && (
              <div className="flex items-center">
                <span className="mr-1">Responsável:</span>
                <span className="text-white">{task.assignedUser.name}</span>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center">
                <span className="mr-1">Prazo:</span>
                <span className="text-white">
                  {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-white mb-3">Descrição</h2>
            <div className="bg-[#1a1a1f] rounded-xl p-6 border border-gray-800">
              <p className="text-gray-300 whitespace-pre-line">
                {task.description || 'Nenhuma descrição fornecida.'}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-white">Atividade</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Ver histórico completo
              </button>
            </div>
            
            <div className="space-y-4 bg-[#1a1a1f] p-6 rounded-xl border border-gray-800">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">{task.user.name}</span> criou esta tarefa
                    <span className="text-gray-400 ml-1">
                      {formatDistanceToNow(new Date(task.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(task.createdAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              
              {task.updatedAt.getTime() !== task.createdAt.getTime() && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">{task.user.name}</span> atualizou esta tarefa
                      <span className="text-gray-400 ml-1">
                        {formatDistanceToNow(new Date(task.updatedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(task.updatedAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <aside className="w-80 border-l border-gray-800 p-6 bg-[#0d0d10] flex flex-col gap-6">
        <div>
          <h3 className="text-xs uppercase text-gray-500 mb-2">Última Atualização</h3>
          <p className="text-sm text-gray-300">
            {formatDistanceToNow(new Date(task.updatedAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase text-gray-500 mb-2">Ações</h3>
          <TaskActions 
            workspaceSlug={workspaceSlug}
            taskId={task.id}
          />
        </div>
      </aside>
    </div>
  );
}
