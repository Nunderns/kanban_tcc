'use client';

import { useRouter } from 'next/navigation';

interface TaskActionsProps {
  workspaceSlug: string;
  taskId: number;
}

export function TaskActions({ workspaceSlug, taskId }: TaskActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push(`/${workspaceSlug}`);
          router.refresh();
        } else {
          alert('Erro ao excluir a tarefa');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Erro ao excluir a tarefa');
      }
    }
  };

  const scrollToComment = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
      window.scrollTo({
        top: textarea.offsetTop - 20,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-2">
      <a
        href={`/${workspaceSlug}/tasks/${taskId}/edit`}
        className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md text-sm font-medium transition-colors"
      >
        Editar Tarefa
      </a>
      <button
        onClick={scrollToComment}
        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors"
      >
        Adicionar Comentário
      </button>
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-md text-sm font-medium transition-colors"
      >
        Excluir Tarefa
      </button>
    </div>
  );
}
