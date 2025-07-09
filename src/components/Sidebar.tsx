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
  Check, 
  ChevronDown, 
  LayoutGrid, 
  Users, 
  FolderPlus 
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
    <aside className="h-screen w-72 bg-white p-5 flex flex-col relative border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <Link href="/dashboard" className="text-2xl font-bold text-indigo-600 mb-8 flex items-center">
        <LayoutGrid size={24} className="mr-2" />
        TaskFlow
      </Link>

      {/* Espaço de Trabalho com Popover */}
      <div className="relative mb-6">
        <button
          ref={buttonRef}
          onClick={togglePopover}
          className="w-full flex justify-between items-center bg-indigo-50 hover:bg-indigo-100 px-4 py-3 rounded-xl transition-all duration-200 border border-indigo-100 hover:border-indigo-200"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
              <Users size={16} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                {mounted ? workspace : "Carregando..."}
              </p>
              <p className="text-xs text-gray-500">{membros} membro{membros !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <ChevronDown size={18} className="text-gray-500" />
        </button>

        {showPopover && mounted && (
          <div
            ref={popoverRef}
            className="absolute top-16 left-0 z-10 w-72 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Logado como</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 truncate">{email}</p>
                <Check size={16} className="text-indigo-600 flex-shrink-0 ml-2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">{funcao} • {membros} membro{membros !== 1 ? 's' : ''}</p>
            </div>

            <div className="p-2">
              <Link
                href="/dashboard/settings/general"
                className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-colors"
              >
                <Settings size={16} className="text-gray-500 mr-3" />
                Configurações
              </Link>

              <Link
                href="/dashboard/settings/members"
                className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-colors"
              >
                <UserPlus size={16} className="text-gray-500 mr-3" />
                Convidar Membros
              </Link>

              <Link
                href="/create-workspace"
                className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={16} className="text-gray-500 mr-3" />
                Criar Espaço
              </Link>

              <button className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-colors">
                <Mail size={16} className="text-gray-500 mr-3" />
                Convites Recebidos
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl: `${window.location.origin}/`
                  })
                }
                className="flex items-center w-full text-sm text-red-500 hover:bg-red-50 px-3 py-2.5 rounded-lg transition-colors"
              >
                <LogOut size={16} className="mr-3" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <div className="mt-2">
        <Navigation />
      </div>

      {/* Lista de Projetos */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Meus Projetos</h3>
          <button className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <nav className="space-y-1">
          {projects.map((project, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 group transition-colors"
            >
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></span>
              <span className="truncate">{project}</span>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full">3</span>
            </a>
          ))}
          <button className="flex items-center w-full text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors group">
            <FolderPlus size={16} className="text-indigo-500 mr-3 group-hover:text-indigo-600" />
            Adicionar projeto
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
