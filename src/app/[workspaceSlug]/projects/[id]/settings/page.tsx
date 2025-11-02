"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProjectSettings() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState({
    id: '',
    name: '',
    description: '',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log('Fetching project with ID:', params.id);
        const response = await fetch(`/api/projects/${params.id}`);
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error('Falha ao carregar projeto');
        }
        const data = await response.json();
        console.log('Project data:', data);
        setProject(data);
      } catch (error: unknown) {
        console.error('Error fetching project:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar projeto';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: project.name,
          description: project.description,
          status: project.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao atualizar projeto');
      }
      
      toast.success('Projeto atualizado com sucesso!');
      setProject(prev => ({
        ...prev,
        ...data,
        updatedAt: new Date()
      }));
      setIsEditing(false);
      router.refresh();
    } catch (error: unknown) {
      console.error('Error updating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar projeto';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita e irá apagar todas as tarefas relacionadas.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao excluir projeto');
      }
      
      toast.success('Projeto excluído com sucesso!');
      router.push(`/${params.workspaceSlug}/projects`);
    } catch (error: unknown) {
      console.error('Error deleting project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir projeto';
      toast.error(errorMessage);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('Rendering ProjectSettings:', { isEditing, project });

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Debug info - will be removed later */}
      <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 p-2 rounded-md text-sm z-50">
        Debug: isEditing = {isEditing ? 'true' : 'false'}
      </div>
      
      <div className="flex justify-between items-center mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg relative">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Projeto</h1>
        <div className="flex space-x-3 z-50">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Editar Projeto
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                style={{ position: 'relative', zIndex: 1000 }}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Projeto'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form
                  fetch(`/api/projects/${params.id}`)
                    .then(res => res.json())
                    .then(data => setProject(data));
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSave}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Projeto
            </label>
            {isEditing ? (
              <input
                type="text"
                id="name"
                name="name"
                value={project.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            ) : (
              <p className="text-gray-900 dark:text-white text-lg">{project.name}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            {isEditing ? (
              <textarea
                id="description"
                name="description"
                value={project.description || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {project.description || 'Nenhuma descrição fornecida.'}
                </p>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Criado em: {format(new Date(project.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Última atualização: {format(new Date(project.updatedAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                id="status"
                name="status"
                value={project.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="ARCHIVED">Arquivado</option>
                <option value="COMPLETED">Concluído</option>
              </select>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 capitalize">
                {project.status.toLowerCase() === 'active' ? 'Ativo' : 
                 project.status.toLowerCase() === 'archived' ? 'Arquivado' : 'Concluído'}
              </p>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Zona de Perigo</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Excluir Projeto</h3>
          <p className="text-red-700 dark:text-red-300 text-sm mt-1 mb-4">
            Esta ação não pode ser desfeita. Todos os dados do projeto, incluindo tarefas e configurações, serão permanentemente removidos.
          </p>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Projeto Permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
}
