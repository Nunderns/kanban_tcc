"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProjectSettings({ 
  project, 
  workspaceSlug 
}: { 
  project: { id: number; name: string; createdAt: Date; updatedAt: Date }; 
  workspaceSlug: string;
}) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir o projeto');
      }

      toast.success('Projeto excluído com sucesso!');
      router.push(`/${workspaceSlug}/dashboard`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Ocorreu um erro ao excluir o projeto');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome do Projeto</h3>
        <p className="text-gray-900 dark:text-white">{project.name}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data de Criação</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date(project.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Última Atualização</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date(project.updatedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="outline" 
          className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir Projeto'}
        </Button>
      </div>
      
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Excluir Projeto</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tem certeza que deseja excluir o projeto <span className="font-semibold">{project.name}</span>? 
              Esta ação não pode ser desfeita e todas as tarefas associadas serão permanentemente removidas.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Projeto'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
