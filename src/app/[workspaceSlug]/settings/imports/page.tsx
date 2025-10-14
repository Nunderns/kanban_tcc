"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiUpload, FiFileText, FiAlertTriangle, FiCheckCircle, FiDownload } from "react-icons/fi";

type ImportFormat = "csv" | "json" | "excel";
type ImportStatus = "idle" | "processing" | "completed" | "error";

interface ImportHistoryItem {
  id: string;
  fileName: string;
  format: ImportFormat;
  date: string;
  status: "completed" | "failed" | "processing";
  importedItems?: number;
  errors?: number;
}

export default function ImportSettings() {
  const pathname = usePathname();
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>("csv");
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [filePreview, setFilePreview] = useState<Record<string, string>[]>([]);

  // Extrai o workspaceSlug da URL atual
  const workspaceSlug = pathname?.split('/')[1];
  
  const links = [
    { href: `/${workspaceSlug}/settings`, label: "Geral" },
    { href: `/${workspaceSlug}/settings/members`, label: "Membros" },
    { href: `/${workspaceSlug}/settings/project-states`, label: "Estados do Projeto" },
    { href: `/${workspaceSlug}/settings/imports`, label: "Importações" },
    { href: `/${workspaceSlug}/settings/exports`, label: "Exportações" }
  ];

  const formatOptions = [
    { value: "csv", label: "CSV (Excel, Google Sheets, etc.)" },
    { value: "json", label: "JSON (Dados estruturados)" },
    { value: "excel", label: "Excel (.xlsx, .xls)" },
  ];

  const systemFields = [
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
    "assignee",
    "project",
    "labels",
    "startDate",
    "estimatedTime",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      simulateFileRead();
    }
  };

  const simulateFileRead = () => {
    setTimeout(() => {
      const mockHeaders = ["title", "description", "status", "dueDate"];
      setAvailableFields(mockHeaders);
      const initialMapping: Record<string, string> = {};
      mockHeaders.forEach((header) => {
        initialMapping[header] = systemFields.includes(header) ? header : "";
      });
      setMapping(initialMapping);
      setFilePreview([
        { title: "Tarefa de Exemplo", description: "Descrição da tarefa", status: "Pendente", dueDate: "2023-12-31" },
        { title: "Outra Tarefa", description: "Outra descrição", status: "Em Andamento", dueDate: "2023-12-15" },
      ]);
    }, 500);
  };

  const handleMappingChange = (fileField: string, systemField: string) => {
    setMapping((prev) => ({ ...prev, [fileField]: systemField }));
  };

  const handleImport = async () => {
    if (!file || importStatus === "processing") return;
    setImportStatus("processing");
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const newImport: ImportHistoryItem = {
        id: Date.now().toString(),
        fileName: file.name,
        format: selectedFormat as ImportFormat,
        date: new Date().toISOString(),
        status: "completed",
        importedItems: 15,
        errors: 2,
      };
      setHistory((prev) => [newImport, ...prev]);
      setImportStatus("completed");
      setTimeout(() => {
        setImportStatus("idle");
        setFile(null);
        setFilePreview([]);
        setAvailableFields([]);
        setMapping({});
      }, 3000);
    } catch (err) {
      console.error("Erro ao importar:", err);
      setError("Ocorreu um erro ao processar a importação. Verifique o formato do arquivo e tente novamente.");
      setImportStatus("error");
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
        <div className="max-w-4xl mx-auto">
          <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Importar Dados</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Importe dados de outras ferramentas para o seu espaço de trabalho.</p>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Configurações de Importação</h3>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="import-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Formato do Arquivo</label>
                  <select
                    id="import-format"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as ImportFormat)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    disabled={!!file}
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arquivo para Importação</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md bg-white dark:bg-gray-900">
                    <div className="space-y-1 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-300">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none">
                          <span>Enviar um arquivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept={selectedFormat === "excel" ? ".xlsx,.xls" : `.${selectedFormat}`}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedFormat === "excel" ? "XLSX, XLS até 10MB" : `${selectedFormat.toUpperCase()} até 10MB`}</p>
                    </div>
                  </div>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Arquivo selecionado: <span className="font-medium">{file.name}</span> <span className="text-gray-500 dark:text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </p>
                  )}
                </div>

                {availableFields.length > 0 && (
                  <div className="sm:col-span-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Mapeamento de Campos</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Mapeie as colunas do seu arquivo para os campos do sistema.</p>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campo no Arquivo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mapear para</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {availableFields.map((field) => (
                            <tr key={field}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{field}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={mapping[field] || ""}
                                  onChange={(e) => handleMappingChange(field, e.target.value)}
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                  <option value="">-- Não importar --</option>
                                  {systemFields.map((sysField) => (
                                    <option key={sysField} value={sysField}>
                                      {sysField}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {filePreview.length > 0 && (
                  <div className="sm:col-span-6 pt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">Pré-visualização</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Visualização dos primeiros registros do seu arquivo.</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {availableFields.map((field) => (
                              <th key={field} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{field}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {filePreview.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {availableFields.map((field) => (
                                <td key={`${rowIndex}-${field}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row[field] || "-"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="sm:col-span-6">
                    <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-700">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiAlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Erro na importação</h3>
                          <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!file || importStatus === "processing"}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      !file || importStatus === "processing"
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    {importStatus === "processing" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </>
                    ) : importStatus === "completed" ? (
                      <>
                        <FiCheckCircle className="-ml-1 mr-2 h-4 w-4" />
                        Importação concluída!
                      </>
                    ) : (
                      <>
                        <FiUpload className="-ml-1 mr-2 h-4 w-4" />
                        Iniciar Importação
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Histórico de Importações</h3>

            {history.length > 0 ? (
              <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Data</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Arquivo</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Itens Importados</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-300 sm:pl-6">{formatDate(item.date)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center">
                            <FiFileText className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                            <span className="truncate max-w-xs">{item.fileName}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{item.importedItems} itens{item.errors ? ` (${item.errors} erros)` : ""}</td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                : item.status === "processing"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                            }`}
                          >
                            {item.status === "completed" ? "Concluído" : item.status === "processing" ? "Processando" : "Falhou"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <FiDownload className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nenhuma importação realizada</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">As importações que você realizar aparecerão aqui.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
