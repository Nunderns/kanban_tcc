"use client"

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import axios from "axios";

interface Task {
  id: string;
  title: string;
  description: string;
  remainingDays: number;
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
  

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get("/api/dashboard");
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Início</h1>
        <p className="text-gray-600 mb-6">Monitore todos os seus projetos e tarefas aqui</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total de Projetos", value: stats.totalProjects },
            { title: "Total de Tarefas", value: stats.totalTasks },
            { title: "Tarefas encarregadas", value: stats.assignedTasks },
            { title: "Tarefas finalizadas", value: stats.completedTasks },
          ].map((item, index) => (
            <Card key={index} className="flex flex-col items-center justify-center p-6 bg-white shadow-lg rounded-lg">
              <CardContent>
                <p className="text-gray-600 text-center">{item.title}</p>
                <p className="text-4xl font-bold text-blue-600">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Container para Tarefas e Projetos */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
          {/* Lista de Tarefas encarregadas */}
          <div className="bg-white p-6 rounded-lg shadow w-full md:w-2/3">
            <h2 className="text-xl font-semibold">Tarefas encarregadas ({stats.tasks.length})</h2>
            <div className="mt-4 space-y-4">
              {stats.tasks.map((task) => (
                <div key={task.id} className="bg-gray-100 p-4 rounded-lg shadow">
                  <p className="font-semibold text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.description} • {task.remainingDays} Dias Restantes</p>
                </div>
              ))}
            </div>
            <button className="w-full text-blue-600 mt-4">Mostrar Todos</button>
          </div>

          {/* Lista de Projetos */}
          <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/3">
            <h2 className="text-xl font-semibold">Projetos ({stats.projects.length})</h2>
            <div className="mt-4 space-x-2">
              {stats.projects.map((project) => (
                <button key={project.id} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700">
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="bg-white p-6 rounded-lg shadow mt-6 max-w-4xl">
          <h2 className="text-xl font-semibold">Pessoas ({stats.members.length})</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {stats.members.map((member) => (
              <div key={member.id} className="flex items-center p-4 bg-gray-100 rounded-lg shadow">
                <div className="text-xl font-semibold text-blue-600">{member.name[0]}</div>
                <div className="ml-4">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
