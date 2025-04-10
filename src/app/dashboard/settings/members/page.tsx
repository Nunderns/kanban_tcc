"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

const membersMock = [
  {
    id: 1,
    fullName: "Henri Okayama",
    displayName: "henri.okayama",
    email: "henri.okayama@gmail.com",
    accountType: "Admin",
    authentication: "Email",
  },
];

const settingsMenu = [
  "Geral",
  "Membros",
  "Status dos Projetos",
  "Extrado e Planos",
  "Integrações",
  "Importações",
  "Exportações",
  "Webhooks",
  "API Tokens",
  "Worklogs",
  "Espaço de Equipe",
  "Initiatives",
  "Clientes",
  "Templates",
];

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("Membros");

  const filteredMembers = membersMock.filter((member) =>
    member.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1">
        {/* Sidebar de Configurações */}
        <aside className="w-64 bg-neutral-100 p-6 border-r border-neutral-700 text-gray-800">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">CONFIGURAÇÕES</h2>
          <ul className="space-y-2 text-sm">
            {settingsMenu.map((item) => {
              const path = `/dashboard/settings/${item.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <li key={item}>
                  <Link
                    href={path}
                    className={`block w-full text-left px-3 py-2 rounded-md transition ${
                      selected === item
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 p-6 overflow-auto bg-white text-gray-900">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-semibold">
              Members <span className="text-sm bg-gray-200 px-2 py-0.5 rounded ml-1">{filteredMembers.length}</span>
            </h1>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
              <Plus size={16} /> Add member
            </button>
          </div>

          {/* Busca */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-1/3 bg-white border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-900 placeholder-gray-500 shadow-sm"
            />
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">Nome completo</th>
                  <th className="text-left px-4 py-2">Nome de exibição</th>
                  <th className="text-left px-4 py-2">Endereço de Email</th>
                  <th className="text-left px-4 py-2">Tipo de conta</th>
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
                      <div className="w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full text-xs font-bold">
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
    </div>
  );
}
