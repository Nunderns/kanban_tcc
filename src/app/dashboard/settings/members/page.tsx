"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, X, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { toast } from 'react-hot-toast';

type InviteField = {
  email: string;
  role: string;
};

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [fields, setFields] = useState<InviteField[]>([{ email: "", role: "Membro" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: session } = useSession();

  const handleChange = <K extends keyof InviteField>(
    index: number,
    key: K,
    value: InviteField[K]
  ) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const handleAdd = () => setFields([...fields, { email: "", role: "Membro" }]);
  const handleRemove = (index: number) => setFields(fields.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!session?.user?.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const workspaceId = 1; // Replace with actual workspace ID
      
      const results = await Promise.all(
        fields.map(async (field) => {
          if (!field.email.trim()) return null;
          
          const response = await fetch('/api/invitations/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: field.email.trim(),
              role: field.role,
              workspaceId,
            }),
          });
          
          if (!response.ok) {
            let errorMessage = 'Erro ao enviar convite';
            try {
              const errorData = await response.json();
              console.log('Resposta de erro da API:', errorData);
              errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
              console.error('Erro ao processar resposta de erro:', parseError);
              errorMessage = `Erro ${response.status}: ${response.statusText}`;
            }
            
            // Mostrar notificação de erro
            toast.error(errorMessage, {
              position: 'bottom-center',
              duration: 5000,
            });
            
            throw new Error(errorMessage);
          }
          
          // Mostrar notificação de sucesso
          toast.success(`Convite enviado para ${field.email}`, {
            position: 'bottom-center',
            duration: 3000,
          });
          
          return { email: field.email, success: true };
        })
      );
      
      setSuccess(true);
      setFields([{ email: "", role: "Membro" }]);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao enviar convites:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar convites';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Convidar membros</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Convite enviado com sucesso!
          </div>
        )}
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="email"
                value={field.email}
                onChange={(e) => handleChange(index, 'email', e.target.value)}
                placeholder="Email"
                className="flex-1 border rounded px-3 py-2"
                disabled={isLoading}
              />
              <select
                value={field.role}
                onChange={(e) => handleChange(index, 'role', e.target.value)}
                className="border rounded px-3 py-2"
                disabled={isLoading}
              >
                <option value="Membro">Membro</option>
                <option value="Admin">Admin</option>
              </select>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isLoading}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAdd}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            disabled={isLoading}
          >
            <Plus size={16} /> Adicionar outro
          </button>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            disabled={isLoading || fields.some(f => !f.email.trim())}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Enviando...' : 'Enviar convites'}
          </button>
        </div>
      </div>
    </div>
  );
}

type Member = {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  role: string;
};

export default function MembersPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/workspace/members');
        if (!response.ok) {
          throw new Error('Erro ao carregar membros');
        }
        const data = await response.json();
        setMembers(data.members);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Falha ao carregar membros do workspace');
        
        // Mostrar notificação de erro
        toast.error('Falha ao carregar membros do workspace', {
          position: 'bottom-center',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchMembers();
    }
  }, [status]);

  if (status === "loading") return <div className="p-4 text-gray-900">Carregando sessão...</div>;
  if (status === "unauthenticated") {
    // Redirecionar para a página de login
    window.location.href = '/login';
    return null;
  }

  const filteredMembers = members.filter((member) => {
    if (!member) return false;
    const query = search.toLowerCase().trim();
    return (
      member.fullName?.toLowerCase().includes(query) ||
      member.displayName?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  const selected = pathname?.split("/").pop();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de configurações */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h2>
            <nav>
              <ul className="space-y-1">
                {[
                  { href: "general", label: "Geral" },
                  { href: "members", label: "Membros" },
                  { href: "project-states", label: "Estados do Projeto" },
                  { href: "billing", label: "Cobrança" },
                  { href: "integrations", label: "Integrações" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/dashboard/settings/${item.href}`}
                      className={`block px-4 py-2 rounded-md ${
                        selected === item.href
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Membros da Equipe</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie os membros do seu workspace
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Adicionar membro
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Lista de Membros
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar membros..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {member.fullName?.charAt(0) || '?'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.fullName || 'Sem nome'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.displayName || 'Sem nome de exibição'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {member.role || 'Membro'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Ativo
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                          <button className="text-red-600 hover:text-red-900">Remover</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhum membro encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <InviteModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
