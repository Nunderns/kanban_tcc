"use client";

import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import CreateTaskModal from "@/components/CreateTaskModal";
import FilterDropdown from "@/components/FilterDropdown";
import DisplayDropdown, { DisplayOption } from "@/components/DisplayDown";
import WorkItemSidebar from "@/components/WorkItemSidebar";
import TaskListView from "@/components/TaskListView";
import TaskWeeklyView from "@/components/TaskWeeklyView";
import TaskMonthlyView from "@/components/TaskMonthlyView";
import TaskDailyView from "@/components/TaskDailyView";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/utils";
import {
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
  FaUser,
  FaTag,
  FaCalendarAlt,
  FaSyncAlt
} from "react-icons/fa";
import { IoFunnelOutline } from "react-icons/io5";

function KanbanPageContent() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <KanbanPage />
    </Suspense>
  );
}

export default KanbanPageContent;

export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export type WorkItem = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  assignees?: string[];
  assignedUserId?: string;
  assignedUserName?: string;
  module?: string;
  cycle?: string;
  labels?: string[];
  creator?: string;
};


function KanbanPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const workspaceSlug = pathname.split('/')[1];

  const [workspaceName] = useState(workspaceSlug);
  const [collapsedColumns, setCollapsedColumns] = useState<Record<Status, boolean>>({
    BACKLOG: false,
    TODO: false,
    IN_PROGRESS: false,
    DONE: false,
  });
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  
  useEffect(() => {
    const taskId = searchParams?.get('task');
    if (taskId && workItems.length > 0) {
      const task = workItems.find(item => item.id === taskId);
      if (task) {
        setSelectedItem(task);
      }
    }
  }, [searchParams, workItems]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  const [filters, setFilters] = useState({
    priority: [] as string[],
    status: [] as string[],
    assignee: [] as string[],
    creator: [] as string[],
    project: [] as string[],
    startDate: [] as string[],
    dueDate: [] as string[],
  });
  
  const [displayOptions, setDisplayOptions] = useState<{
    showSubtasks: boolean;
    visibleProperties: DisplayOption[];
  }>({
    showSubtasks: true,
    visibleProperties: ["ID", "Responsável", "Data de início", "Prazo", "Prioridade", "Estado"],
  });
  
  const [viewType, setViewType] = useState<"kanban" | "list" | "weekly" | "monthly" | "daily">("kanban");
  
  const statusMap: Record<string, string> = {
    'Backlog': 'BACKLOG',
    'Não iniciado': 'TODO',
    'Iniciado': 'IN_PROGRESS',
    'Completado': 'DONE',
    'Cancelado': 'CANCELLED'
  };

  const ColumnDroppable = ({ status, children }: { status: Status; children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
    return (
      <div ref={setNodeRef} className={isOver ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent rounded-b" : undefined}>
        {children}
      </div>
    );
  };

  const priorityMap: Record<string, string> = {
    'Urgent': 'HIGH',
    'High': 'HIGH',
    'Medium': 'MEDIUM',
    'Low': 'LOW',
    'None': 'NONE'
  };
  
  const reverseStatusMap = Object.entries(statusMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, string>);
  
  const reversePriorityMap = Object.entries(priorityMap).reduce((acc, [key, value]) => {
    if (!acc[value]) {
      acc[value] = key;
    }
    return acc;
  }, {} as Record<string, string>);
  
  const filteredTasks = useMemo(() => {
    if (!workItems.length) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    
    const nextWeekEnd = new Date(endOfWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const isDateInRange = (date: Date | string | undefined, range: string): boolean => {
      if (!date) return false;

      const normalizeDate = (d: Date) => {
        const normalized = new Date(d);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
      
      let taskDate: Date;
      if (typeof date === 'string') {
        if (date.includes('/')) {
          const [day, month, year] = date.split('/').map(Number);
          taskDate = new Date(year, month - 1, day);
        } else {
          taskDate = new Date(date);
        }
      } else {
        taskDate = new Date(date);
      }
      
      if (isNaN(taskDate.getTime())) return false;
      
      taskDate = normalizeDate(taskDate);
      
      switch (range) {
        case 'Hoje':
          return taskDate.getTime() === today.getTime();
        case 'Amanhã':
          return taskDate.getTime() === tomorrow.getTime();
        case 'Esta semana':
          return taskDate >= today && taskDate <= endOfWeek;
        case 'Próxima semana': {
          const nextWeekStart = new Date(endOfWeek);
          nextWeekStart.setDate(nextWeekStart.getDate() + 1);
          return taskDate >= nextWeekStart && taskDate <= nextWeekEnd;
        }
        case 'Próximo mês':
          return taskDate.getMonth() === nextMonth.getMonth() && 
                 taskDate.getFullYear() === nextMonth.getFullYear();
        default:
          if (range.startsWith('data:')) {
            try {
              const dateStr = range.replace('data:', '');
              let filterDate: Date;
              if (dateStr.includes('/')) {
                const [day, month, year] = dateStr.split('/').map(Number);
                filterDate = new Date(year, month - 1, day);
              } else {
                filterDate = new Date(dateStr);
              }
              
              filterDate = normalizeDate(filterDate);
              return taskDate.getTime() === filterDate.getTime();
            } catch (e) {
              console.error('Error parsing filter date:', e);
              return false;
            }
          }
          return false;
      }
    };
    
    const filtered = workItems.filter(task => {
      
      if (filters.priority.length > 0) {
        const taskPriorityName = reversePriorityMap[task.priority] || '';
        if (!filters.priority.includes(taskPriorityName)) {
          return false;
        }
      }
      
      if (filters.status.length > 0) {
        const taskStatusName = reverseStatusMap[task.status] || '';
        if (!filters.status.includes(taskStatusName)) {
          return false;
        }
      }
      
      if (filters.startDate.length > 0) {
        const hasMatchingStartDate = filters.startDate.some(range => 
          isDateInRange(task.startDate, range)
        );
        if (!hasMatchingStartDate) return false;
      }
      
      if (filters.dueDate.length > 0) {
        const hasMatchingDueDate = filters.dueDate.some(range => 
          isDateInRange(task.dueDate, range)
        );
        if (!hasMatchingDueDate) return false;
      }
      
      return true;
    });
    
    return filtered;
  }, [workItems, filters, reverseStatusMap, reversePriorityMap]);
  
  const handleFilterChange = (filterType: keyof typeof filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter((item: string) => item !== value)
    }));
  };
  
  const handleDisplayOptionChange = (option: DisplayOption, checked: boolean) => {
    setDisplayOptions(prev => {
      const newProperties = checked
        ? Array.from(new Set([...prev.visibleProperties, option])) as DisplayOption[]
        : prev.visibleProperties.filter((item): item is DisplayOption => item !== option);
      
      return {
        ...prev,
        visibleProperties: newProperties
      };
    });
  };

  const [targetStatus, setTargetStatus] = useState<Status>("BACKLOG");
  const [creatingTaskInColumn, setCreatingTaskInColumn] = useState<Status | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const updateTaskStatus = useCallback(
    async (taskId: string, oldStatus: Status, newStatus: Status) => {
      setWorkItems((prev) =>
        prev.map((t) =>
          String(t.id) === String(taskId) ? { ...t, status: newStatus } : t
        )
      );
      try {
        await fetch(`/api/tasks?id=${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        });

        await fetch(`/api/tasks/${taskId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: session?.user?.name || "Unknown",
            action: "updated field",
            field: "status",
            oldValue: oldStatus,
            newValue: newStatus,
          }),
        });
      } catch (e) {
        console.error("Failed to persist status update", e);
      }
    },
    [session]
  );

  const onDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceItem = workItems.find(i => String(i.id) === activeId);
    if (!sourceItem) return;

    const sourceStatus = sourceItem.status;
    const overItem = workItems.find(i => String(i.id) === overId);
    let destinationStatus: Status = sourceStatus;
    if (overId.startsWith("column-")) {
      const column = overId.replace("column-", "");
      if (["BACKLOG","TODO","IN_PROGRESS","DONE"].includes(column)) {
        destinationStatus = column as Status;
      }
    } else if (overItem) {
      destinationStatus = overItem.status;
    }

    if (destinationStatus !== sourceStatus) {
      await updateTaskStatus(activeId, sourceStatus, destinationStatus);
      return;
    }
    const columnItems = workItems.filter(i => i.status === sourceStatus);
    const ids = columnItems.map(i => String(i.id));
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(columnItems, oldIndex, newIndex);
    setWorkItems(prev => {
      const others = prev.filter(i => i.status !== sourceStatus);
      return [...others, ...reordered];
    });
    setActiveId(null);
  }, [workItems, updateTaskStatus]);

  const onDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
  }, []);

  const onDragCancel = useCallback(() => setActiveId(null), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    }

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  const fetchWorkItems = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const stored = localStorage.getItem("workspaceSelecionado");
      const wsId = stored ? JSON.parse(stored).id : null;
      const url = wsId ? `/api/tasks?workspaceId=${wsId}` : "/api/tasks";
      const res = await fetch(url, {
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Erro ao buscar tarefas:", res.statusText);
        return;
      }
      const data: WorkItem[] = await res.json();
      if (Array.isArray(data)) setWorkItems(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [status]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  useEffect(() => {
    const handler = () => {
      fetchWorkItems();
    };
    window.addEventListener('workspaceChanged', handler);
    return () => window.removeEventListener('workspaceChanged', handler);
  }, [fetchWorkItems]);

  const handleCreateTask = async ({ title, description, assignedUserId }: { title: string; description: string; assignedUserId?: string }) => {
    if (status !== "authenticated" || !userId) return;
    try {
      const stored = localStorage.getItem("workspaceSelecionado");
      const wsId = stored ? JSON.parse(stored).id : null;
      const res = await fetch("/api/tasks", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          status: targetStatus,
          priority: "NONE",
          assignees: [],
          labels: [],
          workspaceId: wsId,
          assignedUserId
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error("Erro ao criar tarefa: " + errorText);
      }

      await res.json();
      await fetchWorkItems();

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Erro ao criar tarefa. Por favor, tente novamente.");
    }
  };

  const toggleColumnCollapse = (status: Status) => {
    setCollapsedColumns(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "HIGH": return <FaCircle className="text-red-500 text-xs" />;
      case "MEDIUM": return <FaCircle className="text-yellow-500 text-xs" />;
      case "LOW": return <FaCircle className="text-green-500 text-xs" />;
      default: return <FaRegCircle className="text-gray-500 text-xs" />;
    }
  };

  const SortableCard = ({ item }: { item: WorkItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : undefined,
      boxShadow: isDragging ? "0 10px 25px rgba(0,0,0,0.2)" : undefined,
      opacity: isDragging ? 0 : 1,
    } as React.CSSProperties;

    const shouldShow = (property: DisplayOption) => {
      return displayOptions.visibleProperties.includes(property);
    };
    const renderProperty = (property: string) => {
      switch (property) {
        case 'ID':
          return (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">
              PRIME-{item.id}
            </div>
          );
        case 'Título':
          return (
            <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
              {item.title}
            </h3>
          );
        case 'Estado':
          return (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              <FaSyncAlt className="text-gray-500" />
              <span className="capitalize">{item.status.toLowerCase()}</span>
            </div>
          );
        case 'Prioridade':
          return (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              {getPriorityIcon(item.priority)}
              <span className="capitalize">{item.priority.toLowerCase()}</span>
            </div>
          );
        case 'Data de início':
          return item.startDate && !isNaN(parseLocalDate(item.startDate).getTime()) ? (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              <FaCalendarAlt className="text-gray-500" />
              <span>{format(parseLocalDate(item.startDate), "MMM dd, yyyy")}</span>
            </div>
          ) : null;
        case 'Prazo':
          return item.dueDate ? (
            <div className="flex items-center gap-1 border border-red-400 text-red-500 rounded-full px-2 py-1">
              <FaCalendarAlt className="text-red-500" />
              <span>{format(parseLocalDate(item.dueDate), "MMM dd, yyyy")}</span>
            </div>
          ) : null;
        case 'Responsável':
          return item.assignedUserId ? (
            <div className="flex items-center gap-1 border border-blue-300 dark:border-blue-600 rounded-full px-2 py-1 text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <FaUser className="text-blue-500" />
              <span>{item.assignedUserName || 'Responsável'}</span>
            </div>
          ) : null;
        case 'Módulo':
          return item.module ? (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              <span>{item.module}</span>
            </div>
          ) : null;
        case 'Ciclo':
          return item.cycle ? (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              <span>{item.cycle}</span>
            </div>
          ) : null;
        case 'Etiquetas':
          return item.labels && item.labels.length > 0 ? (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              <FaTag className="text-gray-500" />
              <span className="dark:text-gray-200">{item.labels.join(", ")}</span>
            </div>
          ) : null;
        default:
          return null;
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-grab active:cursor-grabbing"
        onClick={() => setSelectedItem(item)}
      >
        <div className="text-sm font-medium mb-2">{item.title}</div>
        {shouldShow('ID') && <div className="text-xs text-gray-500 mb-2">#{item.id}</div>}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          {shouldShow('Prioridade') && (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              {getPriorityIcon(item.priority)}
            </div>
          )}
          {item.creator && (
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 text-gray-800 dark:text-gray-200">
              <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <FaUser className="text-purple-500 text-[10px]" />
              </div>
              <span className="text-gray-700 dark:text-gray-300 text-xs">
                {item.creator.split(' ')[0]}
              </span>
            </div>
          )}
          {(['Estado', 'Data de início', 'Prazo', 'Responsável', 'Módulo', 'Ciclo', 'Etiquetas'] as const)
            .filter(prop => shouldShow(prop))
            .map(prop => (
              <div key={prop}>
                {renderProperty(prop)}
              </div>
            ))}
        </div>
      </div>
    );
  };

  if (status === "loading") return <div className="p-4 text-white">Carregando sessão...</div>;
  if (!session) return <div className="p-4 text-red-500">Sessão inválida</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-3 p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-bold text-center sm:text-left sm:text-xl">{workspaceName} &gt; Item de Trabalho</h1>
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <button
                className="flex w-full items-center justify-center gap-1 bg-[#2c2c2c] text-white px-3 py-2 rounded-md text-sm border border-gray-700 hover:bg-[#3a3a3a] transition"
                onClick={() => setShowFilter(prev => !prev)}
              >
                <IoFunnelOutline />
                Filtros
              </button>
              {showFilter && (
                <div ref={dropdownRef} className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-full sm:w-auto">
                  <FilterDropdown
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              )}
            </div>

            <DisplayDropdown
              visibleProperties={displayOptions.visibleProperties}
              showSubtasks={displayOptions.showSubtasks}
              onDisplayOptionChange={handleDisplayOptionChange}
              onToggleSubtasks={(checked) => setDisplayOptions(prev => ({ ...prev, showSubtasks: checked }))}
              viewType={viewType}
              onViewTypeChange={setViewType}
            />
            <button
              className="flex w-full items-center justify-center gap-1 bg-blue-600 px-3 py-2 rounded hover:bg-blue-500 text-sm text-white sm:w-auto"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FaPlus /> Adicionar novo item
            </button>
          </div>
        </div>

      {/* Main content area with view switching */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-4">
        {viewType === "kanban" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
            <div className="flex gap-4 min-w-full sm:min-w-max">
              {Object.entries(collapsedColumns).map(([statusKey, isCollapsed]) => {
              const typedStatus = statusKey as Status;
              return (
                <div key={typedStatus} className="w-[min(18rem,85vw)] sm:w-72 flex-shrink-0">
                  <div
                    className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-t cursor-pointer"
                    onClick={() => toggleColumnCollapse(typedStatus)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Adicionando animação ao ícone de seta */}
                      <div className="transition-transform duration-300 ease-in-out">
                        {isCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                      </div>
                      <h2 className="font-semibold">{typedStatus.replace("_", " ")}</h2>
                      <span className="text-gray-500 text-sm">
                        {filteredTasks.filter(i => i.status === typedStatus).length}
                      </span>
                    </div>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                {/* Conteúdo da coluna com animação */}
                <ColumnDroppable status={typedStatus}>
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-b overflow-hidden transition-all duration-300 ease-in-out ${
                      isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[65vh] sm:max-h-[calc(100vh-220px)] opacity-100'
                    }`}
                  >
                    <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto sm:max-h-none sm:h-[calc(100vh-280px)]">
                      {(() => {
                        const columnItems = filteredTasks.filter(item => item.status === typedStatus);
                        return (
                          <SortableContext items={columnItems.map(i => String(i.id))} strategy={verticalListSortingStrategy}>
                            {columnItems.map((item) => (
                              <SortableCard key={item.id} item={item} />
                            ))}
                          </SortableContext>
                        );
                      })()}

                      {creatingTaskInColumn === typedStatus ? (
                        <div className="w-full mt-2">
                          <input
                            type="text"
                            value={newTaskTitle}
                            autoFocus
                            placeholder="Título da tarefa"
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-500"
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && newTaskTitle.trim()) {
                                setTargetStatus(typedStatus);
                                await handleCreateTask({ title: newTaskTitle.trim(), description: "" });
                                setNewTaskTitle("");
                                setCreatingTaskInColumn(null);
                              } else if (e.key === "Escape") {
                                setCreatingTaskInColumn(null);
                                setNewTaskTitle("");
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1 px-1 italic">
                            Pressione &apos;Enter&apos; para adicionar um outro item de tarefa
                          </p>
                        </div>
                      ) : (
                        <button
                          className="w-full mt-2 px-3 py-2 border border-dashed border-gray-400 rounded text-sm text-gray-500 hover:bg-gray-50"
                          onClick={() => {
                            setTargetStatus(typedStatus);
                            setCreatingTaskInColumn(typedStatus);
                          }}
                        >
                          + Criar tarefa
                        </button>
                      )}
                    </div>
                  </div>
                </ColumnDroppable>
              </div>
            );
          })}
        </div>
        <DragOverlay dropAnimation={{ duration: 180 }}>
          {activeId ? (() => {
            const item = workItems.find(i => String(i.id) === String(activeId));
            if (!item) return null;
            return (
              <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg w-72">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">PRIME-{item.id}</div>
                <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
        ) : viewType === "list" ? (
          <TaskListView 
            tasks={filteredTasks} 
            onTaskClick={setSelectedItem} 
            visibleProperties={displayOptions.visibleProperties}
          />
        ) : viewType === "weekly" ? (
          <TaskWeeklyView 
            tasks={filteredTasks} 
            onTaskClick={setSelectedItem}
          />
        ) : viewType === "monthly" ? (
          <TaskMonthlyView 
            tasks={filteredTasks} 
            onTaskClick={setSelectedItem}
          />
        ) : viewType === "daily" ? (
          <TaskDailyView 
            tasks={filteredTasks}
            onTaskClick={setSelectedItem}
          />
        ) : null}
      </div>
</div>
{selectedItem && (
  <WorkItemSidebar
    item={selectedItem}
    workspaceSlug={workspaceSlug}
    onClose={() => {
      setSelectedItem(null);
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete('task');
      const currentPath = window.location.pathname;
      router.replace(`${currentPath}?${searchParams.toString()}`, { scroll: false });
    }}
    onUpdate={(updated) => {
      setWorkItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      setSelectedItem(updated);
    }}
  />
)}
<CreateTaskModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSubmit={handleCreateTask}
  workspaceSlug={workspaceSlug}
/>
      
      {/* Estilos CSS para animações */}
      <style jsx global>{`
        /* Animação suave para o ícone de seta */
        .transition-transform {
          transition: transform 0.3s ease-in-out;
        }
        
        /* Animação para o conteúdo da coluna */
        .transition-all {
          transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
