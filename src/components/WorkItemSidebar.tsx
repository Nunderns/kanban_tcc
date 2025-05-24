"use client";

import { useEffect, useState, useCallback, ChangeEvent } from "react";
import { FaTimes, FaSpinner, FaHistory } from "react-icons/fa"; // Import FaHistory
import { ptBR } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ActivityHistoryModal from "./ActivityHistoryModal";

// Assumindo uma definição básica para WorkItem, idealmente importada
interface WorkItem {
  id: number | string;
  title: string;
  description?: string | null;
  status: string; // Ex: 'TODO', 'IN_PROGRESS', 'DONE'
  assignees?: string[] | null;
  priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  creator?: string | null;
  startDate?: string | null; // Formato YYYY-MM-DD
  dueDate?: string | null; // Formato YYYY-MM-DD
  module?: string | null;
  cycle?: string | null;
  parentId?: number | string | null;
  labels?: string[] | null;
}

// Tipo para o log de atividades (simplificado)
interface ActivityLog {
  id?: number; // Adicionado para compatibilidade com TaskActivity
  user: string;
  action: string;
  field?: keyof WorkItem | string;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string; // Mantido como string para consistência interna, modal usará createdAt
  createdAt?: string; // Adicionado para compatibilidade com TaskActivity
}

interface Props {
  item: WorkItem;
  onClose: () => void;
  onUpdate: (updatedItem: WorkItem) => void;
  currentUser: string; // Adicionado para obter o usuário atual dinamicamente
}

// Componente auxiliar para exibir mensagens de erro ou sucesso (simples)
const FeedbackMessage: React.FC<{ message: string; type: 'error' | 'success' | 'loading' }> = ({ message, type }) => {
  const baseClasses = "text-sm p-2 rounded mb-4";
  const typeClasses = {
    error: "bg-red-100 text-red-700",
    success: "bg-green-100 text-green-700",
    loading: "bg-blue-100 text-blue-700 flex items-center",
  };
  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {type === 'loading' && <FaSpinner className="animate-spin mr-2" />} {message}
    </div>
  );
};

