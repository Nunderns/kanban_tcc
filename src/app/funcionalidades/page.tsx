"use client";

import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheckCircle, FiUsers, FiLayers, FiPieChart } from "react-icons/fi";

export default function Funcionalidades() {
  const router = useRouter();

  const features = [
    {
      title: "Conheça seus clientes mais rentáveis",
      description: "Mensure a lucratividade de cada cliente e otimize sua gestão financeira.",
      icon: <FiUsers className="text-primary dark:text-primary-foreground text-2xl transition-colors" />
    },
    {
      title: "Agilize a aprovação dos jobs",
      description: "Comunique-se de forma clara e eficiente para otimizar fluxos de trabalho.",
      icon: <FiCheckCircle className="text-primary dark:text-primary-foreground text-2xl transition-colors" />
    },
    {
      title: "Controle seus projetos",
      description: "Centralize todas as informações dos jobs da sua agência em um só lugar.",
      icon: <FiLayers className="text-primary dark:text-primary-foreground text-2xl transition-colors" />
    },
    {
      title: "Dashboard de tráfego",
      description: "Visualize a carga de trabalho e distribua tarefas com eficiência.",
      icon: <FiPieChart className="text-primary dark:text-primary-foreground text-2xl transition-colors" />
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
      <section className="text-center py-32 bg-gradient-to-r from-primary to-primary/90 dark:from-primary/90 dark:to-primary/80 text-white w-full flex flex-col items-center justify-center px-4 transition-colors">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Software para gestão de agências: <span className="text-primary-foreground/90">centralize tudo</span> em um só lugar
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
            Chega de várias plataformas para gerenciar sua agência! O TaskFlow
            integra projetos, clientes, financeiro e equipe em uma única
            plataforma.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-8 px-8 py-3 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            Agende uma demonstração <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Funcionalidades poderosas
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A solução ideal para os desafios diários da sua agência.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Benefícios exclusivos
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Otimize seus processos e aumente a produtividade da sua equipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground transition-colors">
                    <FiCheckCircle className="h-5 w-5" />
                  </div>
                </div>
                <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">{benefit}</p>
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