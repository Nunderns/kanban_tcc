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
    HIGH: 'bg-destructive/10 text-destructive-foreground border border-destructive/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    LOW: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    NONE: 'bg-muted text-muted-foreground border border-border',
  };
  return colors[priority] || 'bg-muted text-muted-foreground border border-border';
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
    <div className="flex h-screen bg-background text-foreground">
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href={`/${workspaceSlug}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Voltar para o workspace
          </Link>

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-semibold text-foreground">{task.title}</h1>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                  task.priority
                )}`}
              >
                {getPriorityLabel(task.priority)}
              </span>
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                {getStatusLabel(task.status)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            {task.project && (
              <div className="flex items-center">
                <span className="mr-1">Projeto:</span>
                <span className="text-foreground">{task.project.name}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <span className="mr-1">Criado por:</span>
              <span className="text-foreground">{task.user.name}</span>
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
                <span className="mr-1">Atribuído a:</span>
                <span className="text-foreground">
                  {task.assignedUser ? task.assignedUser.name : 'Não atribuído'}
                </span>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center">
                <span className="mr-1">Prazo:</span>
                <span className="text-foreground">
                  {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-3">Descrição</h2>
            <div className="prose dark:prose-invert max-w-none text-foreground">
              {task.description ? (
                <p className="text-muted-foreground">{task.description}</p>
              ) : (
                <p className="text-muted-foreground">Nenhuma descrição fornecida.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-foreground">Atividade</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Ver histórico completo
              </button>
            </div>
            
            <div className="space-y-4 bg-card p-6 rounded-xl border">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{task.user.name}</span> criou esta tarefa
                    <span className="text-muted-foreground ml-1">
                      {formatDistanceToNow(new Date(task.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
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
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{task.user.name}</span> atualizou esta tarefa
                      <span className="text-muted-foreground ml-1">
                        {formatDistanceToNow(new Date(task.updatedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
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
      <aside className="w-80 border-l p-6 bg-card flex flex-col gap-6">
        <div>
          <h3 className="text-xs uppercase text-muted-foreground mb-2">Última Atualização</h3>
          <p className="text-sm text-foreground">
            {formatDistanceToNow(new Date(task.updatedAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase text-muted-foreground mb-2">Ações</h3>
          <TaskActions 
            workspaceSlug={workspaceSlug}
            taskId={task.id}
          />
        </div>
      </aside>
    </div>
  );
}
