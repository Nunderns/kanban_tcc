"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateFields = () => {
    let newErrors = { email: "", password: "" };
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

  const handleLogin = async () => {
    if (!validateFields()) {
      toast.error("Os campos não podem ficar em branco.");
      return;
    }
    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Login bem-sucedido!");
      router.push("/dashboard");
    } else {
      if (data.error === "Usuário não encontrado") {
        setErrors({ email: "Usuário não encontrado", password: "Usuário não encontrado" });
      }
      toast.error(data.error || "Erro ao fazer login");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col items-center justify-center bg-white p-10">
        <h1 className="text-4xl font-semibold mb-6 text-black">TaskFlow</h1>
        <div className="w-80">
          <label className="block mb-2 text-black font-medium">Email</label>
          <input 
            type="email" 
            className={`w-full p-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md text-black`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          
          <label className="block mt-4 mb-2 text-black font-medium">Senha</label>
          <input 
            type="password" 
            className={`w-full p-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md text-black`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

          <button className="w-full py-2 mt-4 bg-blue-500 text-white rounded-md" onClick={handleLogin}>
            Entrar
          </button>

          <p className="mt-4 text-black">
            Não tem uma conta? <a href="/register" className="text-blue-500">Criar conta</a>
          </p>
        </div>
      </div>

      <div className="w-1/2 bg-gray-200 p-8">
        <h2 className="text-lg font-semibold">Últimas atualizações</h2>
        <div className="bg-gray-400 text-white p-2 mt-4 rounded-md">
          <p className="font-medium">Título da atualização</p>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <p>🔘 Postado por [Nome da equipe do site]</p>
          <p>📅 Data: 00/00/0000 00:00</p>
        </div>
        <div className="bg-white p-10 mt-4 rounded-md shadow-md h-48 flex items-center justify-center">
          <p className="text-xl font-medium">Corpo do texto</p>
        </div>
        <button className="w-full mt-6 bg-gray-300 py-2 rounded-md text-gray-700 font-medium">
          Ver outras postagens
        </button>
      </div>
    </div>
  );
}

