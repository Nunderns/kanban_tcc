"use client";

import { useMemo } from "react";
import { WorkItem, Priority, Status } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from "date-fns";
import { parseLocalDate } from "@/lib/utils";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface TaskMonthlyViewProps {
  tasks: WorkItem[];
  onTaskClick: (task: WorkItem) => void;
}

interface CalendarTask extends WorkItem {
  startDateObj: Date;
  dueDateObj: Date;
}

export default function TaskMonthlyView({ tasks, onTaskClick }: TaskMonthlyViewProps) {

  const { firstDayOfWeek } = useUserPreferences();
  const weekStartsOn = firstDayOfWeek === "monday" ? 1 : 0;

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const orderedWeekDays = weekDays.slice(weekStartsOn).concat(weekDays.slice(0, weekStartsOn));

  const processedTasks = useMemo<CalendarTask[]>(() => {
    return tasks
      .map((task) => {
        if (!task.startDate && !task.dueDate) return null;

        try {
          const start = task.startDate ? parseLocalDate(task.startDate) : null;
          const end = task.dueDate ? parseLocalDate(task.dueDate) : start;

          if (!start || !end) return null;

          return {
            ...task,
            startDateObj: startOfDay(start),
            dueDateObj: endOfDay(end),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as CalendarTask[];
  }, [tasks]);

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "HIGH": return <FaCircle className="text-red-500 text-xs" />;
      case "MEDIUM": return <FaCircle className="text-yellow-500 text-xs" />;
      case "LOW": return <FaCircle className="text-green-500 text-xs" />;
      default: return <FaRegCircle className="text-gray-500 text-xs" />;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "DONE": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "TODO": return "bg-yellow-100 text-yellow-800";
      case "BACKLOG": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4">

      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {format(today, "MMMM yyyy")}
      </h2>

      {/* Week days */}
      <div className="grid grid-cols-7 mb-2">
        {orderedWeekDays.map((d) => (
          <div key={d} className="text-center text-gray-400 text-xs py-2">{d}</div>
        ))}
      </div>

      {/* WRAPPER RELATIVO */}
      <div className="relative">

        {/* GRID DOS DIAS */}
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div
                key={index}
                className={`
                  h-[100px] border rounded p-1
                  ${isToday
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : isCurrentMonth
                      ? "border-gray-300 dark:border-gray-700"
                      : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"}
                `}
              >
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* LAYER DAS BARRAS */}
        <div className="absolute top-10 left-0 right-0 pointer-events-auto">

          {processedTasks.map((task, index) => {

            const startIndex = allDays.findIndex(d =>
              isSameDay(d, task.startDateObj)
            );

            if (startIndex === -1) return null;

            const endIndex = allDays.findIndex(d =>
              isSameDay(d, task.dueDateObj)
            );

            const span = endIndex - startIndex + 1;

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="absolute bg-white dark:bg-gray-700 border border-gray-500 rounded p-1 text-xs cursor-pointer"
                style={{
                  top: `${index * 30}px`,
                  left: `calc((100% / 7) * ${startIndex})`,
                  width: `calc((100% / 7) * ${span})`,
                }}
              >
                <div className="flex justify-between">
                  <span className="truncate text-gray-900 dark:text-white">{task.title}</span>
                  {getPriorityIcon(task.priority)}
                </div>
                <span className={`px-1 py-0.5 mt-1 rounded text-[10px] ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhuma tarefa encontrada para este mês
        </div>
      )}

    </div>
  );
}
