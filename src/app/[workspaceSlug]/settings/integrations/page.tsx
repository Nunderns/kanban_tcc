"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiGithub,
  FiGitlab,
  FiSlack,
  FiZap,
  FiCheck,
  FiPlus,
  FiSettings,
  FiExternalLink,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "code" | "chat" | "productivity" | "other";
  connected: boolean;
  status?: 'connected' | 'pending' | 'error';
  lastSync?: string;
  action: "connect" | "configure" | "disconnect" | "reconnect";
}

export default function IntegrationsSettings() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "github",
      name: "GitHub",
      description: "Conecte seus repositórios e sincronize issues e pull requests",
      icon: <FiGithub className="h-5 w-5" />,
      category: "code",
      connected: true,
      status: "connected",
      lastSync: "Há 5 minutos",
      action: "configure",
    },
    {
      id: "gitlab",
      name: "GitLab",
      description: "Conecte seus repositórios e sincronize issues e merge requests",
      icon: <FiGitlab className="h-5 w-5" />,
      category: "code",
      connected: false,
      action: "connect",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Receba notificações e atualizações diretamente no Slack",
      icon: <FiSlack className="h-5 w-5" />,
      category: "chat",
      connected: true,
      status: "connected",
      lastSync: "Há 1 hora",
      action: "configure",
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Conecte com milhares de aplicativos diferentes",
      icon: <FiZap className="h-5 w-5" />,
      category: "productivity",
      connected: false,
      action: "connect",
    },
    {
      id: "jira",
      name: "Jira",
      description: "Sincronize tarefas e projetos com o Jira",
      icon: <FiSettings className="h-5 w-5" />,
      category: "productivity",
      connected: false,
      action: "connect",
    },
    {
      id: "trello",
      name: "Trello",
      description: "Importe quadros e cartões do Trello",
      icon: <FiSettings className="h-5 w-5" />,
      category: "productivity",
      connected: false,
      action: "connect",
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Anexe arquivos diretamente do Google Drive",
      icon: <FiSettings className="h-5 w-5" />,
      category: "productivity",
      connected: false,
      action: "connect",
    },
    {
      id: "microsoft-teams",
      name: "Microsoft Teams",
      description: "Receba notificações e atualizações no Teams",
      icon: <FiSettings className="h-5 w-5" />,
      category: "chat",
      connected: false,
      action: "connect",
    },
  ]);

  const workspaceSlug = pathname?.split('/')[1];
  const links = [
    { href: `/${workspaceSlug}/settings`, label: "Geral" },
    { href: `/${workspaceSlug}/settings/members`, label: "Membros" },
    { href: `/${workspaceSlug}/settings/project-states`, label: "Estados do Projeto" },
    { href: `/${workspaceSlug}/settings/integrations`, label: "Integrações" },
    { href: `/${workspaceSlug}/settings/imports`, label: "Importações" },
    { href: `/${workspaceSlug}/settings/exports`, label: "Exportações" },
    { href: `/${workspaceSlug}/settings/webhooks`, label: "Webhooks" },
    { href: `/${workspaceSlug}/settings/api-tokens`, label: "Tokens de API" },
    { href: `/${workspaceSlug}/settings/worklogs`, label: "Registros de Trabalho" },
    { href: `/${workspaceSlug}/settings/teamspaces`, label: "Espaços de Equipe" },
    { href: `/${workspaceSlug}/settings/initiatives`, label: "Iniciativas" },
    { href: `/${workspaceSlug}/settings/customers`, label: "Clientes" },
    { href: `/${workspaceSlug}/settings/templates`, label: "Modelos" },
  ];

  const categories = [
    { id: "all", name: "Todas", count: integrations.length },
    { id: "code", name: "Código", count: integrations.filter((i) => i.category === "code").length },
    { id: "chat", name: "Mensagens", count: integrations.filter((i) => i.category === "chat").length },
    { id: "productivity", name: "Produtividade", count: integrations.filter((i) => i.category === "productivity").length },
    { id: "other", name: "Outras", count: integrations.filter((i) => i.category === "other").length },
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = integration.name.toLowerCase().includes(q) || integration.description.toLowerCase().includes(q);
    const matchesCategory = activeCategory === "all" || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleIntegrationAction = (id: string, action: string) => {
    if (action === "connect") {
      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? { ...integration, connected: true, status: "connected", lastSync: "Agora mesmo", action: "configure" }
            : integration
        )
      );
    } else if (action === "disconnect") {
      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? { ...integration, connected: false, status: undefined, lastSync: undefined, action: "connect" }
            : integration
        )
      );
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
            <FiCheck className="mr-1 h-3 w-3" /> Conectado
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
            <FiClock className="mr-1 h-3 w-3" /> Pendente
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
            <FiAlertCircle className="mr-1 h-3 w-3" /> Erro
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = (integration: Integration) => {
    switch (integration.action) {
      case "connect":
        return (
          <button
            onClick={() => handleIntegrationAction(integration.id, "connect")}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-1 h-3 w-3" /> Conectar
          </button>
        );
      case "configure":
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleIntegrationAction(integration.id, "configure")}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiSettings className="mr-1 h-3 w-3" /> Configurar
            </button>
            <button
              onClick={() => handleIntegrationAction(integration.id, "disconnect")}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Desconectar
            </button>
          </div>
        );
      case "reconnect":
        return (
          <button
            onClick={() => handleIntegrationAction(integration.id, "connect")}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Reconectar
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-1 text-sm">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Configurações</h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                pathname === link.href
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Integrações</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Conecte suas ferramentas favoritas para melhorar seu fluxo de trabalho.</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="relative rounded-md shadow-sm w-full sm:max-w-xs">
              <input
                type="text"
                className="block w-full pr-10 sm:text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar integrações..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="mt-4 sm:mt-0">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      activeCategory === category.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <FiSettings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nenhuma integração encontrada</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tente ajustar sua busca ou filtro para encontrar o que procura.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredIntegrations.map((integration) => (
                    <li key={integration.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {integration.icon}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{integration.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                            {integration.connected && integration.lastSync && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">Última sincronização: {integration.lastSync}</div>
                            )}
                            {integration.status && getStatusBadge(integration.status)}
                            {getActionButton(integration)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Precisa de uma integração diferente?</h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">API Pública</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  <p>Nossa API RESTful permite que você crie integrações personalizadas com qualquer ferramenta ou serviço.</p>
                </div>
                <div className="mt-5">
                  <a
                    href="/api-docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver documentação da API
                    <FiExternalLink className="ml-2 -mr-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
