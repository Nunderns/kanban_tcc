"use client";

import { useRouter } from "next/navigation";

export default function Funcionalidades() {
  const router = useRouter(); // Chamar antes do return para evitar problemas com hooks

  return (
    <>
      <section className="text-center py-32 bg-gradient-to-r from-blue-700 to-blue-500 text-white w-full flex flex-col items-center justify-center">
        <h2 className="text-5xl font-bold max-w-4xl">
          Software para gestão de agências: centralize tudo em um só lugar
        </h2>
        <p className="mt-6 max-w-2xl text-lg">
          Chega de várias plataformas para gerenciar sua agência! O TaskFlow
          integra projetos, clientes, financeiro e equipe em uma única
          plataforma. Controle processos, reduza retrabalho e aumente sua
          produtividade, tudo em um só lugar.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-8 px-6 py-3 bg-white text-blue-600 font-bold rounded-md shadow-md hover:bg-gray-200"
        >
          Agende uma demonstração
        </button>
      </section>

      <section className="py-16 bg-white text-black text-center">
        <h2 className="text-4xl font-semibold">Funcionalidades</h2>
        <p className="mt-4 text-lg">
          A solução ideal para os desafios diários da sua agência.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-10">
          <div className="p-6 shadow-lg rounded-md border border-gray-200">
            <h3 className="text-xl font-semibold">
              Conheça seus clientes mais rentáveis
            </h3>
            <p className="mt-2 text-gray-600">
              Mensure a lucratividade de cada cliente e otimize sua gestão
              financeira.
            </p>
          </div>

          <div className="p-6 shadow-lg rounded-md border border-gray-200">
            <h3 className="text-xl font-semibold">Agilize a aprovação dos jobs</h3>
            <p className="mt-2 text-gray-600">
              Comunique-se de forma clara e eficiente para otimizar fluxos de
              trabalho.
            </p>
          </div>

          <div className="p-6 shadow-lg rounded-md border border-gray-200">
            <h3 className="text-xl font-semibold">Controle seus projetos</h3>
            <p className="mt-2 text-gray-600">
              Centralize todas as informações dos jobs da sua agência em um só
              lugar.
            </p>
          </div>

          <div className="p-6 shadow-lg rounded-md border border-gray-200">
            <h3 className="text-xl font-semibold">Dashboard de tráfego</h3>
            <p className="mt-2 text-gray-600">
              Visualize a carga de trabalho e distribua tarefas com eficiência.
            </p>
          </div>
        </div>

        <div className="mt-16 px-10 text-left">
          <h3 className="text-2xl font-semibold text-center">Benefícios</h3>
          <p className="mt-4 text-gray-700 text-lg text-center">
            Otimize seus processos e aumente a produtividade da sua equipe.
          </p>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700 text-lg">
            <li>• Melhor organização e controle de projetos</li>
            <li>• Maior eficiência na comunicação entre equipes</li>
            <li>• Acompanhamento de métricas e desempenho</li>
            <li>• Redução de atrasos e retrabalho</li>
            <li>• Integração com outras ferramentas</li>
            <li>• Tomada de decisão baseada em dados</li>
          </ul>
        </div>
      </section>
    </>
  );
}
