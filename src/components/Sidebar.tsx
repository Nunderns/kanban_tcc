"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export const Sidebar = () => {
  const [workspace, setWorkspace] = useState("Nome do espaço de trabalho");
  const [showPopover, setShowPopover] = useState(false);
  const projects = ["Projeto 1", "Projeto 2"];

  const togglePopover = () => {
    setShowPopover(!showPopover);
  };

  const handleWorkspaceChange = () => {
    const newName = prompt("Digite o novo nome do espaço de trabalho:");
    if (newName) {
      setWorkspace(newName);
    }
  };

  return (
    <aside className="h-screen w-64 bg-neutral-100 p-4 flex flex-col relative border-r border-gray-300">
      {/* Logo */}
      <Link href="/dashboard" className="text-lg font-semibold">
        TaskPulse
      </Link>

      {/* Espaço de Trabalho com Popover */}
      <div className="mt-4 relative">
        <button
          onClick={togglePopover}
          className="w-full flex justify-between items-center bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          <span className="text-sm font-medium">{workspace}</span>
          <Plus size={16} />
        </button>

        {showPopover && (
          <div className="absolute top-12 left-0 z-10 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-600 mb-1">henri.okayama@gmail.com</p>
            <p className="font-semibold text-gray-800">{workspace}</p>
            <p className="text-xs text-gray-500 mb-2">Admin • 1 Membro</p>

            <div className="space-y-1">
              <button
                onClick={handleWorkspaceChange}
                className="text-left w-full text-sm text-blue-600 hover:underline"
              >
                Renomear Espaço
              </button>
              <Link href="dashboard/settings/members" className="text-left w-full text-sm text-blue-600 hover:underline">
                Convidar Membros
              </Link>
              <button className="text-left w-full text-sm text-gray-600 hover:underline">
                Criar Novo Espaço
              </button>
              <button className="text-left w-full text-sm text-red-500 hover:underline">
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
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
