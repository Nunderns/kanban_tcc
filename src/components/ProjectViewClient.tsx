"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectBoard, { Task as BoardTask, Status } from "@/components/ProjectBoard";
import CreateTaskModal from "@/components/CreateTaskModal";

type View = "kanban" | "list" | "calendar" | "table" | "timeline";

export default function ProjectViewClient({ projectId, projectName }: { projectId: number; projectName: string }) {
  const [view, setView] = useState<View>("kanban");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTasks = async () => {
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
        data.map((t: any) => ({
          id: typeof t.id === "string" ? parseInt(t.id, 10) : t.id,
          title: t.title,
          description: t.description ?? null,
          status: t.status as Status,
          priority: t.priority,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, statusFilter]);

  const filtered = useMemo(() => tasks, [tasks]);

  const onCreate = async ({ title, description }: { title: string; description: string }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, projectId, status: "BACKLOG" }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao criar tarefa: ${text}`);
    }
    setIsCreateOpen(false);
    await fetchTasks();
  };

  return (
    <div className="mt-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <div className="text-sm text-gray-600 dark:text-gray-300">Projeto</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{projectName}</div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            aria-label="Filtro de status"
          >
            <option value="ALL">Todos os status</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">Em progresso</option>
            <option value="DONE">Concluído</option>
          </select>

          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded border ${view === "kanban" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"}`}
            onClick={() => setView("kanban")}
            aria-pressed={view === "kanban"}
          >
            Kanban
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded border ${view === "list" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"}`}
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
          >
            Lista
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded border ${view === "calendar" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"}`}
            onClick={() => setView("calendar")}
          >
            Calendário
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded border ${view === "table" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"}`}
            onClick={() => setView("table")}
          >
            Tabela
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded border ${view === "timeline" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"}`}
            onClick={() => setView("timeline")}
          >
            Timeline
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded"
          >
            Adicionar tarefa
          </button>

          <button
            type="button"
            className="text-sm px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          >
            Análise
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && <div className="text-sm text-gray-500">Carregando tarefas...</div>}
      {error && <div className="text-sm text-red-600">Erro: {error}</div>}

      {!loading && !error && (
        <div>
          {view === "kanban" && <ProjectBoard tasks={filtered} />}
          {view === "list" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.length === 0 ? (
                    <tr><td className="px-4 py-3 text-sm text-gray-500" colSpan={2}>Sem tarefas</td></tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-3 text-sm">{t.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{t.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {view === "calendar" && (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-500">Calendário: em breve</div>
          )}
          {view === "table" && (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-500">Tabela: em breve</div>
          )}
          {view === "timeline" && (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-500">Timeline: em breve</div>
          )}
        </div>
      )}

      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={onCreate} />
    </div>
  );
}
