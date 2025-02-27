"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen w-full">
      <section className="text-center py-32 bg-gradient-to-r from-blue-700 to-blue-500 text-white w-full flex flex-col items-center justify-center">
        <h2 className="text-5xl font-bold max-w-4xl">Software para gestão de agências: centralize tudo em um só lugar</h2>
        <p className="mt-6 max-w-2xl text-lg">
          Chega de várias plataformas para gerenciar sua agência! O TaskFlow integra projetos, clientes, financeiro e equipe em uma única plataforma. Controle processos, reduza retrabalho e aumente sua produtividade, tudo em um só lugar.
        </p>
        <button onClick={() => router.push("/login")} className="mt-8 px-6 py-3 bg-white text-blue-600 font-bold rounded-md shadow-md hover:bg-gray-200">Agende uma demonstração</button>
      </section>
    </div>
  );
}

