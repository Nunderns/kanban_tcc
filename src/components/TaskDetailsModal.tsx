"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ListBulletIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Task, Status } from './ProjectBoard';

interface WorkspaceMember {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  role: string;
}

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

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (taskId: number, updates: Partial<Task>) => Promise<void>;
  workspaceSlug?: string;
}

const priorityColors = {
  HIGH: 'red',
  MEDIUM: 'yellow',
  LOW: 'blue',
  NONE: 'gray'
} as const;

const statusOptions = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'A Fazer' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'REVIEW', label: 'Em Revisão' },
  { value: 'DONE', label: 'Concluído' },
];

function getActivityMessage(activity: Activity): string {
  if (activity.action === 'commented') {
    return 'comentou';
  }

  if (activity.action === 'updated field') {
    if (activity.field === 'status') {
      return `alterou o status de "${activity.oldValue || 'não definido'}" para "${activity.newValue || 'não definido'}"`;
    }
    if (activity.field === 'priority') {
      return `alterou a prioridade de "${activity.oldValue || 'nenhuma'}" para "${activity.newValue || 'nenhuma'}"`;
    }
    if (activity.field === 'assignedTo') {
      if (!activity.oldValue) return `atribuiu a tarefa a ${activity.newValue}`;
      if (!activity.newValue) return `removeu a atribuição de ${activity.oldValue}`;
      return `reatribuiu a tarefa de ${activity.oldValue} para ${activity.newValue}`;
    }
    return `atualizou ${activity.field} de "${activity.oldValue || 'vazio'}" para "${activity.newValue || 'vazio'}"`;
  }

  return 'realizou uma ação';
}

