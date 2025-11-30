"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { format } from 'date-fns';
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          assignedUserId: taskData.assignedUser?.id?.toString() || 'none'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        assignedUserId: formData.assignedUserId !== 'none' ? parseInt(formData.assignedUserId) : null
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

  if (loading) return <div className="min-h-screen flex justify-center items-center text-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto bg-card text-card-foreground border rounded-2xl shadow-lg p-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${workspaceSlug}/tasks/${taskId}`)}
          className="flex items-center gap-2 text-primary mb-6 pl-0"
        >
          <ArrowLeft size={18} />
          Voltar para a tarefa
        </Button>

        <h1 className="text-3xl font-semibold text-foreground mb-2">Editar Tarefa</h1>
        <p className="text-muted-foreground mb-6">Atualize os detalhes da tarefa</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="mb-2">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="TODO">A Fazer</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                  <SelectItem value="DONE">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                name="priority"
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Nenhuma</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedUserId">Responsável</Label>
              <Select
                name="assignedUserId"
                value={formData.assignedUserId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedUserId: value }))}
              >
                <SelectTrigger id="assignedUserId" className="w-full">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum responsável</SelectItem>
                  {workspaceMembers.map((member: WorkspaceMember) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      <div className="flex flex-col">
                        <span>{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit">
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
