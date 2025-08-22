"use client";


export default function Cases() {
  return (
    <main className="bg-[#f5f8fc] dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">

      {/* Hero Inicial */}
      <section className="bg-gradient-to-br from-[#0f1a64] to-[#0c1a4f] dark:from-[#1a237e] dark:to-[#0d47a1] text-white py-24 px-6 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="block">Cases de sucesso:</span>
              <span className="block">agências que cresceram com TaskFlow</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-xl text-blue-100 dark:text-blue-50">
              Conheça as histórias de agências que <strong className="font-bold text-white">revolucionaram sua gestão</strong> com o TaskFlow. Descubra como elas integraram equipes, otimizaram processos, reduziram tarefas manuais e alcançaram resultados surpreendentes.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md h-64 md:h-80 bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl flex items-center justify-center text-white text-center p-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Crescimento Exponencial</h3>
                <p className="text-blue-100">Descubra como nossas soluções podem impulsionar seus resultados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cases individuais */}
      <section className="max-w-5xl mx-auto px-6 py-24 space-y-12">
        {cases.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row items-stretch bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-800/30 overflow-hidden transition-all hover:shadow-xl dark:hover:shadow-gray-800/40"
          >
            <div className="w-full md:w-1/2 overflow-hidden">
              <div className="relative w-full h-64 md:h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Case de sucesso</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 p-8">
              <p className="text-sm uppercase font-semibold text-primary dark:text-primary-300 mb-2">{item.title}</p>
              <h2 className="text-3xl font-bold text-[#08134b] dark:text-white mb-4 leading-tight">{item.highlight}</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{item.description}</p>
              <ul className="space-y-2 text-base">
                {item.links.map((text, i) => (
                  <li key={i} className="text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-300 transition-colors cursor-pointer flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary-300 mr-2"></span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

    </main>
  );
}

const cases = [
  {
    title: 'CASE CL/AG',
    highlight: 'Produtividade e gestão em alta na CL/AG',
    description:
      'A CL/AG encontrou em TaskFlow a ferramenta ideal para superar desafios de gestão e aumentar sua produtividade. Com processos mais organizados e uma visão clara do fluxo de trabalho, a agência aprimorou a entrega de projetos.',
    links: ['Sobre a CL/AG', 'Os desafios enfrentados', 'Como TaskFlow ajudou?'],
    image: 'case-clag.png',
  },
  {
    title: 'CASE POP',
    highlight: '1000% mais faturamento',
    description:
      'Com quase 10 anos de parceria, o TaskFlow ajudou a Pop Comunicação a organizar processos internos, otimizar a produtividade e escalar resultados. A POP alcançou um aumento de 1000% no faturamento bruto mensal entre 2011 e 2019.',
    links: ['Sobre a POP Comunicação', 'Os desafios enfrentados', 'Como TaskFlow ajudou?'],
    image: 'case-pop.png',
  },
  {
    title: 'GRUPO PHOCUS',
    highlight: 'Encurtando distâncias',
    description:
      'Com o crescimento contínuo da Phocus, a necessidade de reestruturar seus processos internos e otimizar a gestão se tornou uma prioridade. A falta de uma ferramenta adequada dificultava a evolução da agência.',
    links: ['Sobre a Phocus', 'Os desafios enfrentados', 'Como TaskFlow ajudou?'],
    image: 'case-phocus.png',
  },
  {
    title: 'AGÊNCIA AUDI',
    highlight: '5X mais clientes em um ano',
    description:
      'A Audi, uma agência premiada, cresceu de forma acelerada. Com o aumento da demanda, a gestão de processos internos tornou-se um desafio. O TaskFlow organizou fluxos e facilitou a gestão de campanhas.',
    links: ['Sobre a Agência Audi', 'Desafios enfrentados', 'Controle todas as demandas'],
    image: 'case-audi.png',
  },
];