export default function TaskDetailsModal({ task: initialTask, onClose, onStatusChange, workspaceSlug }: TaskDetailsModalProps) {
  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'detalhes' | 'comentarios' | 'atividades'>('detalhes');
  const [comment, setComment] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const fetchActivities = useCallback(async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/activities`);
      if (response.ok) {
        const data = await response.json();
        const activities = Array.isArray(data) ? data : data.activities || [];
        activities.sort((a: Activity, b: Activity) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, []);

  useEffect(() => {
    setTask(initialTask);
    if (initialTask) {
      fetchActivities(initialTask.id);
    }
  }, [initialTask, fetchActivities]);

  const fetchWorkspaceMembers = useCallback(async () => {
    if (!workspaceSlug) return;

    try {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/members`);
      if (response.ok) {
        const data = await response.json();
        const members = Array.isArray(data) ? data : data.members || [];

        members.sort((a: WorkspaceMember, b: WorkspaceMember) => {
          const nameA = (a.displayName || a.fullName || a.email).toLowerCase();
          const nameB = (b.displayName || b.fullName || b.email).toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setWorkspaceMembers(members);
      } else {
        console.error('Failed to fetch workspace members:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching workspace members:', error);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    if (workspaceSlug) {
      fetchWorkspaceMembers();
    }
  }, [workspaceSlug, fetchWorkspaceMembers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-dropdown-container')) {
          setIsUserDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const handleChange = <K extends keyof Task>(field: K, value: Task[K]) => {
    if (!task) return;
    setTask(prev => {
      if (!prev) return prev;

      if (field === 'priority') {
        const validPriorities = ['HIGH', 'MEDIUM', 'LOW', 'NONE'] as const;
        type Priority = typeof validPriorities[number];
        const newValue = typeof value === 'string' && validPriorities.includes(value as Priority)
          ? value as Priority
          : 'NONE';
        return {
          ...prev,
          [field]: newValue as Task[K]
        };
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSave = async () => {
    if (!task) return;

    try {
      setIsLoading(true);

      const currentUserId = 'current-user-id';

      const updates: Partial<Task> = {};

      if (initialTask) {
        if (task.title !== initialTask.title) updates.title = task.title;
        if (task.description !== initialTask.description) updates.description = task.description || '';
        if (task.status !== initialTask.status) updates.status = task.status;
        if (task.priority !== initialTask.priority) updates.priority = task.priority || 'NONE';
        if (task.assignedTo !== initialTask.assignedTo) updates.assignedTo = task.assignedTo || null;
      }

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      await onStatusChange(task.id, updates);

      if (initialTask) {
        await Promise.all(
          Object.entries(updates).map(async ([field, newValue]) => {
            try {
              const oldValue = initialTask[field as keyof Task];

              if (!oldValue && !newValue) return;

              if (oldValue === newValue) return;

              let displayOldValue = String(oldValue || '');
              let displayNewValue = String(newValue || '');

              if (field === 'assignedTo') {
                if (oldValue) {
                  const oldUser = workspaceMembers.find(m => m.id === oldValue);
                  displayOldValue = oldUser ? (oldUser.displayName || oldUser.fullName || oldUser.email) : 'Ninguém';
                } else {
                  displayOldValue = 'Ninguém';
                }

                if (newValue) {
                  const newUser = workspaceMembers.find(m => m.id === newValue);
                  displayNewValue = newUser ? (newUser.displayName || newUser.fullName || newUser.email) : 'Ninguém';
                } else {
                  displayNewValue = 'Ninguém';
                }
              }

              if (field === 'priority') {
                const priorityMap: Record<string, string> = {
                  'HIGH': 'Alta',
                  'MEDIUM': 'Média',
                  'LOW': 'Baixa',
                  'NONE': 'Nenhuma'
                };
                displayOldValue = priorityMap[displayOldValue] || displayOldValue;
                displayNewValue = priorityMap[displayNewValue] || displayNewValue;
              }

              await fetch(`/api/tasks/${task.id}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user: currentUserId,
                  action: 'updated field',
                  field,
                  oldValue: displayOldValue,
                  newValue: displayNewValue,
                  createdAt: new Date().toISOString()
                })
              });
            } catch (error) {
              console.error(`Failed to log activity for ${field}:`, error);
            }
          })
        );
      }

      await fetchActivities(task.id);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || !comment.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      });

      if (response.ok) {
        setComment('');
        await fetchActivities(task.id);
        setSelectedTab('comentarios');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getPriorityColor = (priority: string = 'NONE') => {
    return priorityColors[priority as keyof typeof priorityColors] || 'gray';
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
      <motion.div
        className="bg-white dark:bg-gray-800 w-full max-w-2xl h-screen overflow-y-auto shadow-xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Editar Tarefa' : 'Detalhes da Tarefa'}
              </h2>
            </div>

            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6">
            {isEditing ? (
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Título da tarefa"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
            )}
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Criado em {new Date(task.createdAt).toLocaleString('pt-BR')}</span>
              <span className="mx-2">•</span>
              <span>Atualizado {new Date(task.updatedAt || task.createdAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setSelectedTab('detalhes')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${selectedTab === 'detalhes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                Detalhes
              </button>
              <button
                onClick={() => setSelectedTab('comentarios')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${selectedTab === 'comentarios'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                Comentários
              </button>
              <button
                onClick={() => setSelectedTab('atividades')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${selectedTab === 'atividades'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                Atividades
              </button>
            </nav>
          </div>

          <div className="space-y-6">
            {selectedTab === 'detalhes' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={task.status}
                      onChange={(e) => handleChange('status', e.target.value as Status)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className={`h-3 w-3 rounded-full bg-${getPriorityColor(task.priority)}-500`}></span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {statusOptions.find(s => s.value === task.status)?.label || task.status}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioridade
                  </label>
                  {isEditing ? (
                    <select
                      value={task.priority || 'NONE'}
                      onChange={(e) => handleChange('priority', e.target.value as Task['priority'])}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="NONE">Nenhuma</option>
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className={`h-3 w-3 rounded-full bg-${getPriorityColor(task.priority)}-500`}></span>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {task.priority ? task.priority.toLowerCase() : 'Nenhuma'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  {isEditing ? (
                    <textarea
                      value={task.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Adicione uma descrição detalhada..."
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      {task.description ? (
                        <p className="text-gray-900 dark:text-gray-200 whitespace-pre-line">
                          {task.description}
                        </p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          Nenhuma descrição fornecida.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Responsável
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <button
                        type="button"
                        className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      >
                        <span className="flex items-center">
                          <UserCircleIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <span className="ml-3 block truncate">
                            {task.assignedTo ?
                              (workspaceMembers.find(m => m.id === task.assignedTo)?.displayName ||
                                workspaceMembers.find(m => m.id === task.assignedTo)?.fullName ||
                                task.assignedTo) :
                              'Não atribuído'}
                          </span>
                        </span>
                      </button>

                      {isUserDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          <div
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${!task.assignedTo ? 'bg-blue-50 dark:bg-blue-900' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={() => {
                              handleChange('assignedTo', null);
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            <div className="flex items-center">
                              <UserCircleIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                              <span className="ml-3 block font-normal truncate">
                                Não atribuído
                              </span>
                            </div>
                            {!task.assignedTo && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </span>
                            )}
                          </div>
                          {workspaceMembers.map((member) => (
                            <div
                              key={member.id}
                              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${task.assignedTo === member.id ? 'bg-blue-50 dark:bg-blue-900' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                              onClick={() => {
                                handleChange('assignedTo', member.id);
                                setIsUserDropdownOpen(false);
                              }}
                            >
                              <div className="flex items-center">
                                <UserCircleIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                <span className="ml-3 block font-normal truncate">
                                  {member.displayName || member.fullName || member.email}
                                </span>
                              </div>
                              {task.assignedTo === member.id && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                  <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <UserCircleIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {task.assignedTo ?
                          (workspaceMembers.find(m => m.id === task.assignedTo)?.displayName ||
                            workspaceMembers.find(m => m.id === task.assignedTo)?.fullName ||
                            task.assignedTo) :
                          'Não atribuído'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Criação
                    </label>
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(task.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Última Atualização
                    </label>
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(task.updatedAt || task.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'comentarios' && (
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="relative">
                      <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-blue-500">
                        <label htmlFor="comment" className="sr-only">
                          Adicionar comentário
                        </label>
                        <textarea
                          rows={3}
                          name="comment"
                          id="comment"
                          className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                          placeholder="Adicione um comentário..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="py-2" aria-hidden="true">
                          <div className="py-px">
                            <div className="h-9" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                        <div className="flex items-center space-x-5">
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            onClick={handleAddComment}
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            Comentar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-6">
                  {activities
                    .filter(activity => activity.action === 'commented')
                    .map((activity) => (
                      <div key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {activity.user}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                            Comentado em {new Date(activity.createdAt).toLocaleString('pt-BR')}
                          </p>
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                            {activity.newValue}
                          </p>
                        </div>
                      </div>
                    ))}
                  {activities.filter(activity => activity.action === 'commented').length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Nenhum comentário ainda. Seja o primeiro a comentar!
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'atividades' && (
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== activities.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${activity.action === 'commented' ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              {activity.action === 'commented' ? (
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              ) : (
                                <ListBulletIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              )}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {activity.user}
                                </span>{' '}
                                {getActivityMessage(activity)}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                              <time dateTime={activity.createdAt}>
                                {new Date(activity.createdAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Nenhuma atividade registrada ainda.
                    </div>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 flex justify-end space-x-3">
          <button
            type="button"
            className="rounded-md bg-white dark:bg-gray-700 py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            Fechar
          </button>
          {isEditing ? (
            <button
              type="button"
              className="inline-flex justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
