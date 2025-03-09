"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export const Sidebar = () => {
  const [workspace, setWorkspace] = useState("Nome do espaço de trabalho");
  const projects = ["Projeto 1", "Projeto 2"];

  return (
    <aside className="h-screen w-64 bg-neutral-100 p-4 flex flex-col">
      {/* Logo */}
      <Link href="/dashboard" className="text-lg font-semibold">
        TaskPulse
      </Link>

      {/* Espaço de Trabalho */}
      <div className="mt-4 flex items-center justify-between bg-gray-200 p-2 rounded-lg">
        <span className="text-sm font-medium">{workspace}</span>
        <button className="text-gray-600 hover:text-gray-900">
          <Plus size={16} />
        </button>
      </div>

      {/* Navegação (Mantendo os Ícones) */}
      <div className="mt-4">
        <Navigation />
      </div>

      {/* Lista de Projetos */}
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Projetos</span>
          <button className="text-gray-600 hover:text-gray-900">
            <Plus size={16} />
          </button>
        </div>
        <ul className="mt-2">
          {projects.map((project, index) => (
            <li key={index} className="flex items-center bg-gray-200 p-2 rounded-md mt-1">
              <span className="text-xs font-medium">{project}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
