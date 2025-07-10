"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const validateFields = () => {
    const newErrors: { name: string; email: string; password: string } = {
      name: "",
      email: "",
      password: "",
    };

    let valid = true;

    if (!name) {
      newErrors.name = "O nome é obrigatório.";
      valid = false;
    }
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
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateFields()) return;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } else {
      if (data.error.includes("email")) {
        setErrors((prev) => ({ ...prev, email: "Este email já está em uso." }));
      }
      toast.error(data.error || "Erro ao criar conta");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crie sua conta</h1>
          <p className="text-gray-500">Preencha os dados abaixo para começar</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nome completo"
                  className={`pl-10 w-full p-3 border ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  } rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <span className="ml-1">{errors.name}</span>
                </p>
              )}
            </div>

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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Criar conta</span>
                <ArrowRight size={18} className="text-white" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já possui uma conta?{" "}
              <Link 
                href="/login" 
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Ao se registrar, você concorda com nossos{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Termos de Serviço
            </a>{" "}e{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Política de Privacidade
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
