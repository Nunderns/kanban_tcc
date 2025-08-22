"use client";

import { useEffect, useState, useCallback } from "react";
import { FormattedDateInput } from "./FormattedDateInput";
import type { WorkItem } from "@/app/dashboard/my-tasks/page";
import { parseLocalDate } from "@/lib/utils";
import { 
  XMarkIcon, 
  UserCircleIcon, 
  TagIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  UserGroupIcon,
  FlagIcon,
  CubeIcon,
  ArrowsPointingOutIcon,
  ListBulletIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { statusColors, priorityColors } from "@/lib/constants";

interface Activity {
  id: string;
  taskId: string;
  user: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
}

interface Props {
  item: WorkItem;
  onClose: () => void;
  onUpdate: (updated: WorkItem) => void;
}

export default function WorkItemSidebar({ item, onClose, onUpdate }: Props) {
  const [localItem, setLocalItem] = useState(item);
  const [activities, setActivities] = useState<Activity[]>([]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'não definida';
    try {
      const date = parseLocalDate(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Mapeia os nomes dos campos para algo mais amigável
  const getFieldName = (field: string): string => {
    const fieldMap: Record<string, string> = {
      'startDate': 'data de início',
      'dueDate': 'prazo',
      'title': 'título',
      'description': 'descrição',
      'status': 'status',
      'priority': 'prioridade',
      'module': 'módulo',
      'cycle': 'ciclo',
      'assignees': 'responsáveis',
      'labels': 'etiquetas'
    };
    
    return fieldMap[field] || field;
  };

  const formatActivity = (activity: Activity): string => {
    const { user, action, field, oldValue, newValue, createdAt } = activity;
    const formattedDate = new Date(createdAt).toLocaleString('pt-BR');
    
    if (action === 'updated field') {
      const isDateField = field.toLowerCase().includes('date');
      const fieldName = getFieldName(field);
      
      // Formata valores antigos e novos
      const formatValue = (value: string) => {
        if (isDateField) return formatDate(value);
        if (!value) return 'não definido';
        return value;
      };
      
      const oldVal = formatValue(oldValue);
      const newVal = formatValue(newValue);
      
      return `${formattedDate} - ${user} alterou o campo ${fieldName} de "${oldVal}" para "${newVal}"`;
    }
    
    // Outras ações (criado, excluído, etc)
    const actionMap: Record<string, string> = {
      'created': 'criou a tarefa',
      'deleted': 'excluiu a tarefa',
      'assigned': 'atribuiu a tarefa',
      'commented': 'comentou na tarefa'
    };
    
    return `${formattedDate} - ${user} ${actionMap[action] || action}`;
  };

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${item.id}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    }
  }, [item.id]);

  // Update local state when item prop changes
  useEffect(() => {
    // Usando JSON.stringify para garantir uma comparação profunda
    if (JSON.stringify(item) !== JSON.stringify(localItem)) {
      console.log('Updating localItem from prop item:', item);
      setLocalItem({...item});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleChange = (field: keyof WorkItem, value: string | string[] | null | undefined) => {
    setLocalItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateClick = async () => {
    try {
      // Prepare the update data
      const updateData = { ...localItem };
      
      // Ensure assignees is an array
      if (updateData.assignees && typeof updateData.assignees === 'string') {
        updateData.assignees = (updateData.assignees as string)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      } else if (!updateData.assignees) {
        updateData.assignees = [];
      }
      
      // Update the task - include ID as query parameter
      const updateResponse = await fetch(`/api/tasks?id=${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        let errorData;
        try {
          const responseText = await updateResponse.text();
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = {};
        }
        
        console.error('Update failed with status:', updateResponse.status, 'Details:', errorData);
        
        // Create a more detailed error message
        const errorMessage = [
          `Failed to update task (Status: ${updateResponse.status})`,
          errorData.error && `Error: ${errorData.error}`,
          errorData.details?.message && `Details: ${errorData.details.message}`
        ].filter(Boolean).join(' - ');
        
        throw new Error(errorMessage || 'Failed to update task');
      }

      // Log activity for changed fields
      const changedFields = Object.keys(localItem).filter(
        key => JSON.stringify(localItem[key as keyof WorkItem]) !== JSON.stringify(item[key as keyof WorkItem])
      );

      // Create activity log for each changed field
      await Promise.all(changedFields.map(async (field) => {
        const oldValue = item[field as keyof WorkItem];
        const newValue = localItem[field as keyof WorkItem];
        
        await fetch(`/api/tasks/${item.id}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: "henri.okayama",
            action: "updated field",
            field,
            oldValue: Array.isArray(oldValue) ? oldValue.join(", ") : (oldValue?.toString() || ""),
            newValue: Array.isArray(newValue) ? newValue.join(", ") : (newValue?.toString() || "")
          })
        });
      }));

      // Refresh activities and update parent
      await fetchActivities();
      onUpdate(localItem);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      // Optionally show error message to user
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <ListBulletIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    const color = priorityColors[priority as keyof typeof priorityColors] || 'gray';
    return <FlagIcon className={`h-5 w-5 text-${color}-500`} />;
  };

  return (
    <aside className="w-[450px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto h-screen fixed right-0 top-0 z-50 shadow-xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">#PRIME-{item.id}</span>
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="mb-6">
        <input
          value={localItem.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full text-2xl font-bold border-0 border-b border-transparent focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 p-0 bg-transparent text-gray-900 dark:text-white"
          placeholder="Título da tarefa"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PRIME-{localItem.id}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <UserCircleIcon className="h-4 w-4 mr-1" />
          Criado por {item.creator || "henri.okayama"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              {getStatusIcon(localItem.status)}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
              <select
                value={localItem.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">A Fazer</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="DONE">Concluído</option>
              </select>
            </div>
          </div>
        </div>

        {/* Priority Section */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            {getPriorityIcon(localItem.priority)}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Prioridade</p>
            <select
              value={localItem.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
            >
              <option value="NONE">Nenhuma</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>
        </div>

        {/* Date Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Data de Início</p>
                <FormattedDateInput
                  value={localItem.startDate || ''}
                  onChange={(value) => handleChange("startDate", value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <ClockIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Data de Entrega</p>
                <FormattedDateInput
                  value={localItem.dueDate || ''}
                  onChange={(value) => handleChange("dueDate", value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Module and Cycle Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <CubeIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Módulo</p>
                <input
                  value={localItem.module || ""}
                  onChange={(e) => handleChange("module", e.target.value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                  placeholder="Sem módulo"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <ArrowsPointingOutIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ciclo</p>
                <input
                  value={localItem.cycle || ""}
                  onChange={(e) => handleChange("cycle", e.target.value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                  placeholder="Sem ciclo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Labels Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <TagIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Etiquetas</p>
              <input
                value={localItem.labels?.join(", ") || ""}
                onChange={(e) => handleChange("labels", e.target.value.split(", "))}
                className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                placeholder="Adicione etiquetas separadas por vírgula"
              />
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
              <ListBulletIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Atividades</h3>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhuma atividade registrada</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-100 dark:border-gray-500 shadow-xs">
                  <div className="mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    {formatActivity(activity)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleUpdateClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <CheckCircleIcon className="h-5 w-5" />
          Salvar Alterações
        </button>
      </div>
    </aside>
  );
}
