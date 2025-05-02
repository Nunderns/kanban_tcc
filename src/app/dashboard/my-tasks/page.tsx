"use client";

import WorkItemSidebar from "@/components/WorkItemSidebar";
import { useState, useEffect } from "react";
import {
  FaFilter,
  FaChartBar,
  FaPlus,
  FaUser,
  FaTag,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
  FaEllipsisV,
  FaTimes
} from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";
import { format } from "date-fns";

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
};

function CreateTaskModal({ isOpen, onClose, onSubmit }: { 
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
    if (!title.trim()) return; // Validação básica
    
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <button
                type="button"
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
                disabled={isSubmitting}
              >
                <span>Filters</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm ml-2"
                disabled={isSubmitting}
              >
                <span>Display</span>
              </button>
            </div>
            
            <div>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm mr-2"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm disabled:opacity-50"
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [workspaceName] = useState("Primeiro Projeto");
  const [collapsedColumns, setCollapsedColumns] = useState<Record<Status, boolean>>({
    BACKLOG: false,
    TODO: false,
    IN_PROGRESS: false,
    DONE: false
  });
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkItems();
  }, []);

  const fetchWorkItems = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      const parsedData: WorkItem[] = data.map((item: {
        id: string;
        title: string;
        status: Status;
        priority: Priority;
        assignees?: string;
        labels?: string;
        startDate?: string;
        dueDate?: string;
        module?: string;
        cycle?: string;
      }) => ({
        ...item,
        assignees: item.assignees?.split(",").map((a: string) => a.trim()) || [],
        labels: item.labels?.split(",").map((l: string) => l.trim()) || []
      }));
      setWorkItems(parsedData);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const toggleColumnCollapse = (status: Status) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const addWorkItem = async (status: Status) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Work Item",
          status,
          priority: "NONE",
        }),
      });
    
      const newItem = await res.json();
    
      setWorkItems(prev => [
        ...prev,
        {
          ...newItem,
          assignees: newItem.assignees?.split(",") || [],
          labels: newItem.labels?.split(",") || [],
        },
      ]);
    } catch (error) {
      console.error("Failed to add work item:", error);
    }
  };

  const handleCreateTask = async ({ title, description }: { title: string; description: string }) => {
    try {
      // Obtenha o userId real do seu sistema de autenticação
      // Exemplo temporário - substitua pelo valor real
      const userId = 1; 
  
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || "",
          userId, // Enviando como número
          status: "BACKLOG",
          priority: "NONE",
          assignees: [],
          labels: []
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
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
    <div key={item.id} className="bg-gray-700 p-3 rounded hover:bg-gray-600" onClick={() => setSelectedItem(item)}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{item.title}</h3>
        <button className="text-gray-400 hover:text-white">
          <FaEllipsisV />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        {getPriorityIcon(item.priority)}
        <span>{item.module}</span>
        <span>{item.cycle}</span>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs">
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="text-xs" />
          <span>{item.startDate ? format(new Date(item.startDate), "MMM dd, yyyy") : "-"}</span>
        </div>
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="text-xs" />
          <span>{item.dueDate ? format(new Date(item.dueDate), "MMM dd, yyyy") : "-"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs">
        <FaUser className="text-xs" />
        <span>{item.assignees?.join(", ")}</span>
      </div>
      {item.labels?.length ? (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <FaTag className="text-xs" />
          <span>{item.labels.join(", ")}</span>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">{workspaceName} &gt; Work items</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-sm">
              <FaFilter /> Filters
            </button>
            <button className="flex items-center gap-1 bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-sm">
              <IoMdOptions /> Display
            </button>
            <button className="flex items-center gap-1 bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-sm">
              <FaChartBar /> Analytics
            </button>
            <button 
              className="flex items-center gap-1 bg-blue-600 px-3 py-2 rounded hover:bg-blue-500 text-sm"
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
                    className="flex justify-between items-center bg-gray-800 p-2 rounded-t cursor-pointer"
                    onClick={() => toggleColumnCollapse(typedStatus)}
                  >
                    <div className="flex items-center gap-2">
                      {collapsedColumns[typedStatus] ? <FaChevronRight /> : <FaChevronDown />}
                      <h2 className="font-semibold">{typedStatus.replace("_", " ")}</h2>
                      <span className="text-gray-400 text-sm">
                        {workItems.filter(i => i.status === typedStatus).length}
                      </span>
                    </div>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        addWorkItem(typedStatus);
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {!collapsedColumns[typedStatus] && (
                    <div className="bg-gray-800 rounded-b p-2 space-y-2">
                      {workItems.filter(item => item.status === typedStatus).map(renderCard)}
                      <button
                        className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm flex items-center justify-center gap-1"
                        onClick={() => addWorkItem(typedStatus)}
                      >
                        <FaPlus /> Add Work Item
                      </button>
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