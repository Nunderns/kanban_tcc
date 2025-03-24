"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Criar Conta
        </h1>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nome"
            className={`mb-1 w-full p-3 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="text-red-500 text-sm mb-3">{errors.name}</p>}

          <input
            type="email"
            placeholder="Email"
            className={`mb-1 w-full p-3 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mb-3">{errors.email}</p>}

          <input
            type="password"
            placeholder="Senha"
            className={`mb-1 w-full p-3 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-red-500 text-sm mb-3">{errors.password}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            Criar Conta
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Já tem uma conta?{" "}
          <a href="/login" className="text-blue-500 font-medium hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
