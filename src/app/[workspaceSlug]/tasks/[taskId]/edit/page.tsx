"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { format } from 'date-fns';
import { ArrowLeft } from "lucide-react";

interface WorkspaceMember {
  id: number | string;
  name: string | null;
  email: string;
}

export default function EditTaskPage() {
  const { workspaceSlug, taskId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
    assignedUserId: ''
  });

  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskRes = await fetch(`/api/tasks/${taskId}`);
        const taskData = await taskRes.json();

        const response = await fetch(`/api/workspaces/${workspaceSlug}/members`);
        const membersData = await response.json();
        setWorkspaceMembers(membersData?.members || []);

        setFormData({
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate ? format(new Date(taskData.dueDate), 'yyyy-MM-dd') : '',
          assignedUserId: taskData.assignedUser?.id?.toString() || ''
        });
      } catch (error) {
        console.error('Error loading task data:', error);
        setError('Falha ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workspaceSlug, taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        assignedUserId: formData.assignedUserId ? parseInt(formData.assignedUserId) : null
      };
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar alterações');
      }
      
      router.push(`/${workspaceSlug}/tasks/${taskId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar alterações');
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-2xl shadow-xl backdrop-blur-lg p-8">
        <button
          onClick={() => router.push(`/${workspaceSlug}/tasks/${taskId}`)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft size={18} />
          Voltar para a tarefa
        </button>

        <h1 className="text-3xl font-semibold text-white mb-2">Editar Tarefa</h1>
        <p className="text-gray-400 mb-6">Atualize os detalhes da tarefa</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Título</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg bg-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">A Fazer</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="DONE">Concluído</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Prioridade</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="NONE">Nenhuma</option>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Data de Vencimento</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Responsável</label>
              <select
                name="assignedUserId"
                value={formData.assignedUserId}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-700 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhum responsável</option>
                {workspaceMembers.map((member: WorkspaceMember) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg transition-all duration-300"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
