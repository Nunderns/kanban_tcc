"use client";

import { WorkItem, Priority, Status } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";
import { FaCircle, FaRegCircle, FaCalendarAlt } from "react-icons/fa";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { parseLocalDate } from "@/lib/utils";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface TaskWeeklyViewProps {
  tasks: WorkItem[];
  onTaskClick: (task: WorkItem) => void;
}

interface TaskPosition {
  startDayIndex: number;
  width: number;
  isStartDate: boolean;
  isEndDate: boolean;
  isPartialStart: boolean;
  isPartialEnd: boolean;
}

export default function TaskWeeklyView({ tasks, onTaskClick }: TaskWeeklyViewProps) {
  const { firstDayOfWeek } = useUserPreferences();
  const today = new Date();
  const weekStartsOn = firstDayOfWeek === 'monday' ? 1 : 0;
  const weekStart = startOfWeek(today, { weekStartsOn });
  const weekEnd = endOfWeek(today, { weekStartsOn });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getDayName = (date: Date) => {
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return dayNames[date.getDay()];
  };

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
      case "DONE": 
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800";
      case "IN_PROGRESS": 
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800";
      case "TODO": 
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
      case "BACKLOG": 
        return "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
      default: 
        return "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
    }
  };

  const getTaskPosition = (task: WorkItem) => {
    if (!task.startDate && !task.dueDate) return null;
    
    try {
      const startDate = task.startDate ? parseLocalDate(task.startDate) : parseLocalDate(task.dueDate!);
      const dueDate = task.dueDate ? parseLocalDate(task.dueDate) : startDate;
      
      const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
      const weekStartNormalized = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
      const weekEndNormalized = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
      
      if (normalizedDueDate.getTime() < weekStartNormalized.getTime() || 
          normalizedStartDate.getTime() > weekEndNormalized.getTime()) {
        return null;
      }
      
      const taskStartInWeek = normalizedStartDate.getTime() < weekStartNormalized.getTime() 
        ? weekStartNormalized 
        : normalizedStartDate;
      
      const taskEndInWeek = normalizedDueDate.getTime() > weekEndNormalized.getTime() 
        ? weekEndNormalized 
        : normalizedDueDate;
      
      const startDayIndex = Math.floor((taskStartInWeek.getTime() - weekStartNormalized.getTime()) / (1000 * 60 * 60 * 24));
      const endDayIndex = Math.floor((taskEndInWeek.getTime() - weekStartNormalized.getTime()) / (1000 * 60 * 60 * 24));
      const width = endDayIndex - startDayIndex + 1;
      
      return {
        startDayIndex,
        width,
        isStartDate: isSameDay(normalizedStartDate, taskStartInWeek),
        isEndDate: isSameDay(normalizedDueDate, taskEndInWeek),
        isPartialStart: !isSameDay(normalizedStartDate, taskStartInWeek),
        isPartialEnd: !isSameDay(normalizedDueDate, taskEndInWeek)
      };
    } catch {
      return null;
    }
  };

  const getTaskRows = () => {
    const positionedTasks = tasks
      .map(task => ({
        task,
        position: getTaskPosition(task)
      }))
      .filter((item): item is {task: WorkItem, position: TaskPosition} => item.position !== null);
    
    const rows: Array<{task: WorkItem, position: TaskPosition}[]> = [];
    
    positionedTasks.forEach(item => {
      let placed = false;
      
      for (let i = 0; i < rows.length; i++) {
        const canPlace = rows[i].every(existingItem => {
          const existing = existingItem.position;
          const current = item.position;
          if (!existing || !current) return false;
          return (
            existing.startDayIndex + existing.width <= current.startDayIndex ||
            current.startDayIndex + current.width <= existing.startDayIndex
          );
        });
        
        if (canPlace) {
          rows[i].push(item);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        rows.push([item]);
      }
    });
    
    return rows;
  };

  const taskRows = getTaskRows();

  const ContinuousTaskRectangle = ({ task, position, rowIndex }: { task: WorkItem; position: TaskPosition; rowIndex: number }) => {
    const { startDayIndex, width, isStartDate, isEndDate, isPartialStart, isPartialEnd } = position;
    
    return (
      <div
        className={`absolute h-12 ${getStatusColor(task.status)} border-2 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] hover:z-20 z-10 shadow-sm hover:ring-2 hover:ring-offset-2 hover:ring-opacity-50 dark:hover:ring-opacity-30 hover:ring-blue-200 dark:hover:ring-blue-900`}
        style={{
          top: `${rowIndex * 56 + 8}px`,
          left: `calc(${(startDayIndex / 7) * 100}% + 4px)`,
          width: `calc(${(width / 7) * 100}% - 8px)`,
          minWidth: `${Math.max(width * 80 - 8, 120)}px`
        }}
        onClick={() => onTaskClick(task)}
      >
        <div className="flex items-center justify-between h-full p-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1">
              {getPriorityIcon(task.priority)}
              <div className="flex gap-1">
                {isStartDate && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Início da tarefa" />
                )}
                {isEndDate && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="Fim da tarefa" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate mb-1">
                {task.title}
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === "IN_PROGRESS" ? "Em Progresso" : 
                   task.status === "TODO" ? "A Fazer" :
                   task.status === "DONE" ? "Concluído" :
                   task.status === "BACKLOG" ? "Backlog" : task.status}
                </span>
                {task.creator && (
                  <span className="text-gray-600 dark:text-gray-300 truncate text-xs">
                    {task.creator}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 ml-2">
            {isPartialStart && (
              <span className="text-blue-600 dark:text-blue-400" title="Começou antes">«</span>
            )}
            {isPartialEnd && (
              <span className="text-blue-600 dark:text-blue-400" title="Continua depois">»</span>
            )}
            {!isPartialStart && !isPartialEnd && width > 1 && (
              <span className="text-blue-600 dark:text-blue-400" title="Tarefa multi-dia">↔</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm dark:shadow-none">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Semana de {format(weekStart, "dd/MM")} - {format(weekEnd, "dd/MM/yyyy")}
        </h2>
      </div>
      <div className="relative">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={index} className="text-center">
                <div className={`text-sm font-medium ${
                  isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                }`}>
                  {getDayName(day)}
                </div>
                <div className={`text-lg font-bold ${
                  isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                }`}>
                  {format(day, "dd")}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative min-h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-7 gap-2">
            {weekDays.map((_, index) => (
              <div 
                key={index}
                className={`border-r ${
                  index < 6 ? "border-gray-200 dark:border-gray-700" : ""
                } ${isSameDay(weekDays[index], today) ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
              />
            ))}
          </div>
          {taskRows.map((row, rowIndex) => (
            <div key={rowIndex}>
              {row.map(({ task, position }) => (
                <ContinuousTaskRectangle
                  key={task.id}
                  task={task}
                  position={position}
                  rowIndex={rowIndex}
                />
              ))}
            </div>
          ))}
          {taskRows.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FaCalendarAlt className="mx-auto text-3xl mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma tarefa para esta semana</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
