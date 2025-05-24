"use client";

import { useEffect, useState, useCallback } from "react";
import { FaTimes, FaSpinner, FaHistory } from "react-icons/fa";

// Interface baseada no modelo Prisma TaskActivity
interface TaskActivity {
  id: number;
  taskId: number;
  user: string;
  action: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string; // ISO string date
}

interface Props {
  taskId: number | string;
  isOpen: boolean;
  onClose: () => void;
}

// Componente auxiliar para formatar a data
const formatDate = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

export default function ActivityHistoryModal({ taskId, isOpen, onClose }: Props) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!isOpen || !taskId) return; // Não busca se não estiver aberto ou sem ID

    setIsLoading(true);
    setError(null);
    setActivities([]); // Limpa atividades anteriores

    try {
      const res = await fetch(`/api/tasks/${taskId}/activities`);
      if (!res.ok) {
        throw new Error(`Erro na API: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      // Ordena as atividades pela data de criação, mais recentes primeiro
      const sortedData = (data as TaskActivity[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setActivities(sortedData);
        } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Erro ao buscar histórico de atividades:", err);
            setError(err.message || "Falha ao carregar o histórico de atividades.");
        } else {
            console.error("Erro desconhecido ao buscar atividades:", err);
            setError("Erro inesperado ao carregar o histórico.");
        }
        }
        finally {
      setIsLoading(false);
    }
  }, [taskId, isOpen]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]); // Depende de taskId e isOpen indiretamente via useCallback

  // Retorna null se o modal não estiver aberto para evitar renderização desnecessária
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out" 
      onClick={onClose} // Fecha ao clicar no overlay
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-history-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" 
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal feche-o
      >
        {/* Cabeçalho do Modal */} 
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 id="activity-history-title" className="text-lg font-semibold text-gray-700 flex items-center">
            <FaHistory className="mr-2 text-blue-600" />
            Histórico de Atividades (Tarefa PRIME-{taskId})
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100" 
            aria-label="Fechar modal"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Corpo do Modal (Scrollable) */} 
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <FaSpinner className="animate-spin text-blue-600 mr-3" size={24} />
              <span className="text-gray-600">Carregando histórico...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-center">
              {error}
            </div>
          )}

          {!isLoading && !error && activities.length === 0 && (
            <p className="text-gray-500 italic text-center py-10">Nenhuma atividade registrada para esta tarefa.</p>
          )}

          {!isLoading && !error && activities.length > 0 && (
            <ul className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start text-sm mb-1">
                    <span className="font-semibold text-gray-800">{activity.user || "Sistema"}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(activity.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {activity.action}
                    {activity.field && <span className="font-medium text-gray-700"> &quot;{activity.field}&quot</span>}
                    {activity.oldValue !== null && activity.oldValue !== undefined && (
                      <span className="text-gray-500"> de <code className="bg-gray-100 px-1 rounded text-xs">{activity.oldValue || "vazio"}</code></span>
                    )}
                    {activity.newValue !== null && activity.newValue !== undefined && (
                      <span className="text-gray-500"> para <code className="bg-gray-100 px-1 rounded text-xs">{activity.newValue || "vazio"}</code></span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Rodapé do Modal (Opcional) */} 
        <div className="p-4 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

