"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Você não está logado. Faça login para acessar o Dashboard.");
      router.push("/login"); // Redireciona para login se não estiver autenticado
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>; // Exibe um loading enquanto verifica a sessão
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Bem-vindo ao Dashboard, {session?.user?.name}!
      </h1>
      <button
        onClick={() => {
          signOut();
          toast.success("Você saiu da conta!");
        }}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Sair
      </button>
    </div>
  );
}
