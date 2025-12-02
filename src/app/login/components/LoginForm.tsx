"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";
import { useLogin } from "../hooks/useLogin";

interface Props {
  onForgot: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
}

export default function LoginForm({ onForgot, onTerms, onPrivacy }: Props) {
  const { login, isLoading } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({ email: "", password: "" });

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFields()) return;

    await login(email, password, rememberMe);
  };

  return (
    <form className="w-full max-w-xs" onSubmit={handleSubmit}>
      <label className="block mb-2 text-gray-800 dark:text-gray-200 font-medium">
        Email
      </label>

      <input
        type="email"
        className={`w-full p-2 border ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } rounded-md bg-white dark:bg-gray-800 text-black dark:text-white`}
        placeholder="Digite seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />

      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

      <label className="block mt-4 mb-2 text-gray-800 dark:text-gray-200 font-medium">
        Senha
      </label>

      <input
        type="password"
        className={`w-full p-2 border ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } rounded-md bg-white dark:bg-gray-800 text-black dark:text-white`}
        placeholder="Digite sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />

      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Ao entrar, você concorda com os{" "}
        <button type="button" onClick={onTerms} className="text-blue-600 hover:underline">
          Termos de Serviço
        </button>{" "}
        e{" "}
        <button type="button" onClick={onPrivacy} className="text-blue-600 hover:underline">
          Política de Privacidade
        </button>
      </p>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 flex items-center justify-center gap-2"
      >
        {isLoading ? <FaSpinner className="animate-spin" /> : "Entrar com Email"}
      </button>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <label className="ml-2 text-sm text-gray-900 dark:text-gray-300">
            Lembrar de mim
          </label>
        </div>

        <button onClick={onForgot} type="button" className="text-sm text-blue-600">
          Esqueceu sua senha?
        </button>
      </div>

      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
