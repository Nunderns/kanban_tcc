"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkItem } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";
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
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
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
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({
    url: '',
    displayName: ''
  });
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLinkForm, setEditingLinkForm] = useState({
    url: '',
    displayName: ''
  });

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

  const formatActivityDateTime = (isoString: string): string => {
    if (!isoString) return "";

    try {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) {
        return "";
      }

      const datePart = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      const timePart = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `${datePart} • ${timePart}`;
    } catch (error) {
      console.error("Error formatting activity timestamp:", error);
      return "";
    }
  };

  const formatActivity = (activity: Activity): string => {
    const { action, field, oldValue, newValue } = activity;

    if (action === 'commented') {
      return newValue?.trim() || 'Comentou na tarefa';
    }

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
          return `Atribuiu a tarefa para ${userName}`;
        } else if (!newValue || newValue === 'null' || newValue === 'undefined') {
          const previousUser = workspaceMembers.find(member => member.id === oldValue);
          const userName = previousUser?.displayName || previousUser?.fullName || 'um usuário';
          return `Removeu a atribuição de ${userName}`;
        } else {
          const oldUser = workspaceMembers.find(member => member.id === oldValue);
          const newUser = workspaceMembers.find(member => member.id === newValue);
          const oldUserName = oldUser?.displayName || oldUser?.fullName || 'um usuário';
          const newUserName = newUser?.displayName || newUser?.fullName || 'um usuário';
          return `Transferiu a tarefa de ${oldUserName} para ${newUserName}`;
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
      
      return `Alterou o campo ${fieldName} de "${oldVal}" para "${newVal}"`;
    }
    
    const actionMap: Record<string, string> = {
      'created': 'Criou a tarefa',
      'deleted': 'Excluiu a tarefa',
      'assigned': 'Atribuiu a tarefa',
      'commented': 'Comentou na tarefa'
    };
    
    return actionMap[action] || action;
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
  
  const handleActionClick = (action: string) => {
    if (action === "Adicionar link") {
      setShowLinkModal(true);
      return;
    }

    console.info(`Ação não implementada: ${action}`);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setLinkForm({ url: '', displayName: '' });
    setIsSubmittingLink(false);
  };

  const handleEditingLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingLinkForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditLink = (link: { id: string; url: string; displayName: string }) => {
    setEditingLinkId(link.id);
    setEditingLinkForm({
      url: link.url,
      displayName: link.displayName || ''
    });
  };

  const handleUpdateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLinkId || !editingLinkForm.url.trim()) return;

    const updatedLinks = (localItem.links || []).map(link => 
      link.id === editingLinkId 
        ? { 
            ...link, 
            url: editingLinkForm.url.trim(), 
            displayName: editingLinkForm.displayName.trim() || editingLinkForm.url.trim() 
          }
        : link
    );

    const updatedItem = { ...localItem, links: updatedLinks };
    setLocalItem(updatedItem);
    onUpdate(updatedItem);
    setEditingLinkId(null);
    setEditingLinkForm({ url: '', displayName: '' });
  };

  const handleDeleteLink = (linkId: string) => {
    const updatedLinks = (localItem.links || []).filter(link => link.id !== linkId);
    const updatedItem = { ...localItem, links: updatedLinks };
    setLocalItem(updatedItem);
    onUpdate(updatedItem);
    setEditingLinkId(null);
    setEditingLinkForm({ url: '', displayName: '' });
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.url.trim()) return;

    setIsSubmittingLink(true);
    try {
      // TODO: Integrate with backend API when available
      console.info("Adicionando link", {
        url: linkForm.url,
        displayName: linkForm.displayName || linkForm.url,
        taskId: localItem.id,
      });

      // Create new link object
      const newLink = {
        id: `link-${Date.now()}`,
        url: linkForm.url.trim(),
        displayName: linkForm.displayName.trim() || linkForm.url.trim(),
        createdAt: new Date().toISOString(),
      };

      // Update local state
      const updatedLinks = [...(localItem.links || []), newLink];
      const updatedItem = { ...localItem, links: updatedLinks };
      setLocalItem(updatedItem);
      
      // Notify parent component
      onUpdate(updatedItem);

      closeLinkModal();
    } catch (error) {
      console.error("Erro ao adicionar link", error);
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const renderLinkModal = useCallback(() => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d0f14]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adicionar link</h3>
          <button
            type="button"
            onClick={closeLinkModal}
            className="text-gray-400 transition hover:text-gray-600 dark:text-white/60 dark:hover:text-white"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="link-url" className="text-sm font-medium text-gray-700 dark:text-white/80">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              id="link-url"
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://exemplo.com/meu-link"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="link-title" className="text-sm font-medium text-gray-700 dark:text-white/80">
              Título de exibição <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              id="link-title"
              type="text"
              value={linkForm.displayName}
              onChange={(e) => setLinkForm((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Como você gostaria de ver este link"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeLinkModal}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
            disabled={isSubmittingLink}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAddLink}
            disabled={!linkForm.url.trim() || isSubmittingLink}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
          >
            {isSubmittingLink ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  ), [closeLinkModal, handleAddLink, isSubmittingLink, linkForm.displayName, linkForm.url]);

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

  const handleSubmitComment = async () => {
    if (!comment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      setCommentError(null);

      const response = await fetch(`/api/tasks/${item.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment.trim() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit comment");
      }

      setComment("");
      await fetchActivities();
    } catch (error) {
      console.error("Failed to submit comment", error);
      setCommentError("Não foi possível adicionar o comentário. Tente novamente.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleChange = (field: keyof WorkItem, value: string | string[] | null | undefined) => {
    setLocalItem(prev => {
      const updatedItem = {
        ...prev,
        [field]: value
      };

      if (field === 'assignedUserId' && typeof value === 'string') {
        const assignedUser = workspaceMembers.find(member => member.id === value);
        updatedItem.assignedUserName = assignedUser
          ? assignedUser.displayName || assignedUser.fullName || ''
          : '';
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
  <>
    {showLinkModal && renderLinkModal()}
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
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-100 dark:bg-white/[0.02] px-4 py-3 text-sm text-gray-700 dark:text-white/80 placeholder-gray-500 dark:placeholder-white/40 focus:border-gray-400 dark:focus:border-white/40 focus:outline-none"
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
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600 transition hover:border-gray-300 dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:border-white/40">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            {actionButtons.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleActionClick(label)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/40 dark:hover:text-white sm:w-auto"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.02] sm:p-6">
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-600 dark:text-white/60">Propriedades</h3>
              <p className="text-xs text-gray-500 dark:text-white/40">Última edição por {formatUserName(item.creator || "henri.okayama")}</p>
            </div>

            <div className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Estado</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-full bg-gray-200 p-2 dark:bg-white/10">{getStatusIcon(localItem.status)}</div>
                  <select
                    value={localItem.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white"
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
                <div className="relative mt-3">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:border-gray-300 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:border-white/30"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <UserCircleIcon className="h-5 w-5 text-gray-500 dark:text-white/50" />
                      <span className="truncate">
                        {localItem.assignedUserId
                          ? formatUserName(
                              workspaceMembers.find((m) => m.id === localItem.assignedUserId)?.fullName ||
                                localItem.assignedUserName ||
                                "Usuário"
                            )
                          : "Adicionar responsáveis"}
                      </span>
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-white/50" />
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#11131a]">
                      <div className="max-h-60 overflow-y-auto p-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleChange("assignedUserId", "");
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10"
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
                                <p className="truncate font-medium text-gray-900 dark:text-white">{member.fullName}</p>
                                <p className="truncate text-xs text-gray-500 dark:text-white/50">{member.email}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Prioridade</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-full bg-gray-200 p-2 dark:bg-white/10">{getPriorityIcon(localItem.priority)}</div>
                  <select
                    value={localItem.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white"
                  >
                    <option value="NONE" className="bg-white dark:bg-[#0d0f14]">None</option>
                    <option value="LOW" className="bg-white dark:bg-[#0d0f14]">Low</option>
                    <option value="MEDIUM" className="bg-white dark:bg-[#0d0f14]">Medium</option>
                    <option value="HIGH" className="bg-white dark:bg-[#0d0f14]">High</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Criado por</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-white/80">
                  <UserCircleIcon className="h-5 w-5 text-emerald-400" />
                  {formatUserName(item.creator || "henri.okayama")}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Data de início</p>
                <div className="mt-3 flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-white/60" />
                  <FormattedDateInput
                    value={localItem.startDate || ""}
                    onChange={(value) => handleChange("startDate", value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none dark:border-white/10 dark:bg-transparent dark:text-white"
                    placeholder="dd/mm/aaaa"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/20">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-white/40">Data de vencimento</p>
                <div className="mt-3 flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-gray-500 dark:text-white/60" />
                  <FormattedDateInput
                    value={localItem.dueDate || ""}
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

          {/* Links Section - Only show if there are links or modal is open */}
          {((localItem.links && localItem.links.length > 0) || showLinkModal) && (
            <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.02] sm:p-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-50 p-2 dark:bg-white/10">
                    <LinkIcon className="h-5 w-5 text-blue-600 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-700 dark:text-white/70">Links</h3>
                    <p className="text-xs text-gray-500 dark:text-white/40">
                      {localItem.links && localItem.links.length > 0 ? `${localItem.links.length} link${localItem.links.length !== 1 ? 's' : ''}` : 'Nenhum link adicionado'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Adicionar link
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {localItem.links && localItem.links.length > 0 ? (
                  <div className="space-y-2">
                    {localItem.links?.map((link) => (
                      <div 
                        key={link.id} 
                        className="group relative rounded-lg border border-gray-200 p-3 transition hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
                      >
                        {editingLinkId === link.id ? (
                          <div className="space-y-2">
                            <form onSubmit={handleUpdateLink} className="space-y-2">
                              <input
                                type="url"
                                name="url"
                                value={editingLinkForm.url}
                                onChange={handleEditingLinkChange}
                                className="w-full rounded border border-gray-300 p-2 text-sm dark:bg-white/5 dark:text-white dark:border-white/10"
                                placeholder="URL"
                                required
                              />
                              <input
                                type="text"
                                name="displayName"
                                value={editingLinkForm.displayName}
                                onChange={handleEditingLinkChange}
                                className="w-full rounded border border-gray-300 p-2 text-sm dark:bg-white/5 dark:text-white dark:border-white/10"
                                placeholder="Título de exibição (opcional)"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingLinkId(null);
                                    setEditingLinkForm({ url: '', displayName: '' });
                                  }}
                                  className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                  Salvar
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 group-hover:bg-blue-100 dark:bg-white/10 dark:group-hover:bg-blue-500/20">
                                <LinkIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-600 dark:text-white/60 dark:group-hover:text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-white">
                                  {link.displayName}
                                </p>
                                <p className="truncate text-xs text-gray-500 group-hover:text-blue-500 dark:text-white/50">
                                  {new URL(link.url).hostname.replace('www.', '')}
                                </p>
                              </div>
                            </a>
                            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditLink(link);
                                }}
                                className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                                title="Editar link"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteLink(link.id);
                                }}
                                className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:text-white/60 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                                title="Excluir link"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-white/10">
                    <LinkIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-white/30" />
                    <h4 className="mt-2 text-sm font-medium text-gray-700 dark:text-white/70">Nenhum link adicionado</h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-white/50">
                      Adicione links relacionados a esta tarefa
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowLinkModal(true)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Adicionar link
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Activity Section */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.02] sm:p-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-2 dark:bg-white/10">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 dark:text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-700 dark:text-white/70">Atividade</h3>
                  <p className="text-xs text-gray-500 dark:text-white/40">
                    {activities.length === 1 ? "1 registro" : `${activities.length} registros`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-sm italic text-gray-500 dark:text-white/60">Nenhuma atividade registrada</p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`rounded-2xl border p-3 transition ${
                        activity.action === "commented"
                          ? "border-blue-200 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10 shadow-sm"
                          : "border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-black/20"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-white/50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-white">
                            {formatUserName(activity.user)}
                          </span>
                          {activity.action === "commented" && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                              Comentário
                            </span>
                          )}
                        </div>
                        <span>{formatActivityDateTime(activity.createdAt)}</span>
                      </div>
                      <p
                        className={`mt-2 text-sm ${
                          activity.action === "commented"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-800 dark:text-white/80"
                        }`}
                      >
                        {formatActivity(activity)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-black/20">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Adicionar comentário"
                  className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder-white/40"
                />
                {commentError && (
                  <p className="px-4 text-xs text-red-500">{commentError}</p>
                )}
                <div className="flex items-center justify-end border-t border-gray-200 px-4 py-3 dark:border-white/10">
                  <button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={!comment.trim() || isSubmittingComment}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/40"
                  >
                    {isSubmittingComment ? "Enviando..." : "Comentar"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-white/5 bg-white px-4 py-4 dark:bg-black/30 sm:px-6 sm:py-6">
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
  </>
  );
}
