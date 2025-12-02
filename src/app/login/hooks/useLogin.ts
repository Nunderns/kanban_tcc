"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string, rememberMe: boolean) {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        rememberMe,
      });

      if (res?.error) {
        toast.error("Email ou senha inválidos");
      } else {
        toast.success("Login bem-sucedido!");
        router.push("/post-login");
      }
    } catch {
      toast.error("Erro ao tentar fazer login");
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading };
}
