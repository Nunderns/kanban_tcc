"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import Link from "next/link";
import axios from "axios";
import { 
  FiCheckSquare, 
  FiClipboard, 
  FiUsers, 
  FiChevronRight, 
  FiClock, 
  FiFolder, 
  FiUser, 
  FiPlus, 
  FiSearch, 
  FiMenu 
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

// Progress component
const Progress = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

interface Task {
  id: string;
  title: string;
  description: string;
  remainingDays: number | null;
}

interface Project {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [stats, setStats] = useState<{
    totalProjects: number;
    totalTasks: number;
    assignedTasks: number;
    completedTasks: number;
    projects: Project[];
    tasks: Task[];
    members: Member[];
  }>({
    totalProjects: 0,
    totalTasks: 0,
    assignedTasks: 0,
    completedTasks: 0,
    projects: [],
    tasks: [],
    members: [],
  });

  const firstTaskRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    async function fetchData() {
      try {
        setIsLoading(true);
        // Simulando carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data } = await axios.get("/api/dashboard");
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isClient) {
      fetchData();
    }
  }, [isClient]);

  // Filter tasks based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(stats.tasks);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTasks(
        stats.tasks.filter(
          task => 
            task.title.toLowerCase().includes(query) || 
            task.description.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, stats.tasks]);

  // Scroll to first task when tasks change
  useEffect(() => {
    if (filteredTasks.length > 0 && firstTaskRef.current) {
      firstTaskRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [filteredTasks]);

  // Handler functions
  const handleAddTask = () => {
    setIsAddingTask(true);
    // In a real app, you would open a modal or navigate to a new task page
    console.log('Opening new task form...');
    // Simulate API call
    setTimeout(() => {
      setIsAddingTask(false);
      // Add your task creation logic here
    }, 1000);
  };

  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "UN";
    const name = nameOrEmail.trim();
    if (name.includes(" ")) {
      const parts = name.split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0];
      const last = parts[parts.length - 1]?.[0];
      return `${(first || "U").toUpperCase()}${(last || "N").toUpperCase()}`;
    }
    // fallback: if it's an email, take first letter and domain letter
    const emailParts = name.split("@");
    if (emailParts.length === 2) {
      const a = emailParts[0]?.[0] || "U";
      const b = emailParts[1]?.[0] || "N";
      return `${a.toUpperCase()}${b.toUpperCase()}`;
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleAddProject = () => {
    setIsAddingProject(true);
    console.log('Opening new project form...');
    // Simulate API call
    setTimeout(() => {
      setIsAddingProject(false);
      // Add your project creation logic here
    }, 1000);
  };

  const handleAddMember = () => {
    setIsAddingMember(true);
    console.log('Opening add member form...');
    // Simulate API call
    setTimeout(() => {
      setIsAddingMember(false);
      // Add your member addition logic here
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-25 to-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-500">Bem-vindo de volta! Aqui está seu resumo diário.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:min-w-[300px]">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Botão de notificações */}
            <div className="relative">
              <NotificationsDropdown />
            </div>
            {/* Avatar do usuário */}
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button aria-label="Abrir menu do usuário" className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage
                        src={session?.user?.image ?? undefined}
                        alt={session?.user?.name || session?.user?.email || "Avatar do usuário"}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(session?.user?.name || session?.user?.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name || "Usuário"}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                  </div>
                  <div className="mt-2 grid gap-2">
                    <Link href="/dashboard/settings">
                      <Button variant="outline" size="sm" className="w-full justify-start">Perfil</Button>
                    </Link>
                    <Link href="/dashboard/settings#preferences">
                      <Button variant="outline" size="sm" className="w-full justify-start">Preferências</Button>
                    </Link>
                    <div className="my-1 h-px bg-gray-200" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      Sair
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <button className="md:hidden p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors">
              <FiMenu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {['overview', 'projects', 'tasks', 'reports', 'team'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            // Skeleton loaders for stats cards
            Array(4).fill(0).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            [
              { 
                title: "Total de Projetos", 
                value: stats.totalProjects,
                icon: <FiFolder className="w-6 h-6 text-blue-500" />,
                color: "bg-blue-100 text-blue-600"
              },
              { 
                title: "Total de Tarefas", 
                value: stats.totalTasks,
                icon: <FiClipboard className="w-6 h-6 text-green-500" />,
                color: "bg-green-100 text-green-600"
              },
              { 
                title: "Tarefas Atribuídas", 
                value: stats.assignedTasks,
                icon: <FiUsers className="w-6 h-6 text-yellow-500" />,
                color: "bg-yellow-100 text-yellow-600"
              },
              { 
                title: "Tarefas Concluídas", 
                value: stats.completedTasks,
                icon: <FiCheckSquare className="w-6 h-6 text-purple-500" />,
                color: "bg-purple-100 text-purple-600"
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{item.title}</p>
                        <p className="text-3xl font-bold mt-1">{item.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${item.color} bg-opacity-20`}>
                        {item.icon}
                      </div>
                    </div>
                    {item.title === "Tarefas Concluídas" && stats.totalTasks > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Progresso</span>
                          <span>{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</span>
                        </div>
                        <Progress value={(stats.completedTasks / stats.totalTasks) * 100} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Tasks and Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tasks List */}
          <Card className="lg:col-span-2">
            {isLoading ? (
              <div>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  {Array(3).fill(0).map((_, idx) => (
                    <div key={`task-skeleton-${idx}`} className="mb-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </CardContent>
              </div>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-semibold">Minhas Tarefas</CardTitle>
                      <CardDescription>{stats.tasks.length} tarefas atribuídas</CardDescription>
                    </div>
                    <button 
                      onClick={() => setActiveTab('tasks')}
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      Ver todas <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {filteredTasks.slice(0, 5).map((task, index) => (
                      <motion.div 
                        key={task.id}
                        ref={index === 0 ? firstTaskRef : null}
                        className="p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                        whileHover={{ scale: 1.01, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      >
                        <div className="flex items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                            {task.remainingDays !== null && task.remainingDays !== undefined && (
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <FiClock className="mr-1" />
                                <span>
                                  {task.remainingDays} {task.remainingDays === 1 ? 'dia restante' : 'dias restantes'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {stats.tasks.length === 0 && (
                      <motion.div 
                        className="p-6 text-center text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex flex-col items-center justify-center py-8">
                          <FiClipboard className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500">Nenhuma tarefa atribuída no momento.</p>
                          <button 
                            onClick={handleAddTask}
                            disabled={isAddingTask}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                          >
                            {isAddingTask ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adicionando...
                              </>
                            ) : (
                              <>
                                <FiPlus className="mr-2" /> Nova Tarefa
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Lista de Projetos */}
          <Card>
            {isLoading ? (
              <div>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  {Array(3).fill(0).map((_, idx) => (
                    <div key={`project-skeleton-${idx}`} className="flex items-center mb-3">
                      <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </div>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-lg">Meus Projetos</CardTitle>
                  <CardDescription>{stats.projects.length} projetos ativos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.projects.map((project) => (
                      <Link 
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200 group"
                      >
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                            <FiFolder className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-blue-600">{project.name}</p>
                            <p className="text-xs text-gray-500">Última atualização: 2 dias atrás</p>
                          </div>
                          <FiChevronRight className="ml-auto text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                        </div>
                      </Link>
                    ))}
                    {stats.projects.length === 0 && (
                      <div className="text-center py-6">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                          <FiFolder className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 mb-4">Nenhum projeto encontrado</p>
                          <button 
                            onClick={handleAddProject}
                            disabled={isAddingProject}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                          >
                            {isAddingProject ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Criando...
                              </>
                            ) : (
                              <>
                                <FiPlus className="mr-2" /> Criar Projeto
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Team Members */}
        <Card className="mt-6">
          {isLoading ? (
            <div>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array(4).fill(0).map((_, idx) => (
                    <div key={`member-skeleton-${idx}`} className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          ) : (
            <>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Membros da Equipe</CardTitle>
                    <CardDescription>{stats.members.length} pessoas na equipe</CardDescription>
                  </div>
                  <button 
                    onClick={() => setActiveTab('team')}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    Ver todos <FiUsers className="ml-1" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stats.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div className="ml-4 overflow-hidden">
                        <p className="font-medium text-gray-900 truncate">{member.name}</p>
                        <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                  {stats.members.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                        <FiUsers className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">Nenhum membro encontrado</p>
                        <button 
                          onClick={handleAddMember}
                          disabled={isAddingMember}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                        >
                          {isAddingMember ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adicionando...
                            </>
                          ) : (
                            <>
                              <FiUser className="mr-2" /> Adicionar Membro
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Floating Action Button with Dropdown */}
      {isClient && !isLoading && (
        <div className="fixed bottom-8 right-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Toggle between actions or open a menu
                // For now, we'll default to adding a task
                handleAddTask();
              }}
              className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
              aria-label="Adicionar novo item"
            >
              {isAddingTask || isAddingProject || isAddingMember ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FiPlus className="w-6 h-6" />
              )}
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
