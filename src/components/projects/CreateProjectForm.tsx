'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface CreateProjectFormProps {
  workspaceSlug: string;
}

export function CreateProjectForm({ workspaceSlug }: CreateProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Fetching workspace with slug:', workspaceSlug);
      const workspaceResponse = await fetch(`/api/workspaces/slug/${workspaceSlug}`);
      
      if (!workspaceResponse.ok) {
        const errorData = await workspaceResponse.json().catch(() => ({}));
        console.error('Workspace fetch error:', {
          status: workspaceResponse.status,
          statusText: workspaceResponse.statusText,
          errorData
        });
        throw new Error(errorData.message || 'Failed to fetch workspace');
      }
      
      const workspace = await workspaceResponse.json();
      console.log('Workspace data:', workspace);
      
      if (!workspace || !workspace.id) {
        console.error('Invalid workspace data received:', workspace);
        throw new Error('Invalid workspace data received');
      }

      const projectData = {
        name: formData.name,
        description: formData.description || null,
        workspaceId: Number(workspace.id),
        color: '#3b82f6'
      };

      console.log('Sending project creation request:', projectData);
      
      console.log('Sending request to /api/projects with data:', projectData);
      
      let response;
      try {
        response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });

        const responseData = await response.json().catch(() => null);
      
      if (!response.ok) {
        console.error('Project creation failed:', {
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        
        throw new Error(
          responseData?.message || 
          `Failed to create project: ${response.status} ${response.statusText}`
        );
      }
      
      toast.success('Project created successfully!');
      
      router.push(`/${workspaceSlug}`);
      router.refresh();
      
      return responseData;
      } catch (error) {
        console.error('Error during project creation:', {
          error,
          response: response ? {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          } : 'No response received'
        });
        throw error;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Projeto  <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Meu projeto incrível"
          className="w-full"
          disabled={isLoading}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descrição (opcional)"
          className="w-full min-h-[100px]"
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Criando...' : 'Criar Projeto'}
        </Button>
      </div>
    </form>
  );
}
