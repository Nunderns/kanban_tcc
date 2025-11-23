"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";

const formatUserName = (username: string): string => {
  if (!username) return 'Usuário';
  
  const namePart = username.split('@')[0];
  const withSpaces = namePart.replace(/[._-]/g, ' ');
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
import { FormattedDateInput } from "./FormattedDateInput";
import type { WorkItem } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";
import { parseLocalDate } from "@/lib/utils";
import { 
  XMarkIcon, 
  UserCircleIcon, 
  TagIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  FlagIcon,
  CubeIcon,
  ArrowsPointingOutIcon,
  ListBulletIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  BellSlashIcon,
  Cog6ToothIcon,
  SquaresPlusIcon,
  ArrowsRightLeftIcon,
  LinkIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { priorityColors } from "@/lib/constants";

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

interface WorkspaceMember {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  role: string;
}

interface Props {
  item: WorkItem;
  onClose: () => void;
  onUpdate: (updated: WorkItem) => void;
  workspaceSlug?: string;
  variant?: "sidebar" | "fullscreen";
  fullScreenHref?: string;
  sidebarHref?: string;
}

export default function WorkItemSidebar({ item, onClose, onUpdate, workspaceSlug, variant = "sidebar", fullScreenHref, sidebarHref }: Props) {
  const [localItem, setLocalItem] = useState(item);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [comment, setComment] = useState("");

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

    if (field === 'assignedUserName') {
      return '';
      }
    if (action === 'updated field') {
      const isDateField = field.toLowerCase().includes('date');
      const fieldName = getFieldName(field);
      if (field === 'assignedUserId') {
        if (newValue && (!oldValue || oldValue === 'null' || oldValue === 'undefined')) {
          const assignedUser = workspaceMembers.find(member => member.id === newValue);
          const userName = assignedUser?.displayName || assignedUser?.fullName || 'um usuário';
          return `${formattedDate} - ${user} atribuiu a tarefa para ${userName}`;
        } else if (!newValue || newValue === 'null' || newValue === 'undefined') {
          const previousUser = workspaceMembers.find(member => member.id === oldValue);
          const userName = previousUser?.displayName || previousUser?.fullName || 'um usuário';
          return `${formattedDate} - ${user} removeu a atribuição de ${userName}`;
        } else {
          const oldUser = workspaceMembers.find(member => member.id === oldValue);
          const newUser = workspaceMembers.find(member => member.id === newValue);
          const oldUserName = oldUser?.displayName || oldUser?.fullName || 'um usuário';
          const newUserName = newUser?.displayName || newUser?.fullName || 'um usuário';
          return `${formattedDate} - ${user} transferiu a tarefa de ${oldUserName} para ${newUserName}`;
        }
      }
      
      const formatValue = (value: string) => {
        if (isDateField) return formatDate(value);
        if (!value || value === 'null' || value === 'undefined') return 'não definido';
        return value;
      };
      
      const oldVal = formatValue(oldValue);
      const newVal = formatValue(newValue);
      
      if (field === 'assignedUserId') return '';
      
      return `${formattedDate} - ${user} alterou o campo ${fieldName} de "${oldVal}" para "${newVal}"`;
    }
    
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

  const fetchWorkspaceMembers = useCallback(async () => {
    if (!workspaceSlug) return;
    
    try {
      setLoadingMembers(true);
      const response = await fetch(`/api/workspaces/${workspaceSlug}/members`);
      if (response.ok) {
        const data = await response.json();
        setWorkspaceMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching workspace members:', error);
    } finally {
      setLoadingMembers(false);
    }
  }, [workspaceSlug]);
  const prevItemRef = useRef<WorkItem | undefined>(undefined);
  const actionButtons = [
    { label: "Adicionar sub-item de trabalho", icon: SquaresPlusIcon },
    { label: "Adicionar relação", icon: ArrowsRightLeftIcon },
    { label: "Adicionar link", icon: LinkIcon },
    { label: "Anexar", icon: PaperClipIcon }
  ];
  
  useEffect(() => {
    if (JSON.stringify(prevItemRef.current) !== JSON.stringify(item)) {
      setLocalItem(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(item)) {
          return { ...item };
        }
        return prev;
      });
    }
    
    prevItemRef.current = item;
  }, [item]);

  useEffect(() => {
    fetchActivities();
    fetchWorkspaceMembers();
  }, [fetchActivities, fetchWorkspaceMembers, item.id]);

  const handleChange = (field: keyof WorkItem, value: string | string[] | null | undefined) => {
    setLocalItem(prev => {
      const updatedItem = {
        ...prev,
        [field]: value
      };

      if (field === 'assignedUserId' && typeof value === 'string') {
        const assignedUser = workspaceMembers.find(member => member.id === value);
        if (assignedUser) {
          updatedItem.assignedUserName = assignedUser.displayName || assignedUser.fullName || '';
        } else {
          updatedItem.assignedUserName = '';
        }
      }

      return updatedItem;
    });
  };

  const handleUpdateClick = async () => {
    try {
      const updateData = { ...localItem };
      
      if (updateData.assignees && typeof updateData.assignees === 'string') {
        updateData.assignees = (updateData.assignees as string)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      } else if (!updateData.assignees) {
        updateData.assignees = [];
      }
      
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
        
        const errorMessage = [
          `Failed to update task (Status: ${updateResponse.status})`,
          errorData.error && `Error: ${errorData.error}`,
          errorData.details?.message && `Details: ${errorData.details.message}`
        ].filter(Boolean).join(' - ');
        
        throw new Error(errorMessage || 'Failed to update task');
      }

      const changedFields = Object.keys(localItem).filter(
        key => JSON.stringify(localItem[key as keyof WorkItem]) !== JSON.stringify(item[key as keyof WorkItem])
      );
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

      await fetchActivities();
      onUpdate(localItem);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
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

  const isFullScreen = variant === "fullscreen";
  const numericTaskId = String(localItem.id).replace(/^PRIME-/i, "");
  const friendlyTaskId = String(localItem.id).toUpperCase().startsWith("PRIME-")
    ? String(localItem.id)
    : `PRIME-${localItem.id}`;
  const resolvedFullScreenHref = fullScreenHref ?? (workspaceSlug ? `/${workspaceSlug}/work-items/${friendlyTaskId}` : undefined);
  const resolvedSidebarHref = sidebarHref ?? (workspaceSlug ? `/${workspaceSlug}/dashboard/my-tasks?task=${numericTaskId}` : undefined);

  const containerClasses = isFullScreen
    ? "min-h-screen w-full bg-gray-50 dark:bg-[#05060a] flex justify-center px-4 sm:px-6 py-6"
    : "fixed inset-0 z-50 flex justify-center sm:justify-end bg-black/40 dark:bg-black/70 px-4 py-6";
  const panelClasses = `${isFullScreen ? "w-full max-w-5xl" : "h-full w-full max-w-full sm:w-[90%] md:w-2/3 lg:w-1/2"} bg-white dark:bg-[#0d0f14] text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-screen`;

  return (
    <div className={containerClasses}>
      <aside className={panelClasses}>
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-white/5 p-4 sm:p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 dark:text-white/60">{localItem.id.startsWith('PRIME-') ? localItem.id : `PRIME-${localItem.id}`}</p>
              <input
                value={localItem.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="mt-3 w-full bg-transparent text-2xl font-semibold leading-tight text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none sm:text-3xl"
                placeholder="Título da tarefa"
              />
            </div>
            <textarea
              value={localItem.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Adicione uma descrição muito bem feita"
              className="w-full resize-none rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.02] px-4 py-3 text-sm text-gray-700 dark:text-white/80 placeholder-gray-500 dark:placeholder-white/40 focus:border-gray-400 dark:focus:border-white/40 focus:outline-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4 text-gray-500 dark:text-white/50" />
              Criado por {formatUserName(item.creator || "henri.okayama")}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            {!isFullScreen && resolvedFullScreenHref && (
              <Link
                href={resolvedFullScreenHref}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-white/20 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white transition hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Tela cheia
              </Link>
            )}
            {isFullScreen && resolvedSidebarHref && (
              <Link
                href={resolvedSidebarHref}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-white/20 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white transition hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Ver no dashboard
              </Link>
            )}
            <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-white/20 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white transition hover:bg-gray-50 dark:hover:bg-white/10">
              <BellSlashIcon className="h-4 w-4 text-gray-600 dark:text-white/70" />
              Cancelar inscrição
            </button>
            {onClose && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className={`inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-white/10 ${
                  isFullScreen ? "px-4 py-2 text-sm" : "p-2"
                } text-gray-600 dark:text-white/70 transition hover:bg-gray-50 dark:hover:bg-white/10`}
                aria-label="Fechar"
              >
                {isFullScreen ? (
                  <span className="flex items-center gap-2">
                    <XMarkIcon className="h-4 w-4" />
                    Fechar
                  </span>
                ) : (
                  <XMarkIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/70 transition hover:border-gray-300 dark:hover:border-white/40">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            {actionButtons.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.02] px-4 py-2 text-sm text-gray-700 dark:text-white/80 transition hover:border-gray-300 dark:hover:border-white/40 hover:text-gray-900 dark:hover:text-white sm:w-auto"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
            <section className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4 sm:p-6">
              <div className="flex flex-col gap-2 border-b border-gray-200 dark:border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-600 dark:text-white/60">Propriedades</h3>
                <p className="text-xs text-gray-500 dark:text-white/40">Última edição por {formatUserName(item.creator || "henri.okayama")}</p>
              </div>

              <div className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Estado</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="rounded-full bg-gray-200 dark:bg-white/10 p-2">
                      {getStatusIcon(localItem.status)}
                    </div>
                    <select
                      value={localItem.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 text-sm text-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-white/40 focus:outline-none"
                    >
                      <option value="BACKLOG" className="bg-white dark:bg-[#0d0f14]">Backlog</option>
                      <option value="TODO" className="bg-white dark:bg-[#0d0f14]">A Fazer</option>
                      <option value="IN_PROGRESS" className="bg-white dark:bg-[#0d0f14]">Em Progresso</option>
                      <option value="DONE" className="bg-white dark:bg-[#0d0f14]">Concluído</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Responsáveis</p>
                  <div className="mt-3 relative">
                    <button
                      type="button"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/80 dark:hover:border-white/30"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <UserCircleIcon className="h-5 w-5 text-gray-500 dark:text-white/50" />
                        <span className="truncate">
                          {localItem.assignedUserId
                            ? formatUserName(
                                workspaceMembers.find((m) => m.id === localItem.assignedUserId)?.fullName ||
                                localItem.assignedUserName ||
                                'Usuário'
                              )
                            : 'Adicionar responsáveis'}
                        </span>
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-white/50" />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#11131a] shadow-2xl">
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleChange("assignedUserId", "");
                              setIsUserDropdownOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10"
                          >
                            <UserCircleIcon className="h-4 w-4 text-gray-400 dark:text-white/40" />
                            Nenhum responsável
                          </button>
                          {loadingMembers ? (
                            <div className="px-3 py-2 text-xs text-gray-500 dark:text-white/50">Carregando...</div>
                          ) : (
                            workspaceMembers.map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => {
                                  handleChange("assignedUserId", member.id);
                                  setIsUserDropdownOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10"
                              >
                                <UserCircleIcon className="h-5 w-5 text-gray-500 dark:text-white/50" />
                                <div className="flex min-w-0 flex-col">
                                  <p className="font-medium text-gray-900 dark:text-white truncate">{member.fullName}</p>
                                  <p className="text-xs text-gray-500 dark:text-white/50 truncate">{member.email}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Prioridade</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="rounded-full bg-gray-200 dark:bg-white/10 p-2">
                      {getPriorityIcon(localItem.priority)}
                    </div>
                    <select
                      value={localItem.priority}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 text-sm text-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-white/40 focus:outline-none"
                    >
                      <option value="NONE" className="bg-white dark:bg-[#0d0f14]">None</option>
                      <option value="LOW" className="bg-white dark:bg-[#0d0f14]">Low</option>
                      <option value="MEDIUM" className="bg-white dark:bg-[#0d0f14]">Medium</option>
                      <option value="HIGH" className="bg-white dark:bg-[#0d0f14]">High</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Criado por</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-white/80">
                    <UserCircleIcon className="h-5 w-5 text-emerald-400" />
                    {formatUserName(item.creator || "henri.okayama")}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Data de início</p>
                  <div className="mt-3 flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-white/60" />
                    <FormattedDateInput
                      value={localItem.startDate || ''}
                      onChange={(value) => handleChange("startDate", value)}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 text-sm text-gray-700 dark:text-white focus:border-gray-400 dark:focus:border-white/40 focus:outline-none"
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Data de vencimento</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-500 dark:text-white/60" />
                    <FormattedDateInput
                      value={localItem.dueDate || ''}
                      onChange={(value) => handleChange("dueDate", value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-500 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder-white/40"
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Módulos</p>
                  <div className="mt-3 flex items-center gap-3">
                    <CubeIcon className="h-5 w-5 text-gray-500 dark:text-white/60" />
                    <input
                      value={localItem.module || ""}
                      onChange={(e) => handleChange("module", e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder-white/40"
                      placeholder="Nenhum módulo"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Ciclo</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ArrowsPointingOutIcon className="h-5 w-5 text-gray-500 dark:text-white/60" />
                    <input
                      value={localItem.cycle || ""}
                      onChange={(e) => handleChange("cycle", e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder-white/40"
                      placeholder="Nenhum ciclo"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black/20 sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Etiquetas</p>
                  <div className="mt-3 flex items-center gap-3">
                    <TagIcon className="h-5 w-5 text-gray-500 dark:text-white/60" />
                    <input
                      value={localItem.labels?.join(", ") || ""}
                      onChange={(e) => handleChange("labels", e.target.value.split(/,\s*/))}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder-white/40"
                      placeholder="Selecionar etiqueta"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.02] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-600 dark:text-white/60">Atividade</h3>
                <button className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:border-gray-400 dark:border-white/10 dark:text-white/70 dark:hover:border-white/40">Filtros</button>
              </div>
              <div className="space-y-3 overflow-y-auto pr-2">
                {activities.length === 0 ? (
                  <p className="text-xs italic text-gray-500 dark:text-white/50">Nenhuma atividade registrada</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-black/30">
                      <p className="text-xs text-gray-700 dark:text-white/70">{formatActivity(activity)}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-black/30">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Adicionar comentário"
                  className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder-white/40"
                />
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-white/10">
                  <span className="text-xs text-gray-500 dark:text-white/40">Adicionar comentário</span>
                  <button
                    type="button"
                    className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white disabled:bg-blue-600/40"
                    disabled={!comment.trim()}
                    onClick={() => setComment("")}
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="border-t border-white/5 bg-white dark:bg-black/30 p-4 sm:p-6">
          <div className="flex justify-end">
            <button
              onClick={handleUpdateClick}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Salvar alterações
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
