"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";
import { FiDownload, FiFileText, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';
type ExportStatus = 'idle' | 'processing' | 'completed' | 'error';

interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  date: string;
  status: 'completed' | 'failed';
  size: string;
  downloadUrl?: string;
}

export default function ExportSettings() {
  const pathname = usePathname();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [includeComments, setIncludeComments] = useState(true);
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const formatOptions = [
    { value: 'csv', label: 'CSV (Excel, Google Sheets, etc.)' },
    { value: 'json', label: 'JSON (Dados estruturados)' },
    { value: 'excel', label: 'Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF (Documento)' },
  ];

  const handleExport = async () => {
    if (exportStatus === 'processing') return;
    
    setExportStatus('processing');
    setError(null);
    
    try {
      // Simular processamento de exportação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados de exemplo para exportação
      const exportData = {
        tasks: [
          { id: 1, title: 'Tarefa 1', status: 'Em andamento', dueDate: '2023-12-01' },
          { id: 2, title: 'Tarefa 2', status: 'Concluída', dueDate: '2023-12-05' },
          { id: 3, title: 'Tarefa 3', status: 'Pendente', dueDate: '2023-12-10' },
        ],
        projects: [
          { id: 1, name: 'Projeto A', status: 'Ativo' },
          { id: 2, name: 'Projeto B', status: 'Concluído' },
        ],
        exportDate: new Date().toISOString(),
        includeComments,
        includeAttachments
      };

      let content = '';
      let mimeType = '';
      let fileExtension = '';

      // Preparar o conteúdo com base no formato selecionado
      switch (selectedFormat) {
        case 'csv':
          // Converter para CSV
          const headers = ['ID', 'Título', 'Status', 'Data de Vencimento'];
          const csvRows = [
            headers.join(','),
            ...exportData.tasks.map(task => 
              [task.id, `"${task.title}"`, task.status, task.dueDate].join(',')
            )
          ];
          content = csvRows.join('\n');
          mimeType = 'text/csv;charset=utf-8;';
          fileExtension = 'csv';
          break;
          
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json;charset=utf-8;';
          fileExtension = 'json';
          break;
          
        case 'excel':
          // Para Excel, usaremos CSV com extensão .xls para simplicidade
          // Em produção, considere usar uma biblioteca como xlsx
          const excelHeaders = ['ID', 'Título', 'Status', 'Data de Vencimento'];
          const excelRows = [
            excelHeaders.join('\t'),
            ...exportData.tasks.map(task => 
              [task.id, task.title, task.status, task.dueDate].join('\t')
            )
          ];
          content = excelRows.join('\n');
          mimeType = 'application/vnd.ms-excel;charset=utf-8;';
          fileExtension = 'xls';
          break;
          
        case 'pdf':
          // Para PDF, vamos criar um texto simples
          // Em produção, considere usar uma biblioteca como jspdf ou react-pdf
          const pdfContent = [
            'Relatório de Tarefas',
            '====================',
            `Data da Exportação: ${new Date().toLocaleString()}`,
            '\nTarefas:',
            ...exportData.tasks.map(task => 
              `- ${task.title} (${task.status}) - Vence em: ${task.dueDate}`
            )
          ];
          content = pdfContent.join('\n');
          mimeType = 'application/pdf;charset=utf-8;';
          fileExtension = 'txt'; // Usando .txt como fallback
          break;
      }

      // Criar o blob e o link para download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Criar um link temporário para o download
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `exportacao-${timestamp}.${fileExtension}`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Adicionar ao histórico
      const newExport: ExportHistoryItem = {
        id: Date.now().toString(),
        format: selectedFormat,
        date: new Date().toISOString(),
        status: 'completed',
        size: `${Math.round(content.length / 1024)} KB`,
        downloadUrl: url
      };
      
      setHistory(prev => [newExport, ...prev]);
      setExportStatus('completed');
      
      // Resetar status após 3 segundos
      setTimeout(() => setExportStatus('idle'), 3000);
      
    } catch (err) {
      console.error('Erro ao exportar:', err);
      setError('Ocorreu um erro ao processar a exportação. Tente novamente.');
      setExportStatus('error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar />

      {/* Sidebar de Configurações */}
      <aside className="w-64 border-r border-gray-200 bg-white p-4 space-y-1 text-sm">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Configurações
        </h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                pathname === link.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="pb-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Exportar Dados</h1>
            <p className="mt-2 text-sm text-gray-600">
              Exporte os dados do seu espaço de trabalho para análise externa ou backup.
            </p>
          </div>

          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Configurações de Exportação
              </h3>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="export-format" className="block text-sm font-medium text-gray-700">
                    Formato de Exportação
                  </label>
                  <select
                    id="export-format"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-6 pt-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="include-comments"
                        name="include-comments"
                        type="checkbox"
                        checked={includeComments}
                        onChange={(e) => setIncludeComments(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="include-comments" className="font-medium text-gray-700">
                        Incluir comentários
                      </label>
                      <p className="text-gray-500">Inclui todos os comentários nas tarefas exportadas.</p>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6 pt-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="include-attachments"
                        name="include-attachments"
                        type="checkbox"
                        checked={includeAttachments}
                        onChange={(e) => setIncludeAttachments(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="include-attachments" className="font-medium text-gray-700">
                        Incluir anexos
                      </label>
                      <p className="text-gray-500">
                        Inclui arquivos anexados nas tarefas. Isso pode aumentar significativamente o tamanho do arquivo.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="sm:col-span-6">
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiAlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Erro na exportação</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-6 pt-4">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exportStatus === 'processing'}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      exportStatus === 'processing'
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {exportStatus === 'processing' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </>
                    ) : exportStatus === 'completed' ? (
                      <>
                        <FiCheckCircle className="-ml-1 mr-2 h-4 w-4" />
                        Exportação concluída!
                      </>
                    ) : (
                      <>
                        <FiDownload className="-ml-1 mr-2 h-4 w-4" />
                        Exportar Dados
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico de Exportações */}
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Histórico de Exportações</h3>
            
            {history.length > 0 ? (
              <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Data
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Formato
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Tamanho
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                          {formatDate(item.date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.format.toUpperCase()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.size}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status === 'completed' ? 'Concluído' : 'Falhou'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {item.status === 'completed' && item.downloadUrl && (
                            <a
                              href={item.downloadUrl}
                              className="text-blue-600 hover:text-blue-900"
                              download
                            >
                              Baixar
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma exportação realizada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    As exportações que você criar aparecerão aqui.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
