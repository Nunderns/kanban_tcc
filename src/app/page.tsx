"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col items-center justify-center bg-white p-10">
        <h1 className="text-4xl font-semibold mb-6 text-black">TaskFlow</h1>
        <div className="w-80">
          <label className="block mb-2 text-black font-medium">Email</label>
          <input 
            type="email" 
            className="w-full p-2 border border-gray-300 rounded-md text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <label className="block mt-4 mb-2 text-black font-medium">Senha</label>
          <input 
            type="password" 
            className="w-full p-2 border border-gray-300 rounded-md text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="text-sm text-blue-600 mt-2 cursor-pointer font-semibold">Esqueci a senha</p>
          <button className="w-full py-2 mt-4 bg-blue-500 text-white rounded-md">Entrar</button>
          
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300"/>
            <span className="mx-4 text-gray-500">ou</span>
            <hr className="flex-grow border-gray-300"/>
          </div>

          <button className="w-full py-2 bg-white text-black border border-gray-300 rounded-md">Entrar com Google</button>
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
