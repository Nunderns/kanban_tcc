"use client";

import { useMemo, useState } from "react";
import TaskDetailsModal from "./TaskDetailsModal";

export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "BACKLOG", label: "Backlog", color: "bg-gray-200 dark:bg-gray-700" },
  { key: "TODO", label: "To do", color: "bg-blue-200 dark:bg-blue-900" },
  { key: "IN_PROGRESS", label: "Em progresso", color: "bg-yellow-200 dark:bg-yellow-900" },
  { key: "DONE", label: "Concluído", color: "bg-green-200 dark:bg-green-900" },
];

const getPriorityColor = (priority: string = 'NONE') => {
  switch (priority) {
    case 'HIGH': return 'bg-red-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'LOW': return 'bg-blue-500';
    default: return 'bg-gray-300 dark:bg-gray-600';
  }
};

interface ProjectBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => Promise<void>;
  onTaskClick?: (task: Task) => void;
}

export default function ProjectBoard({ tasks, onTaskUpdate, onTaskClick }: ProjectBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const columns = useMemo(() => {
    const map: Record<Status, Task[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    for (const t of tasks) map[t.status]?.push(t);
    return map;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    setDraggedTask(task);
    setIsDragging(true);
    document.body.classList.add('cursor-grabbing');
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setIsDragging(false);
    document.body.classList.remove('cursor-grabbing');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: Status) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === targetStatus) {
      return;
    }

    try {
      await onTaskUpdate(draggedTask.id, { status: targetStatus });
    } catch (error) {
      console.error('Falha ao atualizar status da tarefa:', error);
    } finally {
      setDraggedTask(null);
      setIsDragging(false);
      document.body.classList.remove('cursor-grabbing');
    }
  };

  const handleStatusChange = async (taskId: number, updates: Partial<Task>) => {
    try {
      await onTaskUpdate(taskId, updates);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {STATUS_COLUMNS.map((col) => (
          <div 
            key={col.key} 
            className={`flex flex-col h-full rounded-lg border-2 ${isDragging && draggedTask?.status === col.key ? 'border-dashed border-blue-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50/50 dark:bg-gray-800/50 transition-colors`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${col.color} text-sm font-medium flex items-center justify-between`}>
              <span>{col.label}</span>
              <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
                {columns[col.key].length}
              </span>
            </div>
            <div className="flex-1 p-3 space-y-3 min-h-[200px] overflow-y-auto">
              {columns[col.key].length === 0 ? (
                <div 
                  className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 p-4 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.key)}
                >
                  {isDragging ? 'Solte aqui' : 'Arraste tarefas para cá'}
                </div>
              ) : (
                columns[col.key].map((task) => (
                  <div 
                    key={task.id}
                    draggable
                    className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-transform cursor-grab active:cursor-grabbing ${
                      draggedTask?.id === task.id ? 'opacity-50' : ''
                    } hover:scale-[1.01] active:scale-[0.99]`}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      setSelectedTask(task);
                      onTaskClick?.(task);
                    }}
                  >
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                        <span 
                          className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} 
                          title={task.priority ? task.priority.toLowerCase() : 'Sem prioridade'}
                        />
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(task.updatedAt || task.createdAt || '').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                        >
                          Ver mais
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
