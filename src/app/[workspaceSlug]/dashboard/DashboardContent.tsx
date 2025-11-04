'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
// Removed unused imports
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  color: string;
}

interface DashboardContentProps {
  params: {
    workspaceSlug: string;
  };
}

export default function DashboardContent({ params }: DashboardContentProps) {
  // State and data fetching
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    projects: Project[];
    totalTasks: number;
    completedTasks: number;
  }>({
    projects: [],
    totalTasks: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspaces/${params.workspaceSlug}/stats`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.workspaceSlug]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-48">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-4" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meus Projetos</h1>
        <Link href={`/${params.workspaceSlug}/projects/new`}>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <FiPlus className="w-4 h-4" />
            Novo Projeto
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.projects.map((project) => {
          const progressPercentage = Math.round(project.progress * 100);
          const colorMap = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
            purple: 'bg-purple-500',
            pink: 'bg-pink-500',
          };
          
          const bgColor = colorMap[project.color as keyof typeof colorMap] || 'bg-blue-500';
          
          return (
            <Link 
              key={project.id} 
              href={`/${params.workspaceSlug}/projects/${project.id}`}
              className="block hover:shadow-lg transition-shadow"
            >
              <Card className="h-full flex flex-col">
                <div className={`h-2 ${bgColor} rounded-t-lg`}></div>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description || 'Sem descrição'}
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Progresso</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${bgColor}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {project.completedTasks} de {project.totalTasks} tarefas concluídas
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
