"use client";

import { WorkItem, Priority } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";
import { FaUser, FaTag, FaCalendarAlt } from "react-icons/fa";
import { Circle, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/utils";

interface TaskListViewProps {
  tasks: WorkItem[];
  onTaskClick: (task: WorkItem) => void;
  visibleProperties: string[];
}

export default function TaskListView({ tasks, onTaskClick, visibleProperties }: TaskListViewProps) {
  const getPriorityIcon = (priority: Priority) => {
    const iconClass = "w-3 h-3";
    switch (priority) {
      case "HIGH": return <CircleDot className={`${iconClass} text-red-500`} />;
      case "MEDIUM": return <CircleDot className={`${iconClass} text-yellow-500`} />;
      case "LOW": return <CircleDot className={`${iconClass} text-green-500`} />;
      default: return <Circle className={`${iconClass} text-gray-400`} />;
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    try {
      return format(parseLocalDate(date), "dd/MM/yyyy");
    } catch {
      return "-";
    }
  };

  const renderProperty = (task: WorkItem, property: string) => {
    switch (property) {
      case "ID":
        return <span className="text-xs text-gray-500 font-semibold">PRIME-{task.id}</span>;
      case "Responsável":
        return task.assignedUserName ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <FaUser className="text-blue-500 text-xs" />
            </div>
            <span className="text-sm text-gray-800 dark:text-gray-200">{task.assignedUserName}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Não atribuído</div>
        );
      case "Criador":
        return task.creator ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <FaUser className="text-purple-500 text-xs" />
            </div>
            <span className="text-sm text-gray-800 dark:text-gray-200">{task.creator}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">-</div>
        );
      case "Prioridade":
        return (
          <div className="flex items-center gap-2">
            {getPriorityIcon(task.priority)}
            <span className="text-sm text-gray-800 dark:text-gray-200 capitalize">
              {task.priority === "HIGH" ? "Alta" : 
               task.priority === "MEDIUM" ? "Média" : 
               task.priority === "LOW" ? "Baixa" : "Não definida"}
            </span>
          </div>
        );
      case "Data de início":
        return task.startDate ? (
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400 text-sm" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(task.startDate)}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Não definida</div>
        );
      case "Prazo":
        return task.dueDate ? (
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400 text-sm" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(task.dueDate)}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Não definido</div>
        );
      case "Estado":
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.status === "DONE" ? "bg-green-100 text-green-800" :
            task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
            task.status === "TODO" ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {task.status.replace("_", " ")}
          </span>
        );
      case "Etiquetas":
        return task.labels && task.labels.length > 0 ? (
          <div className="flex items-center gap-1">
            <FaTag className="text-gray-500 text-xs" />
            <span className="text-sm">{task.labels.join(", ")}</span>
          </div>
        ) : "-";
      case "Módulo":
        return task.module || "-";
      case "Ciclo":
        return task.cycle || "-";
      default:
        return "-";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
            <tr>
              {visibleProperties.map((property) => (
                <th
                  key={property}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {property}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Título
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onTaskClick(task)}
              >
                {visibleProperties.map((property) => (
                  <td key={property} className="px-4 py-3 whitespace-nowrap">
                    {renderProperty(task, property)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhuma tarefa encontrada
        </div>
      )}
    </div>
  );
}
