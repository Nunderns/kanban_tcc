"use client";
import Sidebar from "@/components/Sidebar";
import { format } from "date-fns";
import WorkItemSidebar from "@/components/WorkItemSidebar";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  FaFilter,
  FaChartBar,
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
  FaTimes,
  FaUser,
  FaTag,
  FaCalendarAlt,
  FaSyncAlt
} from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";

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

function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description });
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm mb-4"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm h-24 mb-4"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { data: session } = useSession();
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

  const fetchWorkItems = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/tasks?userId=${userId}`);
      const data: WorkItem[] = await res.json();
      setWorkItems(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  const handleCreateTask = async ({ title, description }: { title: string; description: string }) => {
    if (!userId) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        userId,
        status: "BACKLOG",
        priority: "NONE",
        assignees: [],
        labels: []
      })
    });
    const task = await res.json();
    setWorkItems((prev) => [...prev, task]);
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
        {/* Status */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
          <FaSyncAlt className="text-gray-500" />
          <span className="capitalize">{item.status.toLowerCase()}</span>
        </div>
  
        {/* Prioridade */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
          {getPriorityIcon(item.priority)}
        </div>
  
        {/* Data de Início */}
        {item.startDate && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <FaCalendarAlt className="text-gray-500" />
            <span>Início: {format(new Date(item.startDate), "MMM dd, yyyy")}</span>
          </div>
        )}
  
        {/* Data de Entrega */}
        {item.dueDate && (
          <div className="flex items-center gap-1 border border-red-400 text-red-500 rounded-full px-2 py-1">
            <FaCalendarAlt />
            <span>Prazo: {format(new Date(item.dueDate), "MMM dd, yyyy")}</span>
          </div>
        )}
  
        {/* Responsável (nome) */}
        {item.creator && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <FaUser className="text-gray-500" />
            <span>{item.creator}</span>
          </div>
        )}
  
        {/* Módulo */}
        {item.module && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <span>{item.module}</span>
          </div>
        )}
  
        {/* Ciclo */}
        {item.cycle && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <span>{item.cycle}</span>
          </div>
        )}
  
        {/* Etiquetas */}
        {item.labels && item.labels.length > 0 && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-2 py-1">
            <FaTag className="text-gray-500" />
            <span>{item.labels.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
  

  if (!session) return <div className="p-4 text-white">Carregando sessão...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-white">
          <h1 className="text-xl font-bold">{workspaceName} &gt; Work items</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 text-sm text-gray-700">
              <FaFilter /> Filters
            </button>
            <button className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 text-sm text-gray-700">
              <IoMdOptions /> Display
            </button>
            <button className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 text-sm text-gray-700">
              <FaChartBar /> Analytics
            </button>
            <button
              className="flex items-center gap-1 bg-blue-600 px-3 py-2 rounded hover:bg-blue-500 text-sm text-white"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FaPlus /> Add Work Item
            </button>
          </div>
        </div>
  
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 min-w-max">
            {Object.keys(collapsedColumns).map((status) => {
              const typedStatus = status as Status;
              return (
                <div key={typedStatus} className="w-72 flex-shrink-0">
                  <div
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-t cursor-pointer"
                    onClick={() => toggleColumnCollapse(typedStatus)}
                  >
                    <div className="flex items-center gap-2">
                      {collapsedColumns[typedStatus] ? <FaChevronRight /> : <FaChevronDown />}
                      <h2 className="font-semibold">{typedStatus.replace("_", " ")}</h2>
                      <span className="text-gray-500 text-sm">
                        {workItems.filter(i => i.status === typedStatus).length}
                      </span>
                    </div>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateTask({ title: "New Task", description: "" });
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {!collapsedColumns[typedStatus] && (
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
