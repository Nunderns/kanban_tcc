"use client";

import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, X, ArrowLeft, Trash2, GripVertical } from "lucide-react";
// Using native HTML elements instead of shadcn/ui components

type ProjectState = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export default function ProjectStatesPage() {
  const pathname = usePathname();
  // Simple toast implementation
  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    // This is a simple implementation. In a real app, you might want to use a toast library.
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-md text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } z-50`;
    toast.innerHTML = `
      <h3 class="font-bold">${title}</h3>
      <p class="text-sm">${message}</p>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };
  const [states, setStates] = useState<ProjectState[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragItemRef = useRef<HTMLElement | null>(null);
  const [newStateName, setNewStateName] = useState("");
  const [newStateColor, setNewStateColor] = useState("#3b82f6"); // blue-500
  const [isLoading, setIsLoading] = useState(true);

  // Cores padrão para os estados
  const defaultColors = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
  ];

  useEffect(() => {
    // Simular carregamento de estados existentes
    const fetchStates = async () => {
      try {
        // TODO: Substituir por chamada à API real
        setTimeout(() => {
          setStates([
            { id: '1', name: 'Backlog', color: '#8b5cf6', order: 0 },
            { id: '2', name: 'To Do', color: '#3b82f6', order: 1 },
            { id: '3', name: 'In Progress', color: '#f59e0b', order: 2 },
            { id: '4', name: 'In Review', color: '#ec4899', order: 3 },
            { id: '5', name: 'Done', color: '#10b981', order: 4 },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        setIsLoading(false);
      }
    };

    fetchStates();
  }, []);

  const handleAddState = () => {
    if (!newStateName.trim()) {
      showToast("Erro", "Por favor, insira um nome para o estado.", 'error');
      return;
    }

    const newState: ProjectState = {
      id: Date.now().toString(),
      name: newStateName,
      color: newStateColor,
      order: states.length,
    };

    setStates([...states, newState]);
    setNewStateName("");
    setNewStateColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
    
    showToast("Estado adicionado", `O estado "${newState.name}" foi criado com sucesso.`);
  };

  const handleRemoveState = (id: string) => {
    const stateToRemove = states.find(state => state.id === id);
    if (stateToRemove) {
      setStates(states.filter(state => state.id !== id));
      
      showToast("Estado removido", `O estado "${stateToRemove.name}" foi removido.`);
    }
  };

  const handleUpdateState = (id: string, updates: Partial<ProjectState>) => {
    setStates(states.map(state => 
      state.id === id ? { ...state, ...updates } : state
    ));
  };

  // Funções para o drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedItem(index);
    setIsDragging(true);
    dragItemRef.current = e.currentTarget;
    
    // Adiciona classes para feedback visual durante o arrasto
    const target = e.currentTarget;
    target.style.transition = 'none';
    target.style.transform = 'scale(1.02) rotate(1deg)';
    target.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    target.style.zIndex = '10';
    
    // Força o navegador a renderizar o elemento em uma nova camada para melhor performance
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    target.offsetHeight;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLElement>) => {
    const target = e.currentTarget;
    target.style.transform = '';
    target.style.boxShadow = '';
    target.style.zIndex = '';
    target.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    
    // Remove as classes de feedback visual após a animação
    setTimeout(() => {
      target.style.transition = '';
      if (dragItemRef.current) {
        dragItemRef.current.style.transform = '';
        dragItemRef.current.style.boxShadow = '';
        dragItemRef.current.style.zIndex = '';
      }
    }, 200);
    
    setDraggedItem(null);
    setIsDragging(false);
    dragItemRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    // Reorganiza os itens
    const newItems = [...states];
    const [movedItem] = newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, movedItem);
    
    // Atualiza a ordem dos itens
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx
    }));
    
    setStates(reorderedItems);
    setDraggedItem(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    // Remove a classe de feedback visual
    (e.target as HTMLElement).classList.remove('border-blue-500', 'border-2');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.add('border-blue-500', 'border-2');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('border-blue-500', 'border-2');
  };

  const handleSaveChanges = async () => {
    try {
      // TODO: Implementar chamada à API para salvar as alterações
      console.log('Estados a serem salvos:', states);
      
      showToast("Alterações salvas", "As configurações dos estados foram atualizadas com sucesso.");
    } catch (error) {
      console.error('Erro ao salvar estados:', error);
      showToast("Erro", "Ocorreu um erro ao salvar as alterações. Tente novamente.", 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1">
        <aside className="w-64 bg-white p-6 border-r border-gray-300 text-gray-800">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">Configurações</h2>
          <ul className="space-y-2 text-sm">
            {[
              { href: "general", label: "Geral" },
              { href: "members", label: "Membros" },
              { href: "project-states", label: "Estados do Projeto" },
              { href: "billing-and-plans", label: "Faturamento e Planos" },
              { href: "integrations", label: "Integrações" },
              { href: "imports", label: "Importações" },
              { href: "exports", label: "Exportações" },
              { href: "webhooks", label: "Webhooks" },
              { href: "api-tokens", label: "Tokens de API" },
              { href: "worklogs", label: "Registros de Trabalho" },
              { href: "teamspaces", label: "Espaços de Equipe" },
              { href: "initiatives", label: "Iniciativas" },
              { href: "clients", label: "Clientes" },
              { href: "templates", label: "Modelos" }
            ].map((item) => (
              <li key={item.href}>
                <Link 
                  href={`/dashboard/settings/${item.href}`}
                  className={`block px-3 py-2 rounded-md ${
                    pathname?.endsWith(item.href) 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Estados do Projeto</h1>
                <p className="text-sm text-gray-600">
                  Gerencie os estados dos itens do seu projeto (ex: To Do, In Progress, Done)
                </p>
              </div>
              <button 
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Salvar alterações
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="font-medium mb-3">Adicionar novo estado</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nome do estado (ex: Em Análise)"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    className="max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newStateColor}
                      onChange={(e) => setNewStateColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                  <button 
                    onClick={handleAddState}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>

              <div>
                <h2 className="font-medium mb-3">Estados do projeto</h2>
                <div className="space-y-2">
                  {states.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum estado configurado ainda.</p>
                  ) : (
                    <ul className="space-y-2">
                      {states.map((state, index) => (
                        <li 
                          key={state.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          onDrop={handleDrop}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          className={`flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200 transition-all duration-200 ${draggedItem === index ? 'shadow-lg scale-105 z-10' : 'hover:shadow-md hover:border-gray-300'}`}
                          style={{
                            transform: draggedItem === index ? 'scale(1.05) rotate(1deg)' : '',
                            boxShadow: draggedItem === index ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '',
                            zIndex: draggedItem === index ? 10 : 'auto',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: isDragging ? 'grabbing' : 'grab'
                          }}
                        >
                          <div 
                            className={`p-1 text-gray-400 hover:text-gray-600 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            title="Arrastar para reordenar"
                            draggable
                            onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                              e.stopPropagation();
                              handleDragStart(e as unknown as React.DragEvent<HTMLElement>, index);
                            }}
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <div 
                            className="h-4 w-4 rounded-full" 
                            style={{ backgroundColor: state.color }}
                          />
                          <input
                            type="text"
                            value={state.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              handleUpdateState(state.id, { name: e.target.value })
                            }
                            className="border-0 bg-transparent p-0 focus:outline-none focus:ring-0 w-full"
                          />
                          <div className="ml-auto flex items-center gap-2">
                            <input
                              type="color"
                              value={state.color}
                              onChange={(e) => 
                                handleUpdateState(state.id, { color: e.target.value })
                              }
                              className="w-6 h-6 rounded cursor-pointer"
                            />
                            <button
                              onClick={() => handleRemoveState(state.id)}
                              disabled={states.length <= 1}
                              title={states.length <= 1 ? "Você precisa ter pelo menos um estado" : "Remover estado"}
                              className={`p-1 rounded-md ${
                                states.length <= 1 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
