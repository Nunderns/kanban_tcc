"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FaSpinner, FaGoogle, FaTimes } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Por favor, insira seu email");
      return;
    }

    setIsSendingReset(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email de recuperação enviado com sucesso!");
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      } else {
        toast.error(data.message || "Erro ao enviar email de recuperação");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Erro ao processar sua solicitação");
    } finally {
      setIsSendingReset(false);
    }
  };

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-6 text-black dark:text-white">
          TaskFlow
        </h1>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mb-6 transition-colors"
        >
          <FaGoogle className="h-5 w-5 text-red-500" />
          {isLoading ? "Entrando com Google..." : "Entrar com Google"}
        </button>

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

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Esqueceu sua senha?
            </button>
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
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative shadow-xl">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recuperar Senha
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300">
                Digite seu endereço de email e enviaremos um link para redefinir sua senha.
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label 
                    htmlFor="forgot-email" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendingReset ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
