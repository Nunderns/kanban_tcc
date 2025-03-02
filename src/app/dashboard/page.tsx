"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Verifica o status da sessão para redirecionar para o login se o usuário não estiver autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Você não está logado. Faça login para acessar o Dashboard.");
      router.push("/login"); // Redireciona para o login caso o usuário não esteja autenticado
    }
  }, [status, router]);

  // Exibe a mensagem de loading enquanto verifica a sessão
  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Bem-vindo ao Dashboard, {session?.user?.name}!
      </h1>
      <p className="mt-4">Aqui estão seus dados e informações importantes.</p>

      {/* Botão de logout */}
      <button
        onClick={() => {
          signOut({ callbackUrl: "/login" }); // Redireciona para a página de login após o logout
          toast.success("Você saiu da conta!");
        }}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Sair
      </button>
    </div>
  );
}
