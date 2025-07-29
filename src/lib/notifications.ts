import { Notification } from "@/components/NotificationsDropdown";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  userId?: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
  remainingDays?: number;
}

export const checkTasksForNotifications = (tasks: Task[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();
  
  tasks.forEach(task => {
    if (!task.dueDate) return;
    
    try {
      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) return; // Skip invalid dates
      
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Only create notifications for tasks due in the next 3 days
      if (daysDiff >= 0 && daysDiff <= 3) {
        let message = '';
        let type: 'warning' | 'error' = 'warning';
        
        if (daysDiff === 0) {
          message = `A tarefa "${task.title}" vence hoje!`;
          type = 'error';
        } else if (daysDiff === 1) {
          message = `A tarefa "${task.title}" vence amanhã!`;
        } else {
          message = `A tarefa "${task.title}" vence em ${daysDiff} dias`;
        }
        
        notifications.push({
          id: `task-due-${task.id}`,
          title: 'Prazo de Tarefa',
          message,
          type,
          read: false,
          createdAt: new Date(),
          link: `/tasks/${task.id}`
        });
      }
    } catch (error) {
      console.error('Erro ao processar data da tarefa:', error);
    }
  });
  
  return notifications;
};

export const mergeAndDeduplicateNotifications = (
  existing: Notification[], 
  newOnes: Notification[]
): Notification[] => {
  const existingIds = new Set(existing.map(n => n.id));
  const uniqueNewOnes = newOnes.filter(n => !existingIds.has(n.id));
  return [...existing, ...uniqueNewOnes];
};
