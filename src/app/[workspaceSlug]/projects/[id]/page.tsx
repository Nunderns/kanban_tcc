import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, ArrowLeft, Settings, LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectViewClient from "@/components/ProjectViewClient";

type RouteParams = { 
  id: string;
  workspaceSlug: string;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id, workspaceSlug } = await params;

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
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const taskCount = project.tasks.length;
  const completedTasks = project.tasks.filter((task: { status: string }) => task.status === 'DONE').length;
  const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href={`/${workspaceSlug}/dashboard`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Criado em {formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progresso do Projeto
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {completedTasks} de {taskCount} tarefas concluídas
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="bg-transparent p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
              >
                <List className="h-4 w-4 mr-2" />
                Tarefas
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sobre o Projeto</h2>
              {project.description ? (
                <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
              ) : (
                <p className="text-gray-400 italic">Nenhuma descrição fornecida</p>
              )}
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Tarefas Totais</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{taskCount}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Concluídas</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Última Atualização</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tarefas do Projeto</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
              <ProjectViewClient 
                projectId={project.id} 
                projectName={project.name} 
                workspaceSlug={workspaceSlug}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Configurações do Projeto</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome do Projeto</h3>
                  <p className="text-gray-900 dark:text-white">{project.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data de Criação</h3>
                  <p className="text-gray-600 dark:text-gray-400">{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Última Atualização</h3>
                  <p className="text-gray-600 dark:text-gray-400">{formatDate(project.updatedAt)}</p>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20">
                    Excluir Projeto
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
