"use client";

import { useState } from "react";
import { X, Plus, Palette, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

export function AddProjectModal({ isOpen, onClose, onProjectAdded }: AddProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const colors = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#ef4444", 
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError("O nome do projeto é obrigatório");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description: description.trim() || null,
          color,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar o projeto");
      }

      const newProject = await response.json();
      onProjectAdded();
      onClose();
      
      setProjectName("");
      setDescription("");
      setColor("#3b82f6");
      
      router.push(`/projects/${newProject.id}`);
    } catch (err) {
      setError("Ocorreu um erro ao criar o projeto. Tente novamente.");
      console.error("Error creating project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Novo Projeto
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Projeto *
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Meu Projeto Incrível"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Descreva seu projeto..."
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cor
            </label>
            <div className="flex items-center space-x-2">
              <Palette size={18} className="text-gray-500" />
              <div className="flex space-x-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Selecionar cor ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !projectName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus size={16} className="-ml-1 mr-2" />
                  Criar Projeto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;
