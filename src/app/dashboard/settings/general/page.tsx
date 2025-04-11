"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default function WorkspaceSettings() {
  const pathname = usePathname();

  const [workspaceName, setWorkspaceName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [slug, setSlug] = useState("");

  const workspaceUrl = `localhost:3000/${slug}`;

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const res = await fetch("/api/workspaces/current");
        const data = await res.json();
        setWorkspaceName(data.nome);
        setCompanySize(data.tamanhoEmpresa);
        setSlug(data.slug);
      } catch (err) {
        console.error("Erro ao carregar workspace:", err);
      }
    }

    fetchWorkspace();
  }, []);

  const links = [
    { href: "/dashboard/settings/general", label: "Geral" },
    { href: "/dashboard/settings/members", label: "Membros" },
    { href: "/dashboard/settings/project-states", label: "Estados do Projeto" },
    { href: "/dashboard/settings/billing-and-plans", label: "Faturamento e Planos" },
    { href: "/dashboard/settings/integrations", label: "Integrações" },
    { href: "/dashboard/settings/imports", label: "Importações" },
    { href: "/dashboard/settings/exports", label: "Exportações" },
    { href: "/dashboard/settings/webhooks", label: "Webhooks" },
    { href: "/dashboard/settings/api-tokens", label: "Tokens de API" },
    { href: "/dashboard/settings/worklogs", label: "Registros de Trabalho" },
    { href: "/dashboard/settings/teamspaces", label: "Espaços de Equipe" },
    { href: "/dashboard/settings/initiatives", label: "Iniciativas" },
    { href: "/dashboard/settings/customers", label: "Clientes" },
    { href: "/dashboard/settings/templates", label: "Modelos" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex">
      <Sidebar />

      {/* Sidebar de Configurações */}
      <aside className="w-64 border-r border-gray-200 p-4 space-y-2 text-sm">
        <h2 className="text-gray-500 font-semibold uppercase mb-2">Configurações</h2>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block w-full text-left px-3 py-2 rounded-md transition ${
              pathname === href
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-600">
          <span className="text-gray-800 font-medium">{workspaceName}</span> &gt; Configurações
        </div>

        {/* Header com ícone da letra inicial */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            {/* Bloco com letra inicial */}
            <div className="w-10 h-10 bg-gray-800 text-white flex items-center justify-center rounded-md text-lg font-semibold">
            {typeof workspaceName === "string" && workspaceName.length > 0
            ? workspaceName.charAt(0).toUpperCase()
            : ""}
            </div>

            {/* Nome e URL */}
            <div>
            <div className="text-xl font-semibold">{workspaceName}</div>
            <div className="text-sm text-blue-600">{workspaceUrl}</div>
            <button className="text-xs text-blue-500 mt-1 hover:underline">Enviar logotipo</button>
            </div>
        </div>
        </div>

        {/* Formulário */}
        <form className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Nome do workspace</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Tamanho da empresa</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            >
              <option>Just myself</option>
              <option>1-5 pessoas</option>
              <option>6-20 pessoas</option>
              <option>21-50 pessoas</option>
              <option>Mais de 50</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">URL do workspace</label>
            <input
              type="text"
              readOnly
              value={workspaceUrl}
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
            />
          </div>
        </form>

        {/* Botão */}
        <div className="mt-6">
        <button
            onClick={async () => {
                try {
                const res = await fetch("/api/workspaces/current", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                    name: workspaceName,
                    companySize: companySize,
                    }),
                });

                const data = await res.json();
                if (res.ok) {
                    alert("Workspace atualizado com sucesso!");
                } else {
                    alert("Erro ao atualizar: " + data.error);
                }
                } catch (err) {
                console.error(err);
                alert("Erro ao atualizar workspace.");
                }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
            >
            Atualizar workspace
            </button>
        </div>

        {/* Excluir workspace */}
        <div className="mt-10 border-t pt-6">
          <p className="text-sm text-red-600 font-medium mb-2">Excluir este workspace</p>
          <button className="text-sm text-gray-700 hover:text-red-600 transition">
            Mostrar opções de exclusão
          </button>
        </div>
      </main>
    </div>
  );
}
