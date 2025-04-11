"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react"; // ✅ IMPORT NECESSÁRIO

export default function CriarEspacoTrabalho() {
  const { data: session } = useSession(); // ✅ OK após import
  const [nomeEspaco, setNomeEspaco] = useState("");
  const [urlEspaco, setUrlEspaco] = useState("");
  const [usuarios, setUsuarios] = useState("");

  const [erros, setErros] = useState({
    nome: false,
    url: false,
    usuarios: false,
  });

  const router = useRouter();

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setNomeEspaco(nome);
    setUrlEspaco(nome.toLowerCase().trim().replace(/\s+/g, "-"));

    if (erros.nome || erros.url) {
      setErros((prev) => ({ ...prev, nome: false, url: false }));
    }
  };

  const handleBlur = (campo: keyof typeof erros) => {
    if (campo === "nome" && nomeEspaco.trim() === "") {
      setErros((prev) => ({ ...prev, nome: true, url: true }));
    }
    if (campo === "usuarios" && usuarios.trim() === "") {
      setErros((prev) => ({ ...prev, usuarios: true }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const camposInvalidos = {
      nome: !nomeEspaco.trim(),
      url: !urlEspaco.trim(),
      usuarios: !usuarios.trim(),
    };

    setErros(camposInvalidos);

    const hasErros = Object.values(camposInvalidos).some((v) => v);
    if (hasErros) return;

    // 🔧 Simular criação de workspace
    const workspaceCriado = {
      nome: nomeEspaco,
      slug: urlEspaco,
      usuarios,
    };

    // Armazena no localStorage como workspace selecionado
    localStorage.setItem("workspaceSelecionado", JSON.stringify(workspaceCriado));

    // Exibe toast e redireciona
    toast.success("Espaço criado com sucesso!");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-xl font-bold">TaskFlow</h1>
        <span className="text-sm text-gray-600">
          {session?.user?.email ?? "Carregando..."}
        </span>
      </header>

      <main className="flex flex-1 items-center">
        <div className="w-full max-w-md ml-32">
          <h2 className="text-2xl font-bold mb-6">Crie seu espaço de trabalho</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome do espaço de trabalho *
              </label>
              <input
                type="text"
                value={nomeEspaco}
                onChange={handleNomeChange}
                onBlur={() => handleBlur("nome")}
                placeholder="Escolha um nome fácil de lembrar"
                className={`w-full bg-white border ${
                  erros.nome ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 ${
                  erros.nome ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {erros.nome && (
                <p className="text-red-500 text-sm mt-1">Este campo é obrigatório.</p>
              )}
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium mb-1">
                URL do espaço de trabalho *
              </label>
              <input
                type="text"
                value={`app.taskflow.com/${urlEspaco}`}
                readOnly
                className={`w-full bg-gray-100 border ${
                  erros.url ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-sm text-gray-600`}
              />
              {erros.url && (
                <p className="text-red-500 text-sm mt-1">Este campo é obrigatório.</p>
              )}
            </div>

            {/* Quantidade de usuários */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantas pessoas usarão esse espaço? *
              </label>
              <select
                value={usuarios}
                onChange={(e) => {
                  setUsuarios(e.target.value);
                  if (erros.usuarios) setErros((prev) => ({ ...prev, usuarios: false }));
                }}
                onBlur={() => handleBlur("usuarios")}
                className={`w-full bg-white border ${
                  erros.usuarios ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 ${
                  erros.usuarios ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              >
                <option value="">Selecione uma opção</option>
                <option>1-5 pessoas</option>
                <option>6-20 pessoas</option>
                <option>21-50 pessoas</option>
                <option>Mais de 50</option>
              </select>
              {erros.usuarios && (
                <p className="text-red-500 text-sm mt-1">Este campo é obrigatório.</p>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-start gap-4 mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Criar espaço de trabalho
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                onClick={() => window.history.back()}
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
