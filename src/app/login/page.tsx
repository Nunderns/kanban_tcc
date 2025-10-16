"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FaSpinner, FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/post-login");
    }
  }, [status, router]);

  const validateFields = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;

    if (!email) {
      newErrors.email = "O email é obrigatório.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Insira um email válido.";
      valid = false;
    }
    if (!password) {
      newErrors.password = "A senha é obrigatória.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFields()) {
      toast.error("Os campos não podem ficar em branco.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Email ou senha inválidos");
      } else {
        toast.success("Login bem-sucedido!");
        router.push("/post-login");
      }
    } catch {
      toast.error("Ocorreu um erro ao tentar fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/post-login" });
  };

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Seção esquerda (formulário) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-6 text-black dark:text-white">
          TaskFlow
        </h1>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mb-6 transition-colors"
        >
          <FaGoogle className="h-5 w-5 text-red-500" />
          {isLoading ? "Entrando com Google..." : "Entrar com Google"}
        </button>

        {/* Divider */}
        <div className="relative w-full max-w-xs my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              ou
            </span>
          </div>
        </div>

        {/* Formulário */}
        <form className="w-full max-w-xs" onSubmit={handleLogin}>
          <label className="block mb-2 text-gray-800 dark:text-gray-200 font-medium">
            Email
          </label>
          <input
            type="email"
            className={`w-full p-2 border ${
              errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } rounded-md text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}

          <label className="block mt-4 mb-2 text-gray-800 dark:text-gray-200 font-medium">
            Senha
          </label>
          <input
            type="password"
            className={`w-full p-2 border ${
              errors.password
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-md text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar com Email"
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Seção direita (texto e benefícios) */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 items-center justify-center transition-colors">
        <div className="text-center text-white p-10 max-w-lg">
          <h2 className="text-3xl font-bold mb-4">Bem-vindo ao TaskFlow</h2>
          <p className="text-lg mb-8">
            Gerencie suas tarefas de forma simples e eficiente.
          </p>
          <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md p-6 rounded-lg text-left">
            <h3 className="text-xl font-semibold mb-4">
              Por que usar o TaskFlow?
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Organize suas tarefas em quadros visuais</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Colabore com sua equipe em tempo real</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Acompanhe o progresso de seus projetos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
