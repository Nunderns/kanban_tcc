"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

type InviteField = {
  email: string;
  role: string;
};

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [fields, setFields] = useState<InviteField[]>([{ email: "", role: "Membro" }]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white text-gray-900 w-[500px] p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">Convide pessoas para trabalhar</h2>
        <p className="text-sm text-gray-600 mb-4">
          Convide pessoas para trabalhar no seu Espaço de Trabalho.
        </p>

        <div className="space-y-3 mb-4">
          {fields.map((field, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="nome@dominio.com"
                value={field.email}
                onChange={(e) => handleChange(index, "email", e.target.value)}
                className="flex-1 px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
              />
              <select
                value={field.role}
                onChange={(e) => handleChange(index, "role", e.target.value)}
                className="bg-white border border-gray-300 text-sm text-gray-900 px-2 py-2 rounded-md"
              >
                <option>Membro</option>
                <option>Admin</option>
              </select>
              <button
                onClick={() => handleRemove(index)}
                className="text-gray-500 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAdd}
          className="text-blue-600 text-sm mb-4 hover:underline"
        >
          + Adicionar mais
        </button>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Cancelar
          </button>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md">
            Enviar Convite
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  if (status === "loading") return <div className="p-4 text-white">Carregando sessão...</div>;
  if (!session) return <div className="p-4 text-red-500">Sessão inválida</div>;

  const currentUser = {
    id: 1,
    fullName: session.user?.name || "Usuário",
    displayName: session.user?.email?.split("@")[0] || "usuario",
    email: session.user?.email || "",
    accountType: "Membro",
    authentication: "Email",
  };

  const filteredMembers = [currentUser].filter((member) => {
    const query = search.toLowerCase().trim();
    return (
      member.fullName.toLowerCase().includes(query) ||
      member.displayName.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  });

  const selected = pathname?.split("/").pop();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1">
        <aside className="w-64 bg-white p-6 border-r border-gray-300 text-gray-800">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">Configurações</h2>
          <ul className="space-y-2 text-sm">
            {[
              { href: "general", label: "General" },
              { href: "members", label: "Membros" },
              { href: "project-states", label: "Estados do Projeto" },
              { href: "billing-and-plans", label: "Faturamento e Planos" },
              { href: "integrations", label: "Integrações" },
              { href: "imports", label: "Importações" },
              { href: "exports", label: "Exportações" },
              { href: "webhooks", label: "Webhooks" },
              { href: "api-tokens", label: "API Tokens" },
              { href: "worklogs", label: "Registros de Trabalho" },
              { href: "teamspaces", label: "Espaços de Equipe" },
              { href: "initiatives", label: "Iniciativas" },
              { href: "customers", label: "Clientes" },
              { href: "templates", label: "Templates" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={`/dashboard/settings/${href}`}
                  className={`block w-full text-left px-3 py-2 rounded-md transition ${
                    selected === href
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 p-6 overflow-auto bg-white text-gray-900">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-semibold">
              Membros{" "}
              <span className="text-sm bg-gray-200 px-2 py-0.5 rounded ml-1">
                {filteredMembers.length}
              </span>
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
              <Plus size={16} /> Adicionar membro
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-1/3 bg-white border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 placeholder-gray-500 shadow-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">Nome Completo</th>
                  <th className="text-left px-4 py-2">Nome de Exibição</th>
                  <th className="text-left px-4 py-2">Endereço de Email</th>
                  <th className="text-left px-4 py-2">Tipo de Conta</th>
                  <th className="text-left px-4 py-2">Autenticação</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full text-xs font-bold">
                        {member.fullName.charAt(0)}
                      </div>
                      {member.fullName}
                    </td>
                    <td className="px-4 py-2">{member.displayName}</td>
                    <td className="px-4 py-2">{member.email}</td>
                    <td className="px-4 py-2">{member.accountType}</td>
                    <td className="px-4 py-2">{member.authentication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InviteModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
