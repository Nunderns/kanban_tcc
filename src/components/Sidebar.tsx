"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

import {
  Plus,
  Settings,
  UserPlus,
  Mail,
  LogOut,
  Check
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

export const Sidebar = () => {
  const [workspace, setWorkspace] = useState("Espaço de trabalho");
  const [email, setEmail] = useState("");
  const [funcao, setFuncao] = useState("");
  const [membros, setMembros] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const projects = ["Projeto 1", "Projeto 2"];

  const togglePopover = () => {
    setShowPopover((prev) => !prev);
  };

  useEffect(() => {
    async function fetchWorkspaceData() {
      try {
        const res = await fetch("/api/workspaces/current");
        if (res.ok) {
          const data = await res.json();
          setWorkspace(data.nome);
          setEmail(data.email);
          setFuncao(data.funcao);
          setMembros(data.membros);
          localStorage.setItem("workspaceSelecionado", JSON.stringify({ nome: data.nome }));
        }
      } catch (err) {
        console.error("Erro ao buscar workspace:", err);
      }
    }

    fetchWorkspaceData();
    setMounted(true);
  }, []);

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
    <aside className="h-screen w-64 bg-neutral-100 p-4 flex flex-col relative border-r border-gray-300">
      {/* Logo */}
      <Link href="/dashboard" className="text-lg font-semibold">
        TaskFlow
      </Link>

      {/* Espaço de Trabalho com Popover */}
      <div className="mt-4 relative">
        <button
          ref={buttonRef}
          onClick={togglePopover}
          className="w-full flex justify-between items-center bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          <span className="text-sm font-medium truncate">
            {mounted ? workspace : "Carregando..."}
          </span>
          <Plus size={16} />
        </button>

        {showPopover && mounted && (
          <div
            ref={popoverRef}
            className="absolute top-12 left-0 z-10 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
          >
            <p className="text-sm text-gray-600 mb-1">{email}</p>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800 truncate">{workspace}</p>
              <Check size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mb-3">{funcao} • {membros} Membro(s)</p>

            <div className="space-y-2">
              <Link
                href="/dashboard/settings/general"
                className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
              >
                <Settings size={16} className="mr-2" />
                Configurações
              </Link>

              <Link
                href="/dashboard/settings/members"
                className="flex items-center text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
              >
                <UserPlus size={16} className="mr-2" />
                Convidar Membros
              </Link>


              <Link
                href="/create-workspace"
                className="flex items-center text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
              >
                <Plus size={16} className="mr-2" />
                Criar Espaço
              </Link>

              <button className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md">
                <Mail size={16} className="mr-2" />
                Convites Recebidos
              </button>


<button
  onClick={() =>
    signOut({
      callbackUrl: `${window.location.origin}/`
    })
  }
  className="flex items-center w-full text-sm text-red-500 hover:bg-red-100 px-2 py-1 rounded-md"
>
  <LogOut size={16} className="mr-2" />
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
            <li
              key={index}
              className="flex items-center bg-gray-200 p-2 rounded-md mt-1"
            >
              <span className="text-xs font-medium">{project}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
