"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";

export default function LoginPage() { 
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

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

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left side - Login form */}
        <div className="w-1/2 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Acesse sua conta</h1>
            <p className="text-gray-500">Informe seus dados para entrar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Seu email"
                  className={`pl-10 w-full p-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  } rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <span className="ml-1">{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="Sua senha"
                  className={`pl-10 w-full p-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-200'
                  } rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <span className="ml-1">{errors.password}</span>
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={18} className="text-white" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link 
                href="/register" 
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Ao fazer login, você concorda com nossos{" "}
              <button 
                onClick={() => setIsTermsModalOpen(true)}
                className="text-indigo-600 hover:underline bg-transparent border-none p-0 cursor-pointer font-inherit"
              >
                Termos de Serviço
              </button>{" "}e{" "}
              <button 
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-indigo-600 hover:underline bg-transparent border-none p-0 cursor-pointer font-inherit"
              >
                Política de Privacidade
              </button>.
            </p>
          </div>
        </div>
        
        {/* Right side - Updates section */}
        <div className="w-1/2 bg-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Últimas atualizações</h2>
          <div className="bg-gray-200 text-gray-800 p-4 rounded-xl">
            <p className="font-medium">Título da atualização</p>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2 mb-4">
            <p>🔘 Postado por [Nome da equipe do site]</p>
            <p>📅 Data: 00/00/0000 00:00</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md h-48 flex items-center justify-center mb-6">
            <p className="text-xl font-medium text-gray-700">Corpo do texto</p>
          </div>
          <button className="w-full bg-gray-300 hover:bg-gray-400 py-3 px-4 rounded-xl text-gray-700 font-medium transition-all duration-200 flex items-center justify-center">
            Ver outras postagens
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </div>
  );
}