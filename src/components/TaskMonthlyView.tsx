"use client";

import { WorkItem, Priority, Status } from "@/app/dashboard/my-tasks/page";
import { FaCircle, FaRegCircle } from "react-icons/fa";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { parseLocalDate } from "@/lib/utils";

interface TaskMonthlyViewProps {
  tasks: WorkItem[];
  onTaskClick: (task: WorkItem) => void;
}

export default function TaskMonthlyView({ tasks, onTaskClick }: TaskMonthlyViewProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "HIGH": return <FaCircle className="text-red-500 text-xs" />;
      case "MEDIUM": return <FaCircle className="text-yellow-500 text-xs" />;
      case "LOW": return <FaCircle className="text-green-500 text-xs" />;
      default: return <FaRegCircle className="text-gray-500 text-xs" />;
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate && !task.startDate) return false;
      
      try {
        const taskDate = task.dueDate ? parseLocalDate(task.dueDate) : parseLocalDate(task.startDate!);
        return isSameDay(taskDate, date);
      } catch {
        return false;
      }
    });
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

  // Create calendar grid
  const firstDayOfMonth = monthStart.getDay();
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days of the month
  calendarDays.push(...monthDays);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(today, "MMMM yyyy")}
        </h2>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div key={index} className="min-h-[100px] bg-gray-50 dark:bg-gray-900 rounded p-1"></div>
            );
          }
          
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, today);
          
          return (
            <div
              key={index}
              className={`min-h-[100px] border rounded p-1 ${
                isToday
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : isCurrentMonth
                  ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
              }`}
            >
              <div className="text-center mb-1">
                <div className={`text-sm font-medium ${
                  isToday
                    ? "text-blue-600 dark:text-blue-400"
                    : isCurrentMonth
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-600"
                }`}>
                  {format(day, "dd")}
                </div>
              </div>
              
              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-1 cursor-pointer hover:shadow-sm transition-shadow text-xs"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h4>
                      {getPriorityIcon(task.priority)}
                    </div>
                    
                    <div className="flex items-center gap-0.5">
                      <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === "IN_PROGRESS" ? "Em Progresso" : 
                         task.status === "TODO" ? "A Fazer" :
                         task.status === "DONE" ? "Concluído" :
                         task.status === "BACKLOG" ? "Backlog" : task.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{dayTasks.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhuma tarefa encontrada para este mês
        </div>
      )}
    </div>
  );
}
