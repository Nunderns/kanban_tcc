"use client";

import { WorkItem, Priority } from "@/app/dashboard/my-tasks/page";
import { FaCircle, FaRegCircle, FaUser, FaTag, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/utils";

interface TaskListViewProps {
  tasks: WorkItem[];
  onTaskClick: (task: WorkItem) => void;
  visibleProperties: string[];
}

export default function TaskListView({ tasks, onTaskClick, visibleProperties }: TaskListViewProps) {
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "HIGH": return <FaCircle className="text-red-500 text-xs" />;
      case "MEDIUM": return <FaCircle className="text-yellow-500 text-xs" />;
      case "LOW": return <FaCircle className="text-green-500 text-xs" />;
      default: return <FaRegCircle className="text-gray-500 text-xs" />;
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
        return task.creator ? (
          <div className="flex items-center gap-1">
            <FaUser className="text-gray-500 text-xs" />
            <span className="text-sm">{task.creator}</span>
          </div>
        ) : "-";
      case "Data de início":
        return task.startDate ? (
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="text-gray-500 text-xs" />
            <span className="text-sm">{formatDate(task.startDate)}</span>
          </div>
        ) : "-";
      case "Prazo":
        return task.dueDate ? (
          <div className="flex items-center gap-1 text-red-600">
            <FaCalendarAlt className="text-xs" />
            <span className="text-sm">{formatDate(task.dueDate)}</span>
          </div>
        ) : "-";
      case "Prioridade":
        return (
          <div className="flex items-center gap-1">
            {getPriorityIcon(task.priority)}
            <span className="text-sm capitalize">{task.priority.toLowerCase()}</span>
          </div>
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