export default function WorkItemSidebarImproved({ item, onClose, onUpdate, currentUser }: Props) {
  const [localItem, setLocalItem] = useState<WorkItem>(item);
  const [activities, setActivities] = useState<ActivityLog[]>([]); // Mantém a lista curta de atividades recentes
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // Estado para o modal

  // --- Funções de API --- 

  // Fetch para a lista curta exibida na sidebar (pode ser otimizado para buscar menos itens)
  const fetchRecentActivities = useCallback(async () => {
    setIsLoadingActivities(true);
    // Não limpar erro geral aqui, pois é para a lista curta
    try {
      // Idealmente, a API suportaria um limite, ex: /api/tasks/${item.id}/activities?limit=5
      const res = await fetch(`/api/tasks/${item.id}/activities`); 
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Pega apenas as 5 mais recentes para a sidebar
      const recentData = (data as ActivityLog[])
        .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
        .slice(0, 5);
      setActivities(recentData);
    } catch (err) {
      console.error("Erro ao buscar atividades recentes:", err);
      // Não definir erro geral aqui para não poluir a UI principal por falha na lista curta
      setActivities([]); 
    } finally {
      setIsLoadingActivities(false);
    }
  }, [item.id]);

  const logActivity = async (field: keyof WorkItem, oldValue: any, newValue: any) => {
    const formatValue = (value: any): string => {
      if (Array.isArray(value)) return value.join(", ");
      return String(value ?? "");
    };

    const payload: Partial<ActivityLog> = {
      user: currentUser,
      action: "atualizou o campo",
      field,
      oldValue: formatValue(oldValue),
      newValue: formatValue(newValue),
      timestamp: new Date().toISOString(), // Mantém timestamp para consistência interna se necessário
    };

    try {
      const res = await fetch(`/api/tasks/${item.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      // Atualiza a lista de atividades recentes após o log
      fetchRecentActivities(); 
    } catch (err) {
      console.error("Erro ao registrar atividade:", err);
      setError("Falha ao registrar a atividade. As alterações foram salvas."); // Informa sobre o log
    }
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(null);

  const changes: Partial<WorkItem> = {};

  (Object.keys(localItem) as Array<keyof WorkItem>).forEach(key => {
    const originalValue = JSON.stringify(item[key]);
    const currentValue = JSON.stringify(localItem[key]);

    if (originalValue !== currentValue) {
      const value = localItem[key];

      // PRIORITY — apenas valores válidos
      if (key === "priority" && (value === "NONE" || value === "LOW" || value === "MEDIUM" || value === "HIGH")) {
        changes[key] = value;
      }

      // ASSIGNEES ou LABELS — array de strings ou null
      else if ((key === "assignees" || key === "labels") && (Array.isArray(value) || value === null)) {
        changes[key] = value;
      }

      // CAMPOS SIMPLES — string | number | null | undefined
      else if (
        key !== "priority" &&
        key !== "assignees" &&
        key !== "labels" &&
        (typeof value === "string" || typeof value === "number" || value === null || value === undefined)
      ) {
        changes[key] = value as any;
      }
    }
  });

    if (Object.keys(changes).length === 0) {
      setIsSaving(false);
      setSaveSuccess("Nenhuma alteração para salvar.");
      setTimeout(() => setSaveSuccess(null), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/work-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updatedItem = await res.json();

      // Logar atividades APÓS o PATCH bem-sucedido
      const logPromises = Object.keys(changes).map(key => 
        logActivity(key as keyof WorkItem, item[key as keyof WorkItem], changes[key as keyof WorkItem])
      );
      await Promise.all(logPromises); // Espera todos os logs terminarem (sem falhar o save principal)

      onUpdate(updatedItem);
      setLocalItem(updatedItem); // Sincroniza estado local
      setSaveSuccess("Tarefa atualizada com sucesso!");
      setTimeout(() => setSaveSuccess(null), 3000);

    } catch (err: any) {
      console.error("Erro ao salvar alterações:", err);
      setError(err.message || "Falha ao salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Use Effects --- 

  useEffect(() => {
    fetchRecentActivities(); // Busca atividades recentes ao montar/atualizar ID
  }, [fetchRecentActivities]);

  useEffect(() => {
    setLocalItem(item); // Atualiza estado local se o item externo mudar
  }, [item]);

  // --- Handlers --- 

  const handleChange = (
    field: keyof WorkItem,
    value: string | string[] | null | undefined | Date
  ) => {
    setError(null);
    setSaveSuccess(null);
    let processedValue = value;
    if (value instanceof Date) {
      processedValue = value.toISOString().split("T")[0];
    }
    if ((field === 'assignees' || field === 'labels') && typeof value === 'string') {
      processedValue = value.split(',').map(s => s.trim()).filter(Boolean);
    }
    setLocalItem(prev => ({ ...prev, [field]: processedValue }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof WorkItem, value);
  };

  const handleDateChange = (field: 'startDate' | 'dueDate', date: Date | null) => {
    handleChange(field, date);
  };

  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
  };

  // --- Renderização --- 

  return (
    <>
      <aside className="w-full max-w-md bg-white text-gray-800 border-l border-gray-200 p-6 overflow-y-auto h-screen fixed right-0 top-0 z-40 shadow-xl flex flex-col">
        {/* Cabeçalho */} 
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">PRIME-{item.id}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100" 
            aria-label="Fechar painel"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Mensagens de Feedback */} 
        {isSaving && <FeedbackMessage message="Salvando alterações..." type="loading" />} 
        {error && <FeedbackMessage message={error} type="error" />} 
        {saveSuccess && <FeedbackMessage message={saveSuccess} type="success" />} 

        {/* Conteúdo Principal (Scrollable) */} 
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-5 mb-4 custom-scrollbar"> 
          {/* Título */} 
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">Título</label>
            <input
              id="title"
              name="title"
              value={localItem.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
              placeholder="Título da tarefa"
            />
          </div>

          {/* Descrição */} 
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={localItem.description || ""}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm min-h-[80px]"
              placeholder="Adicione uma descrição detalhada..."
              rows={3}
            />
          </div>

          {/* Campos em Grid */} 
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {/* ... (outros campos como Status, Prioridade, etc. - sem alterações) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Status</label>
              <p className="text-gray-900 font-medium capitalize mt-1 bg-gray-100 p-2 rounded-md border border-gray-200">{localItem.status.replace("_", " ")}</p>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-600">Prioridade</label>
              <select id="priority" name="priority" value={localItem.priority} onChange={handleInputChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm bg-white">
                <option value="NONE">Nenhuma</option> <option value="LOW">Baixa</option> <option value="MEDIUM">Média</option> <option value="HIGH">Alta</option>
              </select>
            </div>
            <div>
              <label htmlFor="assignees" className="block text-sm font-medium text-gray-600">Responsáveis</label>
              <input id="assignees" name="assignees" value={localItem.assignees?.join(", ") || ""} onChange={handleInputChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm" placeholder="user1, user2" />
              <p className="text-xs text-gray-500 mt-1">Separados por vírgula</p>
            </div>
            <div>
              <label htmlFor="labels" className="block text-sm font-medium text-gray-600">Etiquetas</label>
              <input id="labels" name="labels" value={localItem.labels?.join(", ") || ""} onChange={handleInputChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm" placeholder="bug, feature" />
              <p className="text-xs text-gray-500 mt-1">Separadas por vírgula</p>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-600">Data de Início</label>
              <DatePicker id="startDate" selected={localItem.startDate ? new Date(localItem.startDate + 'T00:00:00') : null} onChange={(date) => handleDateChange("startDate", date)} locale={ptBR} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm bg-white" dateFormat="dd/MM/yyyy" placeholderText="DD/MM/AAAA" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-600">Data de Entrega</label>
              <DatePicker id="dueDate" selected={localItem.dueDate ? new Date(localItem.dueDate + 'T00:00:00') : null} onChange={(date) => handleDateChange("dueDate", date)} locale={ptBR} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm bg-white" dateFormat="dd/MM/yyyy" placeholderText="DD/MM/AAAA" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="module" className="block text-sm font-medium text-gray-600">Módulo</label>
              <input id="module" name="module" value={localItem.module || ""} onChange={handleInputChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm" placeholder="Sem módulo" />
            </div>
            <div>
              <label htmlFor="cycle" className="block text-sm font-medium text-gray-600">Ciclo</label>
              <input id="cycle" name="cycle" value={localItem.cycle || ""} onChange={handleInputChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm" placeholder="Sem ciclo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Criado por</label>
              <p className="text-gray-900 font-medium mt-1 bg-gray-100 p-2 rounded-md border border-gray-200">{item.creator || currentUser}</p> 
            </div>
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-600">Item pai</label>
              <input id="parentId" name="parentId" value={localItem.parentId || ""} onChange={handleInputChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed shadow-sm" placeholder="Adicionar item pai" disabled />
            </div>
          </div>

          {/* Atividades Recentes e Botão para Histórico Completo */} 
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-600">Atividades Recentes</h3>
              <button 
                onClick={toggleHistoryModal} 
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
              >
                <FaHistory className="mr-1" /> Ver Histórico Completo
              </button>
            </div>
            {isLoadingActivities ? (
              <div className="flex items-center text-gray-500 text-xs">
                <FaSpinner className="animate-spin mr-2" /> Carregando...
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhuma atividade registrada.</p>
            ) : (
              <ul className="text-xs text-gray-600 space-y-1.5">
                {activities.map((activity, index) => (
                  <li key={index} className="border-b border-gray-100 pb-1 last:border-b-0">
                    <span className="font-medium">{activity.user || 'Sistema'}</span> {activity.action} 
                    {activity.field && <span className="font-semibold"> &quot;{activity.field}&quot</span>}
                    {/* Simplificado para a lista curta */} 
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Rodapé Fixo */} 
        <div className="pt-4 border-t border-gray-200 mt-auto">
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-semibold transition-colors flex items-center justify-center shadow-sm"
          >
            {isSaving && <FaSpinner className="animate-spin mr-2" />} 
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </aside>

      {/* Renderiza o Modal de Histórico */} 
      <ActivityHistoryModal 
        taskId={item.id} 
        isOpen={isHistoryModalOpen} 
        onClose={toggleHistoryModal} 
      />
    </>
  );
}

// Adiciona um estilo básico para a scrollbar (opcional)
const style = document.createElement('style');
style.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;
document.head.append(style);

