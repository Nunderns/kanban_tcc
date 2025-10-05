"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutGrid, 
  Users, 
  ChevronDown, 
  Check, 
  LogOut, 
  Settings, 
  Plus, 
  Home,
  Star,
  FolderPlus
} from 'lucide-react';

interface SidebarProps {
  workspaceSlug?: string;
}
interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isFavorite: boolean;
  status: string;
}

interface Workspace {
  id: number;
  nome: string;
  slug: string;
  tamanhoEmpresa: number;
  funcao: string;
  membros: number;
}

// Add this component at the end of the file
const AddProjectModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Adicionar Projeto</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Funcionalidade de adicionar projeto será implementada em breve.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ workspaceSlug = '' }: SidebarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname() || '';
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [email, setEmail] = useState("");
  const [funcao, setFuncao] = useState("");
  const [membros, setMembros] = useState(0);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [workspacesList, setWorkspacesList] = useState<Workspace[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopover, setShowPopover] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const settingsHref = workspaceSlug ? `/${workspaceSlug}/settings/general` : '/dashboard/settings/general';
  const tasksHref = workspaceSlug ? `/${workspaceSlug}/dashboard/my-tasks` : '/dashboard/my-tasks';
  const overviewHref = workspaceSlug ? `/${workspaceSlug}/dashboard` : '/dashboard';

  useEffect(() => {
    setMounted(true);
    if (session?.user?.email) setEmail(session.user.email);
  }, [session]);

  const togglePopover = (): void => {
    setShowPopover(prev => !prev);
  };

  const selectWorkspace = (ws: Workspace) => {
    setWorkspace(ws);
    setFuncao(ws.funcao);
    setMembros(ws.membros);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        "workspaceSelecionado",
        JSON.stringify({
          id: ws.id,
          nome: ws.nome,
          slug: ws.slug,
          companySize: ws.tamanhoEmpresa,
        })
      );
      
      const newPath = `/${ws.slug}/dashboard`;
      window.location.href = newPath;
      
      window.dispatchEvent(new Event('workspaceChanged'));
    }
    
    setShowPopover(false);
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/workspaces?scope=all');
        if (!response.ok) {
          throw new Error('Failed to fetch workspaces');
        }
        
        const data = await response.json();
        const workspaces: Workspace[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.workspaces)
            ? data.workspaces
            : data
              ? [data]
              : [];
        setWorkspacesList(workspaces);
        
        let currentWorkspace: Workspace | null = null;
        
        if (workspaceSlug) {
          currentWorkspace = workspaces.find(ws => ws.slug === workspaceSlug) || null;
        } else if (workspaces.length > 0) {
          currentWorkspace = workspaces[0];
        }
        
        if (currentWorkspace) {
          setWorkspace(currentWorkspace);
          setFuncao(currentWorkspace.funcao);
          setMembros(currentWorkspace.membros);
          localStorage.setItem(
            "workspaceSelecionado",
            JSON.stringify({
              id: currentWorkspace.id,
              nome: currentWorkspace.nome,
              slug: currentWorkspace.slug,
              companySize: currentWorkspace.tamanhoEmpresa,
            })
          );
        }
        
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        setError('Falha ao carregar os workspaces');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [workspaceSlug]);

  useSession();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/projects', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        let message = 'Failed to fetch projects';
        try {
          const json = JSON.parse(text);
          message = json.message || message;
        } catch {}
        throw new Error(message + (text && typeof text === 'string' ? ` (${text})` : ''));
      }
      
      const data = await response.json();
      setUserProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopover]);

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link href={overviewHref} className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center mr-2">
            <LayoutGrid size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </Link>
      </div>

      {/* Current Workspace */}
      <div className="relative border-b border-gray-200 dark:border-gray-700">
        <div 
          ref={buttonRef}
          onClick={togglePopover}
          className="group flex items-center w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center w-full">
            <div className="w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mr-3">
              <Users size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {mounted ? (workspace?.nome || 'Nenhum workspace') : 'Carregando...'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {funcao || 'Membro'} • {membros} membro{membros !== 1 ? 's' : ''}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400 ml-2 flex-shrink-0" />
          </div>
        </div>
        {showPopover && mounted && (
          <div
            ref={popoverRef}
            className="fixed z-[100] w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden mt-1"
            style={{
              maxHeight: 'calc(100vh - 2rem)'
            }}
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-300 mb-1">Logado como</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{email || 'Usuário'}</p>
                <Check size={16} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{funcao || 'Membro'}</p>
            </div>

            <div className="p-2">
              <Link
                href={settingsHref}
                onClick={() => setShowPopover(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  pathname?.startsWith(settingsHref) 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <Settings size={18} className="flex-shrink-0" />
                <span>Configurações</span>
              </Link>

              <Link
                href={tasksHref}
                onClick={() => setShowPopover(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  pathname?.startsWith(tasksHref)
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <Check size={18} className="flex-shrink-0" />
                <span>Minhas Tarefas</span>
              </Link>

              <Link
                href={overviewHref}
                onClick={() => setShowPopover(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  pathname === overviewHref || pathname?.startsWith(`${overviewHref}`)
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <LayoutGrid size={18} className="flex-shrink-0" />
                <span>Visão Geral</span>
              </Link>

              <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

              {/* Workspaces List */}
              <div className="px-2 py-1 mb-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">
                  Seus workspaces
                </h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {workspacesList.map((ws) => (
                    <div
                      key={ws.id}
                      onClick={() => {
                        selectWorkspace(ws);
                        setShowPopover(false);
                      }}
                      className={`flex items-center p-2 rounded-lg text-sm cursor-pointer ${
                        workspace?.id === ws.id
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-2">
                        <Users size={12} className="text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <span className="truncate">{ws.nome}</span>
                      {workspace?.id === ws.id && (
                        <Check size={16} className="ml-auto text-indigo-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

              <Link
                href="/create-workspace"
                onClick={() => setShowPopover(false)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
              >
                <Plus size={18} className="flex-shrink-0" />
                <span>Criar novo workspace</span>
              </Link>

              <button
                onClick={() => {
                  signOut({
                    callbackUrl: `${window.location.origin}/`
                  });
                  setShowPopover(false);
                }}
                className="flex items-center w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} className="mr-3 flex-shrink-0" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">

        <div className="px-4 py-2">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                pathname === '/dashboard'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Home size={18} className="mr-3" />
              Início
            </Link>
            <Link
              href={overviewHref}
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                pathname === overviewHref
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutGrid size={18} className="mr-3" />
              Visão Geral
            </Link>
            <Link
              href={tasksHref}
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                pathname === tasksHref
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Check size={18} className="mr-3" />
              Minhas Tarefas
            </Link>
          </nav>
        </div>
      </div>

      {/* Projects Section */}
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
          Projetos
        </h3>
        <nav className="space-y-1">
          {error ? (
            <div className="text-center py-2">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <button
                onClick={fetchProjects}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 mb-2">Nenhum projeto encontrado</p>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Criar seu primeiro projeto
              </button>
            </div>
          ) : (
            <>
              {userProjects.map((project) => {
                const isActive = pathname === `/projects/${project.id}`;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={`flex items-center w-full text-left group rounded-lg px-2 py-1.5 transition-colors border ${
                      isActive
                        ? "bg-indigo-50 dark:bg-gray-800 border-indigo-200 dark:border-gray-700"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${isActive ? "ring-2 ring-indigo-400" : ""}`} 
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    ></div>
                    <span className={`truncate ${isActive ? "text-indigo-700 dark:text-indigo-300 font-medium" : "text-gray-700 dark:text-gray-200"}`}>
                      {project.name}
                    </span>
                    <div className="ml-auto flex items-center">
                      {project.isFavorite && (
                        <Star 
                          size={14} 
                          className="text-yellow-400 fill-yellow-400 flex-shrink-0"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
              <button 
                onClick={() => setShowAddProjectModal(true)}
                className="flex items-center w-full text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors group"
              >
                <FolderPlus size={16} className="text-indigo-500 mr-3 group-hover:text-indigo-600" />
                Adicionar projeto
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Settings Section */}
      <div className="mt-auto">
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={settingsHref}
            className={`flex items-center px-3 py-2 text-sm rounded-md ${
              pathname === settingsHref
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <Settings size={18} className="mr-3" />
            Configurações
          </Link>
        </div>

        <AddProjectModal 
          isOpen={showAddProjectModal}
          onClose={() => {
            setShowAddProjectModal(false);
            setError('');
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
export { Sidebar };
