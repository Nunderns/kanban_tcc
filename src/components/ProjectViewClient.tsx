"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import ProjectBoard, { Task, Status } from "@/components/ProjectBoard";
import CreateTaskModal from "@/components/CreateTaskModal";

const getPriorityColor = (priority: string = 'NONE') => {
  switch (priority) {
    case 'HIGH': return 'bg-red-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'LOW': return 'bg-blue-500';
    default: return 'bg-gray-300 dark:bg-gray-600';
  }
};

type View = "kanban" | "list" | "calendar" | "table" | "timeline";

interface ProjectViewClientProps {
  projectId: number;
  projectName: string;
  workspaceSlug: string;
  onTaskCreated?: () => Promise<void>;
}

export default function ProjectViewClient({ projectId, projectName, workspaceSlug, onTaskCreated }: ProjectViewClientProps) {
  const [view, setView] = useState<View>("kanban");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`/api/tasks`, window.location.origin);
      url.searchParams.set("projectId", String(projectId));
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Falha ao carregar tarefas (${res.status})`);
      }
      const data = await res.json();
      setTasks(
        data.map((t: {
          id: string | number;
          title: string;
          description: string | null;
          status: Status;
          priority?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
          createdAt: string;
          updatedAt: string;
        }) => ({
          id: typeof t.id === "string" ? parseInt(t.id, 10) : t.id,
          title: t.title,
          description: t.description ?? null,
          status: t.status,
          priority: t.priority || "NONE",
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [projectId, statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [projectId, statusFilter, fetchTasks]);

  const { completedCount, totalTasks, completionPercentage } = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'DONE').length;
    return {
      completedCount: completed,
      totalTasks: total,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  const filtered = useMemo(() => tasks, [tasks]);

  const onCreate = async ({ title, description, assignedUserId, projectId: taskProjectId }: { title: string; description: string; assignedUserId?: string; projectId?: string }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        description, 
        projectId: taskProjectId || projectId, 
        status: "BACKLOG", 
        assignedUserId 
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao criar tarefa: ${text}`);
    }
    await fetchTasks();
    setIsCreateOpen(false);
    if (onTaskCreated) {
      await onTaskCreated();
    }
  };

  const handleTaskUpdate = async (taskId: number, updates: Partial<Task>) => {
    try {
      console.log('Updating task with data:', { taskId, updates });
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', { status: response.status, errorData });
        throw new Error(errorData.error || `Falha ao atualizar a tarefa (${response.status})`);
      }

      await fetchTasks();
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  return (
    <div className="mt-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <div className="text-sm text-gray-600 dark:text-gray-300">Projeto</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{projectName}</div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">Progresso:</div>
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {completionPercentage}% ({completedCount}/{totalTasks})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            aria-label="Filtro de status"
          >
            <option value="ALL">Todos os status</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">Em progresso</option>
            <option value="DONE">Concluído</option>
          </select>

          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm ${view === "kanban" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
            >
              Kanban
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm border-l ${view === "list" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              Lista
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm border-l ${view === "table" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
            >
              Tabela
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-md flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Adicionar tarefa</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && <div className="text-sm text-gray-500">Carregando tarefas...</div>}
      {error && <div className="text-sm text-red-600">Erro: {error}</div>}

      {!loading && !error && (
        <div>
          {view === "kanban" && (
            <ProjectBoard 
              tasks={filtered} 
              onTaskUpdate={handleTaskUpdate} 
            />
          )}
          {view === "list" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado em</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.length === 0 ? (
                    <tr><td className="px-4 py-6 text-sm text-gray-500 text-center" colSpan={5}>Nenhuma tarefa encontrada</td></tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          <div className="font-medium">{t.title}</div>
                          {t.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {t.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            t.status === 'DONE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            t.status === 'TODO' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {t.status === 'DONE' ? 'Concluído' :
                             t.status === 'IN_PROGRESS' ? 'Em Progresso' :
                             t.status === 'TODO' ? 'A Fazer' : 'Backlog'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(t.priority)}`}></span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {t.priority?.toLowerCase() || 'Nenhuma'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(t.updatedAt || t.createdAt || '').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button 
                            onClick={() => {
                              console.log('Editar tarefa:', t.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => {
                              console.log('Excluir tarefa:', t.id);
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {view === "table" && (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-500">
              Visualização de tabela avançada em desenvolvimento
            </div>
          )}
        </div>
      )}

      <CreateTaskModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSubmit={onCreate}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
