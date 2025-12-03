"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiDownload, FiFileText, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import jsPDF from "jspdf";

type ExportFormat = "csv" | "pdf";
type ExportStatus = "idle" | "processing" | "completed" | "error";

interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  date: string;
  status: "completed" | "failed";
  size: string;
  downloadUrl?: string;
}

interface ExportTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  dueDate: string | null;
  module: string | null;
  cycle: string | null;
  assignees: string[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
  project: string | null;
  creator: string;
}

interface ExportProject {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
}

interface ExportWorkspace {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  owner: string;
  memberCount: number;
  taskCount: number;
}

export default function ExportSettings() {
  const pathname = usePathname();
  const workspaceSlug = pathname.split('/')[1];
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [includeComments, setIncludeComments] = useState(true);
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const links = [
    { href: `/${workspaceSlug}/settings/general`, label: "Geral" },
    { href: `/${workspaceSlug}/settings/members`, label: "Membros" },
    { href: `/${workspaceSlug}/settings/exports`, label: "Exportações" }
  ];

  const formatOptions = [
    { value: "csv", label: "CSV (Excel, Google Sheets, etc.)" },
    { value: "pdf", label: "PDF (Documento)" },
  ];

  const handleExport = async () => {
    if (exportStatus === "processing") return;
    setExportStatus("processing");
    setError(null);

    try {
      const response = await fetch('/api/export');

      if (!response.ok) {
        throw new Error(`Failed to fetch export data: ${response.status}`);
      }

      const exportData = await response.json();

      let content = "";
      let mimeType = "";
      let fileExtension = "";
      let blob: Blob | null = null;

      switch (selectedFormat) {
        case "csv": {
          const csvSections = [];

          const taskHeaders = [
            "ID", "Título", "Descrição", "Status", "Prioridade",
            "Data de Início", "Data de Vencimento", "Responsáveis",
            "Etiquetas", "Projeto", "Criador", "Data de Criação", "Data de Atualização"
          ];

          const taskRows = exportData.tasks.map((task: ExportTask) => [
            task.id,
            `"${task.title.replace(/"/g, '""')}"`,
            `"${(task.description || '').replace(/"/g, '""')}"`,
            task.status,
            task.priority,
            task.startDate ? new Date(task.startDate).toLocaleDateString('pt-BR') : "",
            task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : "",
            `"${task.module || ''}"`,
            `"${task.cycle || ''}"`,
            `"${(task.assignees || []).join('; ')}"`,
            `"${(task.labels || []).join('; ')}"`,
            `"${task.project || ''}"`,
            `"${task.creator}"`,
            new Date(task.createdAt).toLocaleDateString('pt-BR'),
            new Date(task.updatedAt).toLocaleDateString('pt-BR')
          ].join(","));

          csvSections.push("--- TAREFAS ---");
          csvSections.push(taskHeaders.join(","));
          csvSections.push(...taskRows);
          csvSections.push("");

          if (exportData.projects.length > 0) {
            const projectHeaders = [
              "ID", "Nome", "Descrição", "Quantidade de Tarefas", "Data de Criação", "Data de Atualização"
            ];

            const projectRows = exportData.projects.map((project: ExportProject) => [
              project.id,
              `"${project.name.replace(/"/g, '""')}"`,
              `"${(project.description || '').replace(/"/g, '""')}"`,
              project.taskCount,
              new Date(project.createdAt).toLocaleDateString('pt-BR'),
              new Date(project.updatedAt).toLocaleDateString('pt-BR')
            ].join(","));

            csvSections.push("--- PROJETOS ---");
            csvSections.push(projectHeaders.join(","));
            csvSections.push(...projectRows);
            csvSections.push("");
          }

          if (exportData.workspaces.length > 0) {
            const workspaceHeaders = [
              "ID", "Nome", "Descrição", "Dono", "Quantidade de Membros", "Quantidade de Tarefas", "Data de Criação", "Data de Atualização"
            ];

            const workspaceRows = exportData.workspaces.map((workspace: ExportWorkspace) => [
              workspace.id,
              `"${workspace.name.replace(/"/g, '""')}"`,
              `"${(workspace.description || '').replace(/"/g, '""')}"`,
              `"${workspace.owner}"`,
              workspace.memberCount,
              workspace.taskCount,
              new Date(workspace.createdAt).toLocaleDateString('pt-BR'),
              new Date(workspace.updatedAt).toLocaleDateString('pt-BR')
            ].join(","));

            csvSections.push("--- WORKSPACES ---");
            csvSections.push(workspaceHeaders.join(","));
            csvSections.push(...workspaceRows);
          }

          csvSections.push("--- RESUMO ---");
          csvSections.push(`"Data da Exportação","${new Date(exportData.exportDate).toLocaleString('pt-BR')}"`);
          csvSections.push(`"Usuário","${exportData.user.name || exportData.user.email}"`);
          csvSections.push(`"Email","${exportData.user.email || ''}"`);
          csvSections.push(`"Total de Tarefas",${exportData.tasks.length}`);
          csvSections.push(`"Total de Projetos",${exportData.projects.length}`);
          csvSections.push(`"Total de Workspaces",${exportData.workspaces.length}`);

          content = "\uFEFF" + csvSections.join("\n");
          mimeType = "text/csv;charset=utf-8;";
          fileExtension = "csv";
          break;
        }
        case "pdf": {
          const doc = new jsPDF();
          doc.setFont('helvetica');
          doc.setFillColor(59, 130, 246);
          doc.rect(0, 0, 210, 40, 'F');
          doc.setFontSize(20);
          doc.setTextColor(255, 255, 255);
          doc.text("Relatorio de Dados do Sistema", 20, 25);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.text(`Usuario: ${exportData.user.name || exportData.user.email}`, 20, 50);
          doc.text(`Email: ${exportData.user.email}`, 20, 57);
          doc.text(`Data da Exportacao: ${new Date(exportData.exportDate).toLocaleString('pt-BR')}`, 20, 64);
          doc.setDrawColor(200, 200, 200);
          doc.line(20, 70, 190, 70);
          let yPosition = 80;
          doc.setFillColor(248, 250, 252);
          doc.rect(15, yPosition - 5, 180, 35, 'F');

          doc.setFontSize(16);
          doc.setTextColor(31, 41, 55);
          doc.text("Resumo", 20, yPosition);
          yPosition += 10;

          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Total de Tarefas: ${exportData.tasks.length}`, 25, yPosition);
          yPosition += 8;
          doc.text(`Total de Projetos: ${exportData.projects.length}`, 25, yPosition);
          yPosition += 8;
          doc.text(`Total de Workspaces: ${exportData.workspaces.length}`, 25, yPosition);
          yPosition += 15;

          if (exportData.tasks.length > 0) {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 30;
            }

            doc.setFontSize(16);
            doc.setTextColor(31, 41, 55);
            doc.text("Tarefas", 20, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            doc.setFillColor(241, 245, 249);
            doc.rect(15, yPosition - 5, 180, 10, 'F');

            const headers = ["ID", "Titulo", "Status", "Prioridade", "Vencimento", "Projeto"];
            const colWidths = [15, 60, 25, 20, 25, 35];
            let xPosition = 20;

            headers.forEach((header, index) => {
              doc.setFont('helvetica', 'bold');
              doc.text(header, xPosition, yPosition);
              xPosition += colWidths[index];
            });
            doc.setFont('helvetica', 'normal');
            yPosition += 8;

            doc.setDrawColor(59, 130, 246);
            doc.line(15, yPosition - 2, 195, yPosition - 2);
            yPosition += 3;

            exportData.tasks.forEach((task: ExportTask, index: number) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 30;

                doc.setFillColor(241, 245, 249);
                doc.rect(15, yPosition - 5, 180, 10, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                xPosition = 20;
                headers.forEach((header, index) => {
                  doc.text(header, xPosition, yPosition);
                  xPosition += colWidths[index];
                });
                doc.setFont('helvetica', 'normal');
                yPosition += 8;
                doc.setDrawColor(59, 130, 246);
                doc.line(15, yPosition - 2, 195, yPosition - 2);
                yPosition += 3;
              }

              if (index % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(15, yPosition - 3, 180, 8, 'F');
              }

              xPosition = 20;

              const truncatedTitle = task.title.length > 35 ? task.title.substring(0, 32) + "..." : task.title;
              const truncatedProject = (task.project || "").length > 20 ? (task.project || "").substring(0, 17) + "..." : task.project || "";

              if (task.status === "DONE") {
                doc.setTextColor(34, 197, 94);
              } else if (task.status === "IN_PROGRESS") {
                doc.setTextColor(59, 130, 246);
              } else if (task.status === "TODO") {
                doc.setTextColor(251, 191, 36);
              } else {
                doc.setTextColor(107, 114, 128);
              }

              doc.text(String(task.id), xPosition, yPosition);
              xPosition += colWidths[0];

              doc.setTextColor(0, 0, 0);
              doc.text(truncatedTitle, xPosition, yPosition);
              xPosition += colWidths[1];

              if (task.status === "DONE") {
                doc.setTextColor(34, 197, 94);
              } else if (task.status === "IN_PROGRESS") {
                doc.setTextColor(59, 130, 246);
              } else if (task.status === "TODO") {
                doc.setTextColor(251, 191, 36);
              } else {
                doc.setTextColor(107, 114, 128);
              }
              doc.text(task.status, xPosition, yPosition);
              xPosition += colWidths[2];

              doc.setTextColor(0, 0, 0);
              if (task.priority === "HIGH") {
                doc.setTextColor(239, 68, 68);
              } else if (task.priority === "MEDIUM") {
                doc.setTextColor(251, 191, 36);
              } else if (task.priority === "LOW") {
                doc.setTextColor(34, 197, 94);
              }
              doc.text(task.priority, xPosition, yPosition);
              xPosition += colWidths[3];

              doc.setTextColor(0, 0, 0);
              doc.text(task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : "", xPosition, yPosition);
              xPosition += colWidths[4];

              doc.text(truncatedProject, xPosition, yPosition);
              yPosition += 8;
            });

            yPosition += 10;
          }

          if (exportData.projects.length > 0) {
            doc.addPage();
            yPosition = 30;

            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setFontSize(18);
            doc.setTextColor(255, 255, 255);
            doc.text("Projetos", 20, 25);

            doc.setTextColor(0, 0, 0);
            yPosition = 50;

            exportData.projects.forEach((project: ExportProject) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 30;
              }

              doc.setFillColor(248, 250, 252);
              doc.rect(15, yPosition - 5, 180, 25, 'F');

              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.text(`${project.name}`, 20, yPosition);
              doc.setFont('helvetica', 'normal');
              yPosition += 8;

              if (project.description) {
                const truncatedDesc = project.description.length > 80 ? project.description.substring(0, 77) + "..." : project.description;
                doc.setFontSize(10);
                doc.text(`Descricao: ${truncatedDesc}`, 20, yPosition);
                yPosition += 8;
              }

              doc.setFontSize(10);
              doc.text(`Tarefas: ${project.taskCount}`, 20, yPosition);
              doc.text(`Criado em: ${new Date(project.createdAt).toLocaleDateString('pt-BR')}`, 80, yPosition);
              yPosition += 15;
            });
          }

          if (exportData.workspaces.length > 0) {
            doc.addPage();
            yPosition = 30;

            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setFontSize(18);
            doc.setTextColor(255, 255, 255);
            doc.text("Workspaces", 20, 25);

            doc.setTextColor(0, 0, 0);
            yPosition = 50;

            exportData.workspaces.forEach((workspace: ExportWorkspace) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 30;
              }

              doc.setFillColor(248, 250, 252);
              doc.rect(15, yPosition - 5, 180, 30, 'F');

              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.text(`${workspace.name}`, 20, yPosition);
              doc.setFont('helvetica', 'normal');
              yPosition += 8;

              if (workspace.description) {
                const truncatedDesc = workspace.description.length > 80 ? workspace.description.substring(0, 77) + "..." : workspace.description;
                doc.setFontSize(10);
                doc.text(`Descricao: ${truncatedDesc}`, 20, yPosition);
                yPosition += 8;
              }

              doc.setFontSize(10);
              doc.text(`Dono: ${workspace.owner}`, 20, yPosition);
              yPosition += 8;
              doc.text(`Membros: ${workspace.memberCount}`, 20, yPosition);
              doc.text(`Tarefas: ${workspace.taskCount}`, 80, yPosition);
              yPosition += 15;
            });
          }

          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.text(`Pagina ${i} de ${pageCount}`, 170, 285);
            doc.text(`Gerado por Kanban TCC`, 20, 285);
          }

          blob = doc.output('blob');
          mimeType = "application/pdf";
          fileExtension = "pdf";
          break;
        }
      }

      const finalBlob = blob || new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(finalBlob);

      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `exportacao-${timestamp}.${fileExtension}`;
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const newExport: ExportHistoryItem = {
        id: Date.now().toString(),
        format: selectedFormat,
        date: new Date().toISOString(),
        status: "completed",
        size: `${Math.max(1, Math.round((blob ? blob.size : content.length) / 1024))} KB`,
        downloadUrl: url,
      };

      setHistory((prev) => [newExport, ...prev]);
      setExportStatus("completed");
      setTimeout(() => setExportStatus("idle"), 3000);
    } catch (err) {
      console.error("Erro ao exportar:", err);
      setError("Ocorreu um erro ao processar a exportação. Tente novamente.");
      setExportStatus("error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${pathname === link.href
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
        <div className="max-w-4xl mx-auto">
          <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exportar Dados</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Exporte os dados do seu espaço de trabalho para análise externa ou backup.</p>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Configurações de Exportação</h3>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="export-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Formato de Exportação</label>
                  <select
                    id="export-format"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-700 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="include-comments" className="font-medium text-gray-700 dark:text-gray-300">Incluir comentários</label>
                      <p className="text-gray-500 dark:text-gray-400">Inclui todos os comentários nas tarefas exportadas.</p>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="sm:col-span-6">
                    <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-700">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiAlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Erro na exportação</h3>
                          <div className="mt-2 text-sm text-red-700 dark:text-red-200">
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
                    disabled={exportStatus === "processing"}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${exportStatus === "processing"
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                  >
                    {exportStatus === "processing" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </>
                    ) : exportStatus === "completed" ? (
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

          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Histórico de Exportações</h3>

            {history.length > 0 ? (
              <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Data</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Formato</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tamanho</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-300 sm:pl-6">{formatDate(item.date)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{item.format.toUpperCase()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{item.size}</td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                            }`}>{item.status === "completed" ? "Concluído" : "Falhou"}</span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {item.status === "completed" && item.downloadUrl && (
                            <a href={item.downloadUrl} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" download>
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
              <div className="mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nenhuma exportação realizada</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">As exportações que você criar aparecerão aqui.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
