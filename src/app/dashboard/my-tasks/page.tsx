"use client";

import Sidebar from "@/components/Sidebar";
import CreateTaskModal from "@/components/CreateTaskModal";
import FilterDropdown from "@/components/FilterDropdown";
import DisplayDropdown from "@/components/DisplayDown";
import WorkItemSidebar from "@/components/WorkItemSidebar";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { useCallback, useEffect, useState, useRef } from "react";
import { format } from "date-fns";
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

export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export type WorkItem = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  assignees?: string[];
  module?: string;
  cycle?: string;
  labels?: string[];
  creator?: string;
};

export default function KanbanPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [workspaceName] = useState("Primeiro Projeto");
  const [collapsedColumns, setCollapsedColumns] = useState<Record<Status, boolean>>({
    BACKLOG: false,
    TODO: false,
    IN_PROGRESS: false,
    DONE: false,
  });
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
      const res = await fetch("/api/tasks", {
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

  const handleCreateTask = async ({ title, description }: { title: string; description: string }) => {
    if (status !== "authenticated" || !userId) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          status: "BACKLOG",
          priority: "NONE",
          assignees: [],
          labels: []
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error("Erro ao criar tarefa: " + errorText);
      }
      const task = await res.json();
      setWorkItems((prev) => [...prev, task]);
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

  const renderCard = (item: WorkItem) => (
    <div
      key={item.id}
      className="bg-white text-black p-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition cursor-pointer"
      onClick={() => setSelectedItem(item)}
    >
      <div className="text-xs text-gray-500 mb-1 font-semibold">PRIME-{item.id}</div>
      <h3 className="text-base font-semibold mb-3">{item.title}</h3>
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
          <FaSyncAlt className="text-gray-500" />
          <span className="capitalize">{item.status.toLowerCase()}</span>
        </div>
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
          {getPriorityIcon(item.priority)}
        </div>
        {item.startDate && !isNaN(new Date(item.startDate).getTime()) && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <FaCalendarAlt className="text-gray-500" />
            <span>Início: {format(new Date(item.startDate), "MMM dd, yyyy")}</span>
          </div>
        )}
        {item.dueDate && (
          <div className="flex items-center gap-1 border border-red-400 text-red-500 rounded-full px-2 py-1">
            <FaCalendarAlt />
            <span>Prazo: {format(new Date(item.dueDate), "MMM dd, yyyy")}</span>
          </div>
        )}
        {item.creator && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <FaUser className="text-gray-500" />
            <span>{item.creator}</span>
          </div>
        )}
        {item.module && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <span>{item.module}</span>
          </div>
        )}
        {item.cycle && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <span>{item.cycle}</span>
          </div>
        )}
        {item.labels && item.labels.length > 0 && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <FaTag className="text-gray-500" />
            <span>{item.labels.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (status === "loading") return <div className="p-4 text-white">Carregando sessão...</div>;
  if (!session) return <div className="p-4 text-red-500">Sessão inválida</div>;

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-white">
          <h1 className="text-xl font-bold">{workspaceName} &gt; Work items</h1>
          <div className="flex gap-2">
            <div className="relative">
              <button
                className="bg-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowFilter(prev => !prev)}
              >
                Filtros
              </button>
              {showFilter && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 z-50">
                  <FilterDropdown />
                </div>
              )}
            </div>


            <DisplayDropdown />
            <button
              className="flex items-center gap-1 bg-blue-600 px-3 py-2 rounded hover:bg-blue-500 text-sm text-white"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FaPlus /> Adicionar novo item
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 min-w-max">
            {Object.entries(collapsedColumns).map(([statusKey, isCollapsed]) => {
              const typedStatus = statusKey as Status;
              return (
                <div key={typedStatus} className="w-72 flex-shrink-0">
                  <div
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-t cursor-pointer"
                    onClick={() => toggleColumnCollapse(typedStatus)}
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                      <h2 className="font-semibold">{typedStatus.replace("_", " ")}</h2>
                      <span className="text-gray-500 text-sm">
                        {workItems.filter(i => i.status === typedStatus).length}
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
                  {!isCollapsed && (
                    <div className="bg-white rounded-b p-2 space-y-2">
                      {workItems.filter(item => item.status === typedStatus).map(renderCard)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selectedItem && (
        <WorkItemSidebar
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={(updated: WorkItem) => {
            setWorkItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
            setSelectedItem(updated);
          }}
        />
      )}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
