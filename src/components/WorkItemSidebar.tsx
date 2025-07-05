"use client";

import { useEffect, useState, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FormattedDateInput } from "./FormattedDateInput";
import type { WorkItem } from "@/app/dashboard/my-tasks/page";
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
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
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
        const errorData = await updateResponse.json().catch(() => ({}));
        console.error('Update failed with status:', updateResponse.status, 'Details:', errorData);
        throw new Error(errorData.error || 'Failed to update task');
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
    <aside className="w-[450px] bg-white text-gray-900 border-l border-gray-200 p-6 overflow-y-auto h-screen fixed right-0 top-0 z-50 shadow-xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">#PRIME-{item.id}</span>
        </h2>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Fechar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6">
        <input
          value={localItem.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full text-xl font-semibold p-2 border-0 border-b-2 border-transparent focus:border-blue-500 focus:ring-0 bg-transparent hover:bg-gray-50 rounded transition-colors"
          placeholder="Título da tarefa"
        />
        <p className="text-xs text-gray-500 mt-1 px-2 flex items-center">
          <UserCircleIcon className="h-4 w-4 mr-1" />
          Criado por {item.creator || "henri.okayama"}
        </p>
      </div>

      <div className="space-y-4">

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              {getStatusIcon(localItem.status)}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500">Status</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[localItem.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                  {localItem.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500">Responsáveis</p>
              <input
                value={Array.isArray(localItem.assignees) ? localItem.assignees.join(", ") : localItem.assignees || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const assigneesArray = value 
                    ? value.split(',').map(s => s.trim()).filter(Boolean)
                    : [];
                  handleChange("assignees", assigneesArray);
                }}
                className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent"
                placeholder="Adicionar responsáveis (separados por vírgula)"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              {getPriorityIcon(localItem.priority)}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500">Prioridade</p>
              <select
                value={localItem.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent"
              >
                <option value="NONE">Nenhuma</option>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Data de Início</p>
                <FormattedDateInput
                  value={localItem.startDate || ''}
                  onChange={(value) => handleChange("startDate", value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent"
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Data de Entrega</p>
                <FormattedDateInput
                  value={localItem.dueDate || ''}
                  onChange={(value) => handleChange("dueDate", value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent"
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CubeIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Módulo</p>
                <input
                  value={localItem.module || ""}
                  onChange={(e) => handleChange("module", e.target.value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent"
                  placeholder="Sem módulo"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <ArrowsPointingOutIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Ciclo</p>
                <input
                  value={localItem.cycle || ""}
                  onChange={(e) => handleChange("cycle", e.target.value)}
                  className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent"
                  placeholder="Sem ciclo"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TagIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500">Etiquetas</p>
              <input
                value={localItem.labels?.join(", ") || ""}
                onChange={(e) => handleChange("labels", e.target.value.split(", "))}
                className="w-full p-1.5 text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 bg-transparent"
                placeholder="Adicione etiquetas separadas por vírgula"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ListBulletIcon className="h-5 w-5 text-gray-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-700">Atividades</h3>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Nenhuma atividade registrada</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-100 shadow-xs">
                  <div className="mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-xs text-gray-700">
                    {formatActivity(activity)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleUpdateClick}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </aside>
  );
}
