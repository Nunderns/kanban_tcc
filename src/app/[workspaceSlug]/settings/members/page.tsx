"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Plus, X, Loader2 } from "lucide-react";
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

  const pathname = usePathname();
  const workspaceSlug = pathname.split('/')[1];

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const workspaceResponse = await fetch(`/api/workspaces/current?workspaceSlug=${workspaceSlug}`);
      if (!workspaceResponse.ok) {
        throw new Error('Não foi possível obter o workspace atual');
      }
      const workspaceData = await workspaceResponse.json();
      const workspaceId = workspaceData.id;
      await Promise.all(
        fields.map(async (field) => {
          if (!field.email.trim()) return null;
          const response = await fetch('/api/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: field.email.trim(), role: field.role, workspaceId }),
          });
          if (!response.ok) {
            let errorMessage = 'Erro ao enviar convite';
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch {
              errorMessage = `Erro ${response.status}: ${response.statusText}`;
            }
            toast.error(errorMessage, { position: 'bottom-center', duration: 5000 });
            throw new Error(errorMessage);
          }
          toast.success(`Convite enviado para ${field.email}`, { position: 'bottom-center', duration: 3000 });
          return { email: field.email, success: true };
        })
      );
      setSuccess(true);
      setFields([{ email: "", role: "Membro" }]);
      setTimeout(() => { onClose(); setSuccess(false); }, 2000);
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Convidar membros</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-emerald-900/30 border border-green-400 dark:border-emerald-700 text-green-700 dark:text-emerald-300 px-4 py-3 rounded mb-4">
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
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                disabled={isLoading}
              />
              <select
                value={field.role}
                onChange={(e) => handleChange(index, 'role', e.target.value)}
                className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
              >
                <option value="Membro">Membro</option>
                <option value="Admin">Admin</option>
              </select>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
            disabled={isLoading}
          >
            <Plus size={16} /> Adicionar outro
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
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
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, systemTheme } = useTheme();

  const [workspaceName, setWorkspaceName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
  }, [theme, systemTheme]);

  const links = [
    { href: "/dashboard/settings/general", label: "Geral" },
    { href: "/dashboard/settings/members", label: "Membros" },
    { href: "/dashboard/settings/project-states", label: "Estados do Projeto" },
    { href: "/dashboard/settings/imports", label: "Importações" },
    { href: "/dashboard/settings/exports", label: "Exportações" }
  ];

  useEffect(() => {
    const stored = localStorage.getItem("workspaceSelecionado");
    if (stored) {
      const parsed = JSON.parse(stored);
      setWorkspaceName(parsed.nome || "");
    }
  }, []);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const pathname = window.location.pathname;
        const workspaceSlug = pathname.split('/')[1];
        const response = await fetch(`/api/workspaces/${workspaceSlug}/members`);
        if (!response.ok) throw new Error('Erro ao carregar membros');
        const data = await response.json();
        setMembers(data.members);
      } catch (err) {
        console.error('Error fetching members:', err);
        toast.error('Falha ao carregar membros do workspace', { position: 'bottom-center', duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    }
    if (session) fetchMembers();
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
        <aside className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm">
          <h2 className="text-gray-500 dark:text-gray-400 font-semibold uppercase mb-2">Configurações</h2>
          {links.map(({ href, label }) => (
            <div key={href} className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-200">
              {label}
            </div>
          ))}
        </aside>
        <main className="flex-1 p-10">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-gray-500 dark:text-gray-400 font-semibold uppercase">Configurações</h2>
        </div>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block w-full text-left px-3 py-2 rounded-md transition ${
              pathname === href
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-600 dark:text-gray-300">
          <span className="text-gray-800 dark:text-gray-200 font-medium">{workspaceName}</span> &gt; Configurações &gt; Membros
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Membros da Equipe</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie os membros do seu workspace</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Adicionar membro
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Lista de Membros</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar membros..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cargo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {member.fullName?.charAt(0) || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.fullName || 'Sem nome'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.displayName || 'Sem nome de exibição'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                          {member.role || 'Membro'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Ativo</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">Editar</button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Remover</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">Nenhum membro encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <InviteModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
