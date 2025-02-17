"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      alert("Conta criada com sucesso!");
      router.push("/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Criar Conta</h1>
      <input
        type="text"
        placeholder="Nome"
        className="mb-2 p-2 border text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="mb-2 p-2 border text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        className="mb-4 p-2 border text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={handleRegister}>
        Criar Conta
      </button>
      <p className="mt-4">
        Já tem uma conta? <a href="/login" className="text-blue-500">Entrar</a>
      </p>
    </div>
  );
}
