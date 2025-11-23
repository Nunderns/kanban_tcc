"use client";

import { WorkItem, Priority, Status } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";
import { FaCircle, FaRegCircle, FaUser, FaCalendarAlt, FaClock } from "react-icons/fa";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { parseLocalDate } from "@/lib/utils";

interface TaskDailyViewProps {
  tasks: WorkItem[];
  onTaskClick: (task: WorkItem) => void;
}

export default function TaskDailyView({ tasks, onTaskClick }: TaskDailyViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

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
        const normalizedTaskDate = new Date(taskDate);
        normalizedTaskDate.setHours(0, 0, 0, 0);
        
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        
        return normalizedTaskDate.getTime() === normalizedDate.getTime();
      } catch {
        return false;
      }
    });
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "DONE": return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200";
      case "TODO": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "BACKLOG": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd/MM/yyyy");
  };

  const todayTasks = getTasksForDate(today);
  const tomorrowTasks = getTasksForDate(tomorrow);
  const yesterdayTasks = getTasksForDate(yesterday);

  const otherDates = tasks
    .map(task => {
      if (!task.dueDate && !task.startDate) return null;
      try {
        const taskDate = task.dueDate ? parseLocalDate(task.dueDate) : parseLocalDate(task.startDate!);
        const normalizedTaskDate = new Date(taskDate);
        normalizedTaskDate.setHours(0, 0, 0, 0);
        return normalizedTaskDate;
      } catch {
        return null;
      }
    })
    .filter((date): date is Date => 
      date !== null && 
      !isToday(date) && 
      !isTomorrow(date) && 
      !isYesterday(date)
    )
    .filter((date, index, self) => 
      index === self.findIndex(d => d.getTime() === date.getTime())
    )
    .sort((a, b) => a.getTime() - b.getTime());

  const TaskCard = ({ task }: { task: WorkItem }) => (
    <div
      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 ml-2">
          {getPriorityIcon(task.priority)}
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status === "IN_PROGRESS" ? "Em Progresso" : 
             task.status === "TODO" ? "A Fazer" :
             task.status === "DONE" ? "Concluído" :
             task.status === "BACKLOG" ? "Backlog" : task.status}
          </span>
        </div>
        
        {task.creator && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <FaUser className="text-xs" />
            <span className="truncate max-w-[80px]">{task.creator}</span>
          </div>
        )}
      </div>
      
      {(task.dueDate || task.startDate) && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <FaClock className="text-xs" />
          <span>
            {task.dueDate ? `Prazo: ${format(parseLocalDate(task.dueDate), "dd/MM/yyyy")}` : 
             task.startDate ? `Início: ${format(parseLocalDate(task.startDate!), "dd/MM/yyyy")}` : ""}
          </span>
        </div>
      )}
    </div>
  );

  const DateSection = ({ date, tasks, label }: { date: Date; tasks: WorkItem[]; label: string }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {label}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({format(date, "EEEE, dd/MM/yyyy")})
        </span>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          {tasks.length} {tasks.length === 1 ? "tarefa" : "tarefas"}
        </span>
      </div>
      
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          Nenhuma tarefa para este dia
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Visão Diária
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Organize suas tarefas por dia
        </p>
      </div>

      <div className="space-y-6">
        <DateSection date={today} tasks={todayTasks} label="Hoje" />
        <DateSection date={tomorrow} tasks={tomorrowTasks} label="Amanhã" />
        <DateSection date={yesterday} tasks={yesterdayTasks} label="Ontem" />
        
        {otherDates.map((date) => (
          <DateSection 
            key={date.getTime()} 
            date={date} 
            tasks={getTasksForDate(date)} 
            label={getDateLabel(date)} 
          />
        ))}
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FaCalendarAlt className="mx-auto text-4xl mb-4" />
          <p className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</p>
          <p className="text-sm">Adicione tarefas com datas para vê-las aqui</p>
        </div>
      )}
    </div>
  );
}
