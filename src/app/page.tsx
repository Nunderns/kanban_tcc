"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

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
        <h2 className="text-5xl font-bold max-w-4xl">Sua agência com muito resultados. Seus clientes também.</h2>
        <p className="mt-6 max-w-2xl text-lg">
          Chega de várias plataformas para gerenciar sua agência! O TaskFlow integra projetos, clientes e equipe em uma única plataforma. Controle processos, reduza retrabalho e aumente sua produtividade, tudo em um só lugar.
        </p>
        <button onClick={() => router.push("/login")} className="mt-8 px-6 py-3 bg-white text-blue-600 font-bold rounded-md shadow-md hover:bg-gray-200">Agende uma demonstração</button>
      </section>

      <section className="py-24 w-full max-w-7xl text-center bg-gray-50">
        <h2 className="text-4xl font-bold text-purple-700">Temos a <span className="text-black">solução ideal</span> para os problemas do seu dia a dia</h2>
        <p className="mt-4 text-lg text-gray-600">Coisa que só uma plataforma capaz de <span className="font-bold">integrar todos os setores</span> da sua agência pode fazer.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center">
            <img src="/images/RankdeCliente.png" alt="Dashboard de tráfego" className="w-50 h-32 mb-4" />
            <h3 className="text-2xl font-bold text-purple-700">Conheça seus clientes mais rentáveis</h3>
            <p className="mt-2 text-gray-600">Mensure a lucratividade de cada cliente e saiba exatamente o que é rentável para seu negócio.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center">
            <img src="/images/Provacao.png" alt="Aprovação de jobs" className="w-50 h-32 mb-4" />
            <h3 className="text-2xl font-bold text-purple-700">Agilize a aprovação dos jobs</h3>
            <p className="mt-2 text-gray-600">Otimize o trabalho do atendimento com uma comunicação mais transparente e centralizada.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center">
            <img src="/images/DashboardTrafego.png" alt="Dashboard de tráfego" className="w-50 h-32 mb-4" />
            <h3 className="text-2xl font-bold text-purple-700">Controle seus projetos</h3>
            <p className="mt-2 text-gray-600">Visualize e centralize as informações de todos os jobs da agência.</p>
          </div>
        </div>
      </section>

      <section className="py-24 w-full max-w-6xl mx-auto text-center bg-white">
        <h2 className="text-4xl font-bold text-blue-700">DEPOIMENTOS</h2>
        <p className="mt-4 text-lg text-gray-600">Conte com a experiência de quem já realizou <span className="font-bold">mais de 900 implantações</span> em todo Brasil.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="relative p-8 bg-purple-700 text-white rounded-lg shadow-xl flex flex-col justify-between">
            <h3 className="text-lg font-bold">compasso coolab</h3>
            <p className="italic mt-4">“TaskFlow se destaca com todas as funcionalidades, fácil inserção e relatórios completos.”</p>
            <p className="mt-6 font-bold border-t border-white pt-4">Amanda Ronconi - Head de Marketing</p>
          </div>
          <div className="relative p-8 bg-blue-700 text-white rounded-lg shadow-xl flex flex-col justify-between">
            <h3 className="text-lg font-bold">CHUVA</h3>
            <p className="italic mt-4">“Utilizamos TaskFlow para organizar fluxos de trabalho e melhorar a gestão da agência.”</p>
            <p className="mt-6 font-bold border-t border-white pt-4">Vania da Cunha Mastela - Coordenadora de Processos</p>
          </div>
          <div className="relative p-8 bg-blue-500 text-white rounded-lg shadow-xl flex flex-col justify-between">
            <h3 className="text-lg font-bold">Aproxima</h3>
            <p className="italic mt-4">“A automação dos fluxos de trabalho e relatórios inteligentes foram decisivos.”</p>
            <p className="mt-6 font-bold border-t border-white pt-4">Lucas Resende - Sócio Fundador</p>
          </div>
        </div>
      </section>

      <section className="py-24 w-full text-center bg-blue-400 text-white">
        <h2 className="text-4xl font-bold">Aumente sua produtividade em <span className="font-bold">até 70%</span></h2>
        <button onClick={() => router.push("/login")} className="mt-8 px-6 py-3 bg-pink-500 text-white font-bold rounded-md shadow-md hover:bg-pink-600">Agende uma demonstração</button>
      </section>
    </div>
  );
}
