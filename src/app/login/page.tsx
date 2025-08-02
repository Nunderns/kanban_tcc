"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FaSpinner, FaGoogle } from "react-icons/fa";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
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
        toast.error(res.error || "Erro ao fazer login");
      } else {
        toast.success("Login bem-sucedido!");
        router.push("/dashboard");
      }
      } catch {
        toast.error("Ocorreu um erro durante o login");
      } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col items-center justify-center bg-white p-10">
        <h1 className="text-4xl font-semibold mb-6 text-black">TaskFlow</h1>
        
        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-80 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <FaGoogle className="h-5 w-5 text-red-500" />
          {isLoading ? 'Entrando com Google...' : 'Entrar com Google'}
        </button>
        
        <div className="relative w-80 my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>
        
        <form className="w-80" onSubmit={handleLogin}>
          <label className="block mb-2 text-black font-medium">Email</label>
          <input 
            type="email" 
            className={`w-full p-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md text-black`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          
          <label className="block mt-4 mb-2 text-black font-medium">Senha</label>
          <input 
            type="password" 
            className={`w-full p-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md text-black`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          
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
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="/register" className="text-blue-600 hover:underline">
                Cadastre-se
              </a>
            </p>
          </div>
        </form>
      </div>
      
      <div className="w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white p-10">
          <h2 className="text-3xl font-bold mb-4">Bem-vindo ao TaskFlow</h2>
          <p className="text-lg mb-8">Gerencie suas tarefas de forma simples e eficiente.</p>
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg max-w-md">
              <h3 className="text-xl font-semibold mb-4">Por que usar o TaskFlow?</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Organize suas tarefas em quadros visuais</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Colabore com sua equipe em tempo real</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Acompanhe o progresso de seus projetos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}