"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
export default function WorkspaceSettings() {
  const pathname = usePathname();

  const [workspaceName, setWorkspaceName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [slug, setSlug] = useState("");

  const workspaceUrl = `kanban-tcc.vercel.app/${slug}`;

  useEffect(() => {
    const stored = localStorage.getItem("workspaceSelecionado");
    if (stored) {
      const parsed = JSON.parse(stored);
      setWorkspaceName(parsed.nome || "");
      setSlug(parsed.slug || "");
      setCompanySize(parsed.companySize || "");
    }

    async function fetchWorkspace() {
      try {
        const res = await fetch("/api/workspaces/current", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          setWorkspaceName(data.nome);
          setCompanySize(data.tamanhoEmpresa);
          setSlug(data.slug);

          localStorage.setItem(
            "workspaceSelecionado",
            JSON.stringify({
              nome: data.nome,
              slug: data.slug,
              companySize: data.tamanhoEmpresa,
            })
          );
        }
      } catch (err) {
        console.error("Erro ao carregar workspace:", err);
      }
    }

    fetchWorkspace();
  }, []);

  const links = [
    { href: `/${slug}/settings/general`, label: "Geral" },
    { href: `/${slug}/settings/members`, label: "Membros" },
    { href: `/${slug}/settings/exports`, label: "Exportações" }
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm">
        <h2 className="text-gray-500 dark:text-gray-400 font-semibold uppercase mb-2">
          Configurações
        </h2>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block w-full text-left px-3 py-2 rounded-md transition ${pathname === href
              ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
          >
            {label}
          </Link>
        ))}

      </aside>

      <main className="flex-1 p-10">
        <div className="mb-8 text-sm text-gray-600 dark:text-gray-300">
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {workspaceName}
          </span>{" "}
          &gt; Configurações
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-800 dark:bg-gray-700 text-white flex items-center justify-center rounded-md text-lg font-semibold">
              {typeof workspaceName === "string" && workspaceName.length > 0
                ? workspaceName.charAt(0).toUpperCase()
                : ""}
            </div>
            <div>
              <div className="text-xl font-semibold">{workspaceName}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">{workspaceUrl}</div>
              <button className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors">
                Enviar logotipo
              </button>
            </div>
          </div>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do workspace</label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value);
                const newSlug = e.target.value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                setSlug(newSlug);
              }}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tamanho da empresa</label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="1">Apenas Eu</option>
              <option value="5">1-5 pessoas</option>
              <option value="20">6-20 pessoas</option>
              <option value="50">21-50 pessoas</option>
              <option value="100">Mais de 50</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL do workspace</label>
            <input
              type="text"
              readOnly
              value={workspaceUrl}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-600 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
        </form>
        <div className="mt-6">
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/workspaces/current", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    name: workspaceName,
                    companySize,
                    slug,
                  }),
                });

                const data = await res.json();
                if (res.ok) {
                  localStorage.setItem(
                    "workspaceSelecionado",
                    JSON.stringify({
                      nome: workspaceName,
                      slug: data.slug,
                      companySize: companySize,
                    })
                  );

                  if (data.slug !== slug) {
                    window.location.href = `/${data.slug}/settings/general`;
                  } else {
                    window.location.reload();
                  }
                } else {
                  alert("Erro ao atualizar: " + data.error);
                }
              } catch (err) {
                console.error(err);
                alert("Erro ao atualizar workspace.");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Atualizar workspace
          </button>
        </div>
        <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
            Área de perigo
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            A exclusão é permanente. Todo o conteúdo será removido e não poderá ser recuperado.
          </p>
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (confirm('Tem certeza que deseja excluir permanentemente este workspace? Esta ação não pode ser desfeita.')) {
                try {
                  const workspacesRes = await fetch('/api/workspaces', {
                    credentials: 'include',
                  });
                  interface Workspace {
                    id: number;
                    name: string;
                    slug: string;
                  }

                  const data = await workspacesRes.json();
                  const workspaces: Workspace[] = Array.isArray(data) ? data : data.workspaces || [];
                  const otherWorkspace = workspaces.find((ws) => ws.slug !== slug);

                  const deleteRes = await fetch(`/api/workspaces/${slug}`, {
                    method: 'DELETE',
                    credentials: 'include',
                  });

                  if (deleteRes.ok) {
                    if (otherWorkspace) {
                      window.location.href = `/${otherWorkspace.slug}/dashboard`;
                    } else {
                      window.location.href = '/create-workspace';
                    }
                  } else {
                    const error = await deleteRes.json();
                    alert(`Erro ao excluir workspace: ${error.message || 'Tente novamente mais tarde.'}`);
                  }
                } catch (err) {
                  console.error('Erro ao excluir workspace:', err);
                  alert('Ocorreu um erro ao tentar excluir o workspace.');
                }
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Excluir este workspace
          </button>
        </div>
      </main>
    </div>
  );
}