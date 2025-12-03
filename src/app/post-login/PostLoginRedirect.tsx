"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PostLoginRedirectProps {
  workspaceSlug: string;
}

export function PostLoginRedirect({ workspaceSlug }: PostLoginRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    console.log(`[PostLoginRedirect] Redirecionando para: /${workspaceSlug}`);

    const timer = setTimeout(async () => {
      try {
        await router.push(`/${workspaceSlug}`);
      } catch (error) {
        console.log(`Rota /${workspaceSlug} não encontrada, tentando /dashboard...`, error);
        try {
          await router.push('/dashboard');
        } catch (e) {
          console.error('Falha ao redirecionar para /dashboard:', e);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router, workspaceSlug]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Redirecionando para {`/${workspaceSlug}...`}</p>
        <p className="text-sm text-gray-500 mt-2">
          Se o redirecionamento não funcionar, <a href={`/${workspaceSlug}`} className="text-blue-500 hover:underline">clique aqui</a>
        </p>
      </div>
    </div>
  );
}