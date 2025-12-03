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
  Menu,
  FolderPlus,
  X
} from 'lucide-react';
import { AddProjectModal } from './modals/AddProjectModal';

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

// AddProjectModal is now imported from './modals/AddProjectModal'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openMobileMenu = () => setIsMobileMenuOpen(true);

  const togglePopover = (): void => {
    setShowPopover(prev => !prev);
  };

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || '';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

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
    closeMobileMenu();
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


  useEffect(() => {
    if (workspaceSlug) {
      fetchProjects();
    }
  }, [workspaceSlug]);

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
        } catch { }
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
    <div className="relative z-40 flex flex-col lg:w-64 lg:flex-none">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 lg:hidden">
        <Link href={overviewHref} onClick={closeMobileMenu} className="flex items-center">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600">
            <LayoutGrid size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </Link>
        <button
          type="button"
          onClick={openMobileMenu}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Abrir menu de navegação"
          aria-expanded={isMobileMenuOpen}
          aria-controls="sidebar-navigation"
        >
          <Menu size={20} />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar-navigation"
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 lg:static lg:inset-auto lg:translate-x-0 lg:bg-transparent ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:h-full">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
            <Link href={overviewHref} onClick={closeMobileMenu} className="flex items-center">
              <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600">
                <LayoutGrid size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Fechar menu de navegação"
            >
              <X size={18} />
            </button>
          </div>

          {/* Current Workspace */}
          <div className="relative border-b border-gray-200 dark:border-gray-700">
            <div
              ref={buttonRef}
              onClick={togglePopover}
              className="group flex w-full cursor-pointer items-center p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex w-full items-center">
                <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <Users size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {mounted ? (workspace?.nome || 'Nenhum workspace') : 'Carregando...'}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {funcao || 'Membro'} • {membros} membro{membros !== 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronDown size={16} className="ml-2 flex-shrink-0 text-gray-400" />
              </div>
            </div>
            {showPopover && mounted && (
              <div
                ref={popoverRef}
                className="fixed z-[100] mt-1 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                style={{
                  maxHeight: 'calc(100vh - 2rem)'
                }}
              >
                <div className="border-b border-gray-100 p-4 dark:border-gray-700">
                  <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-300">Logado como</p>
                  <div className="flex items-center justify-between">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{email || 'Usuário'}</p>
                    <Check size={16} className="ml-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">{funcao || 'Membro'}</p>
                </div>

                <div className="p-2">
                  <Link
                    href={settingsHref}
                    onClick={() => {
                      setShowPopover(false);
                      closeMobileMenu();
                    }}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${pathname?.startsWith(settingsHref)
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Settings size={18} className="flex-shrink-0" />
                    <span>Configurações</span>
                  </Link>

                  <Link
                    href={tasksHref}
                    onClick={() => {
                      setShowPopover(false);
                      closeMobileMenu();
                    }}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${pathname?.startsWith(tasksHref)
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Check size={18} className="flex-shrink-0" />
                    <span>Minhas Tarefas</span>
                  </Link>

                  <Link
                    href={overviewHref}
                    onClick={() => {
                      setShowPopover(false);
                      closeMobileMenu();
                    }}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${pathname === overviewHref || pathname?.startsWith(`${overviewHref}`)
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <LayoutGrid size={18} className="flex-shrink-0" />
                    <span>Visão Geral</span>
                  </Link>

                  <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>

                  {/* Lista de workspaces */}
                  <div className="mb-2 px-2 py-1">
                    <h3 className="mb-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Seus workspaces
                    </h3>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {workspacesList.map((ws) => (
                        <div
                          key={ws.id}
                          onClick={() => {
                            selectWorkspace(ws);
                            setShowPopover(false);
                          }}
                          className={`flex cursor-pointer items-center rounded-lg p-2 text-sm ${workspace?.id === ws.id
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium'
                              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                            }`}
                        >
                          <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30">
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

                  <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>

                  <Link
                    href="/create-workspace"
                    onClick={() => {
                      setShowPopover(false);
                      closeMobileMenu();
                    }}
                    className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
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
                      closeMobileMenu();
                    }}
                    className="flex w-full items-center rounded-lg px-4 py-2 text-left text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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
                  href={`/${workspaceSlug}/`}
                  onClick={closeMobileMenu}
                  className={`flex items-center rounded-md px-3 py-2 text-sm ${pathname === `/${workspaceSlug}/`
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                  <Home size={18} className="mr-3" />
                  Início
                </Link>
                <Link
                  href={overviewHref}
                  onClick={closeMobileMenu}
                  className={`flex items-center rounded-md px-3 py-2 text-sm ${pathname === overviewHref
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                  <LayoutGrid size={18} className="mr-3" />
                  Visão Geral
                </Link>
                <Link
                  href={tasksHref}
                  onClick={closeMobileMenu}
                  className={`flex items-center rounded-md px-3 py-2 text-sm ${pathname === tasksHref
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

          {/* Projetos */}
          <div className="px-4 py-2">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Projetos
            </h3>
            <nav className="space-y-1">
              {error ? (
                <div className="py-2 text-center">
                  <p className="mb-2 text-sm text-red-500">{error}</p>
                  <button
                    onClick={fetchProjects}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : loading ? (
                <div className="flex justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-500"></div>
                </div>
              ) : userProjects.length === 0 ? (
                <div className="py-2 text-center">
                  <p className="mb-2 text-sm text-gray-500">Nenhum projeto encontrado</p>
                  <AddProjectModal
                    workspaceSlug={workspaceSlug}
                    onProjectCreated={fetchProjects}
                    trigger={
                      <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                        Criar seu primeiro projeto
                      </button>
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <AddProjectModal
                      workspaceSlug={workspaceSlug}
                      onProjectCreated={fetchProjects}
                      trigger={
                        <button
                          className="group flex w-full items-center rounded-lg px-3 py-2 text-sm text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-800"
                        >
                          <FolderPlus size={16} className="mr-3 text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-400" />
                          Adicionar projeto
                        </button>
                      }
                    />
                    {userProjects.map((project) => {
                      const isActive = pathname === `/${workspaceSlug}/projects/${project.id}`;
                      return (
                        <Link
                          key={project.id}
                          href={`/${workspaceSlug}/projects/${project.id}`}
                          onClick={closeMobileMenu}
                          className={`group flex w-full items-center rounded-lg border px-2 py-1.5 text-left transition-colors ${isActive
                              ? 'border-indigo-200 bg-indigo-50 dark:border-gray-700 dark:bg-gray-800'
                              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                          <div
                            className={`mr-3 h-2 w-2 flex-shrink-0 rounded-full ${isActive ? 'ring-2 ring-indigo-400' : ''}`}
                            style={{ backgroundColor: project.color || '#3b82f6' }}
                          ></div>
                          <span
                            className={`truncate ${isActive
                                ? 'font-medium text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-700 dark:text-gray-200'
                              }`}
                          >
                            {project.name}
                          </span>
                          <div className="ml-auto flex items-center">
                            {project.isFavorite && (
                              <Star
                                size={14}
                                className="flex-shrink-0 fill-yellow-400 text-yellow-400"
                              />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </nav>

            {/* Settings Section */}
            <div className="mt-auto">
              <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
                <Link
                  href={settingsHref}
                  onClick={closeMobileMenu}
                  className={`flex items-center rounded-md px-3 py-2 text-sm ${pathname === settingsHref
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                  <Settings size={18} className="mr-3" />
                  Configurações
                </Link>
              </div>
            </div>

          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
export { Sidebar };
