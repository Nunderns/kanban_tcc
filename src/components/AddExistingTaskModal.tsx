"use client";

import { useState, useEffect, useCallback } from "react";
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface WorkItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignees?: string[];
  assignedUserId?: string;
  assignedUserName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (taskIds: string[]) => Promise<void>;
  workspaceSlug?: string;
  currentTaskId: string;
}

export default function AddExistingTaskModal({ isOpen, onClose, onAddTasks, workspaceSlug, currentTaskId }: Props) {
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!workspaceSlug) return;
    
    try {
      setLoading(true);
      // First get workspace info to get the workspace ID
      const workspaceResponse = await fetch(`/api/workspaces/slug/${workspaceSlug}`);
      if (!workspaceResponse.ok) {
        throw new Error('Failed to get workspace info');
      }
      
      const workspaceData = await workspaceResponse.json();
      const workspaceId = workspaceData.id;
      
      // Then get tasks for this workspace
      const tasksResponse = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        // Filter out the current task to avoid circular relationships
        const filteredTasks = (data || []).filter((task: WorkItem) => task.id !== currentTaskId);
        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, currentTaskId]);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
      setSelectedTasks(new Set());
      setSearchQuery("");
    }
  }, [isOpen, fetchTasks]);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedTasks.size === 0) return;
    
    try {
      setSubmitting(true);
      await onAddTasks(Array.from(selectedTasks));
      onClose();
    } catch (error) {
      console.error("Error adding tasks:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d0f14] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Work Items</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600 dark:text-white/60 dark:hover:text-white"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite para buscar"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            autoFocus
          />
        </div>

        {/* Selected Tasks Pills */}
        {selectedTasks.size > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from(selectedTasks).map(taskId => {
              const task = tasks.find(t => t.id === taskId);
              return task ? (
                <div
                  key={taskId}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                >
                  {taskId}
                  <button
                    onClick={() => handleTaskToggle(taskId)}
                    className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500 dark:text-white/60">Carregando...</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-sm text-gray-500 dark:text-white/60">
                {searchQuery ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa disponível"}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${
                    selectedTasks.has(task.id)
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                  }`}
                >
                  <div className={`flex-shrink-0 rounded-md border-2 p-1 ${
                    selectedTasks.has(task.id)
                      ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                      : "border-gray-300 dark:border-white/20"
                  }`}>
                    {selectedTasks.has(task.id) && (
                      <CheckIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-white/60">
                        {task.id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === 'DONE' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-white/60 dark:hover:text-white"
            disabled={filteredTasks.length === 0}
          >
            {selectedTasks.size === filteredTasks.length && filteredTasks.length > 0 
              ? "Desmarcar todos" 
              : "Selecionar tudo"
            }
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedTasks.size === 0 || submitting}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
            >
              {submitting ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                `Adicionar itens de trabalho selecionados${selectedTasks.size > 0 ? ` (${selectedTasks.size})` : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
