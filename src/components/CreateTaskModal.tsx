"use client";

import FilterDropdown from "@/components/FilterDropdown";
import DisplayDropdown, { DisplayOption } from "@/components/DisplayDown";
import { useState, useRef, useEffect } from "react";
import { FaFilter, FaTimes, FaUser, FaChevronDown } from "react-icons/fa";

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
  assignedUserId?: string;
  assignedUserName?: string;
  module?: string;
  cycle?: string;
  labels?: string[];
  creator?: string;
};

export type WorkspaceMember = {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  role: string;
};

function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description: string; assignedUserId?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [filters, setFilters] = useState({
    priority: [],
    status: [],
    assignee: [],
    creator: [],
    project: [],
    startDate: [],
    dueDate: []
  });
  const [displayOptions, setDisplayOptions] = useState<{
    visibleProperties: DisplayOption[];
    showSubtasks: boolean;
  }>({
    visibleProperties: [
      "ID",
      "Responsável",
      "Data de início",
      "Prazo",
      "Prioridade",
      "Estado"
    ] as DisplayOption[],
    showSubtasks: true
  });
  const [viewType, setViewType] = useState<"kanban" | "list" | "weekly" | "monthly" | "daily">("list");

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType as keyof typeof prev], value]
        : prev[filterType as keyof typeof prev].filter((v: string) => v !== value)
    }));
  };

  const handleDisplayOptionChange = (option: DisplayOption, checked: boolean) => {
    setDisplayOptions(prev => {
      const newProperties = checked
        ? [...prev.visibleProperties, option]
        : prev.visibleProperties.filter(prop => prop !== option);
      
      return {
        ...prev,
        visibleProperties: newProperties
      };
    });
  };

  const handleToggleSubtasks = (checked: boolean) => {
    setDisplayOptions(prev => ({
      ...prev,
      showSubtasks: checked
    }));
  };

  const handleViewTypeChange = (newViewType: "kanban" | "list" | "weekly" | "monthly" | "daily") => {
    setViewType(newViewType);
  };

  const fetchWorkspaceMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await fetch('/api/workspace/members');
      if (response.ok) {
        const data = await response.json();
        setWorkspaceMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching workspace members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaceMembers();
    }
  }, [isOpen]);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ 
        title, 
        description,
        assignedUserId: selectedUser || undefined
      });
      setTitle("");
      setDescription("");
      setSelectedUser("");
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md text-black"
        ref={modalRef}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Criar Tarefa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full bg-white border border-gray-300 rounded p-2 text-sm mb-4"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full bg-white border border-gray-300 rounded p-2 text-sm h-24 mb-4"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* User Assignment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Atribuir a usuário
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-full bg-white border border-gray-300 rounded p-2 text-sm flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-500" />
                  {selectedUser 
                    ? workspaceMembers.find(m => m.id === selectedUser)?.fullName || 'Usuário selecionado'
                    : 'Selecione um usuário (opcional)'
                  }
                </div>
                <FaChevronDown className="text-gray-500" />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser("");
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      <FaUser className="text-gray-400" />
                      Nenhum usuário
                    </button>
                    {loadingMembers ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Carregando...</div>
                    ) : (
                      workspaceMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(member.id);
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                          <FaUser className="text-gray-500" />
                          <div>
                            <div className="font-medium">{member.fullName}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 relative">
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="flex items-center gap-1 bg-[#2c2c2c] text-white px-3 py-1 rounded-md text-sm border border-gray-700 hover:bg-[#3a3a3a] transition"
                >
                  <FaFilter className="text-white" />
                  Filtros
                </button>
                {isFilterOpen && (
                  <div className="absolute mt-2 z-50">
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
                onToggleSubtasks={handleToggleSubtasks}
                viewType={viewType}
                onViewTypeChange={handleViewTypeChange}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-sm border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando..." : "Criar Tarefa"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
