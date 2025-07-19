'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkTasksForNotifications, mergeAndDeduplicateNotifications, Task } from '@/lib/notifications';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
  [key: string]: unknown; // Allow additional properties with unknown type
}

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();

  const fetchTasks = useCallback(async (): Promise<Task[]> => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
        },
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar tarefas');
      }
      
      const data = await response.json() as Task[];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }
  }, []);

  const fetchInitialNotifications = useCallback(async () => {
    try {
      const [tasks] = await Promise.all([
        fetchTasks(),
        // Adicione outras chamadas de API aqui se necessário
      ]);

      // Gera notificações para tarefas próximas do vencimento
      const taskNotifications = checkTasksForNotifications(tasks);
      
      // Notificações do sistema (pode ser vazio se não houver)
      const systemNotifications: Notification[] = [
        // Notificações do sistema podem ser adicionadas aqui
      ];

      // Combina e remove duplicatas
      const allNotifications = mergeAndDeduplicateNotifications(
        systemNotifications,
        taskNotifications
      );

      // Ordena por data de criação (mais recentes primeiro)
      allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  // Carregar notificações iniciais
  useEffect(() => {
    fetchInitialNotifications();
  }, [fetchInitialNotifications]);

  // Configurar polling para verificar tarefas
  useEffect(() => {
    const checkForUpdates = async () => {
      if (isPolling) return;
      
      try {
        setIsPolling(true);
        const tasks = await fetchTasks();
        if (tasks && Array.isArray(tasks)) {
          const taskNotifications = checkTasksForNotifications(tasks);
          
          setNotifications(prev => {
            const newNotifications = mergeAndDeduplicateNotifications(prev, taskNotifications);
            // Se houver novas notificações, ordena novamente
            if (newNotifications.length !== prev.length) {
              return [...newNotifications].sort((a, b) => 
                (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
              );
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações de tarefas:', error);
      } finally {
        setIsPolling(false);
      }
    };

    // Verifica a cada 5 minutos
    pollInterval.current = setInterval(checkForUpdates, 5 * 60 * 1000);
    
    // Limpa o intervalo quando o componente é desmontado
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [fetchTasks, isPolling]);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'agora mesmo';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `há ${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `há ${diffInHours} h${diffInHours !== 1 ? 's' : ''}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `há ${diffInDays} dia${diffInDays !== 1 ? 's' : ''}`;
    }
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Notificações</h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 focus:outline-none"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Carregando notificações...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.li
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                      className={`relative group ${!notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <a
                        href={notification.link || '#'}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className="block p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatTimeAgo(new Date(notification.createdAt))}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteNotification(notification.id, e);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 focus:outline-none transition-opacity"
                              aria-label="Remover notificação"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="absolute top-1/2 right-2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                <a
                  href="/notifications"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  Ver todas as notificações
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsDropdown;
