"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaTimes, FaUser, FaChevronDown } from "react-icons/fa";

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
  projectId?: string;
  projectName?: string;
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
  workspaceSlug
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description: string; assignedUserId?: string; projectId?: string }) => Promise<void>;
  workspaceSlug: string
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string, name: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchWorkspaceData = useCallback(async () => {
    try {
      setLoadingMembers(true);
      setLoadingProjects(true);

      const membersResponse = await fetch(`/api/workspaces/${workspaceSlug}/members`);
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        interface Member {
          userId: string;
          user: {
            name: string | null;
            email: string;
          };
          role: string;
        }
        
        const formattedMembers = membersData.members?.map((member: Member) => ({
          id: member.userId,
          fullName: member.user.name || member.user.email,
          displayName: member.user.name || member.user.email.split('@')[0],
          email: member.user.email,
          role: member.role
        })) || [];
        setWorkspaceMembers(formattedMembers);
      } else {
        console.error('Erro ao buscar membros:', await membersResponse.text());
      }
      const projectsResponse = await fetch(`/api/workspaces/${workspaceSlug}/projects`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      } else {
        console.error('Erro ao buscar projetos:', await projectsResponse.text());
      }
    } catch (error) {
      console.error('Erro ao buscar dados da workspace:', error);
    } finally {
      setLoadingMembers(false);
      setLoadingProjects(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaceData();
    }
  }, [isOpen, fetchWorkspaceData]);

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
        assignedUserId: selectedUser || undefined,
        projectId: selectedProject || undefined
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999]">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-black dark:text-white shadow-xl"
        ref={modalRef}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Criar Tarefa</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm mb-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <textarea
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm h-24 mb-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* User Assignment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Atribuir a usuário
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
              >
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {selectedUser
                      ? workspaceMembers.find(m => m.id === selectedUser)?.fullName || 'Usuário selecionado'
                      : 'Selecione um usuário (opcional)'
                    }
                  </span>
                </div>
                <FaChevronDown className="text-xs text-gray-500 dark:text-gray-400" />
              </button>
              {isUserDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto">
                  {loadingMembers ? (
                    <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Carregando...</div>
                  ) : workspaceMembers.length > 0 ? (
                    workspaceMembers.map(member => (
                      <div
                        key={member.id}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-gray-900 dark:text-white"
                        onClick={() => {
                          setSelectedUser(member.id);
                          setIsUserDropdownOpen(false);
                        }}
                      >
                        <FaUser className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="truncate">{member.displayName || member.fullName || member.email}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Nenhum membro encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Project Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Projeto
            </label>
            <div className="relative">
              <div
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm flex justify-between items-center cursor-pointer text-gray-900 dark:text-white"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              >
                <span>
                  {selectedProject
                    ? projects.find((p) => p.id === selectedProject)?.name || "Projeto selecionado"
                    : "Selecione um projeto (opcional)"}
                </span>
                <FaChevronDown className="text-xs text-gray-500 dark:text-gray-400" />
              </div>
              {isProjectDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto">
                  {loadingProjects ? (
                    <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                      Carregando...
                    </div>
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                        onClick={() => {
                          setSelectedProject(project.id);
                          setIsProjectDropdownOpen(false);
                        }}
                      >
                        {project.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                      Nenhum projeto encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 px-4 py-2 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando...
                </span>
              ) : "Criar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;