"use client";

import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheckCircle, FiUsers, FiLayers, FiPieChart } from "react-icons/fi";

export default function Funcionalidades() {
  const router = useRouter();

  const features = [
    {
      title: "Conheça seus clientes mais rentáveis",
      description: "Mensure a lucratividade de cada cliente e otimize sua gestão financeira.",
      icon: <FiUsers className="text-blue-600 text-2xl" />
    },
    {
      title: "Agilize a aprovação dos jobs",
      description: "Comunique-se de forma clara e eficiente para otimizar fluxos de trabalho.",
      icon: <FiCheckCircle className="text-blue-600 text-2xl" />
    },
    {
      title: "Controle seus projetos",
      description: "Centralize todas as informações dos jobs da sua agência em um só lugar.",
      icon: <FiLayers className="text-blue-600 text-2xl" />
    },
    {
      title: "Dashboard de tráfego",
      description: "Visualize a carga de trabalho e distribua tarefas com eficiência.",
      icon: <FiPieChart className="text-blue-600 text-2xl" />
    }
  ];

  const benefits = [
    "Melhor organização e controle de projetos",
    "Maior eficiência na comunicação entre equipes",
    "Acompanhamento de métricas e desempenho",
    "Redução de atrasos e retrabalho",
    "Integração com outras ferramentas",
    "Tomada de decisão baseada em dados"
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-32 bg-gradient-to-r from-blue-700 to-blue-600 text-white w-full flex flex-col items-center justify-center px-4 transition-all">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Software para gestão de agências: <span className="text-blue-200">centralize tudo</span> em um só lugar
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-blue-100">
            Chega de várias plataformas para gerenciar sua agência! O TaskFlow
            integra projetos, clientes, financeiro e equipe em uma única
            plataforma.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-8 px-8 py-3 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            Agende uma demonstração <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Funcionalidades poderosas
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A solução ideal para os desafios diários da sua agência.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Benefícios exclusivos
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Otimize seus processos e aumente a produtividade da sua equipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all"
              >
                <FiCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <p className="text-gray-800 text-lg">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              Experimente grátis <FiArrowRight />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}