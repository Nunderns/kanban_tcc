import Image from 'next/image';

export default function Cases() {
  return (
    <main className="bg-[#f5f8fc] text-gray-800">

      {/* Hero Inicial */}
      <section className="bg-gradient-to-br from-[#0f1a64] to-[#0c1a4f] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="block">Cases de sucesso:</span>
              <span className="block">agências que cresceram com TaskFlow</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-xl">
              Conheça as histórias de agências que <strong className="font-bold">revolucionaram sua gestão</strong> com o TaskFlow. Descubra como elas integraram equipes, otimizaram processos, reduziram tarefas manuais e alcançaram resultados surpreendentes.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="/images/rocket-launch.png"
              alt="Ilustração de crescimento"
              width={500}
              height={400}
              className="w-full max-w-md h-auto"
            />
          </div>
        </div>
      </section>

      {/* Cases individuais */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-28">
        {cases.map((item, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-1 md:grid-cols-2 items-center gap-12 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
          >
            <div className="flex justify-center">
              <Image
                src={`/images/${item.image}`}
                alt={`Imagem do case ${item.title}`}
                width={500}
                height={400}
                className="w-full max-w-md h-auto"
              />
            </div>
            <div>
              <p className="text-sm uppercase font-semibold text-purple-600 mb-2">{item.title}</p>
              <h2 className="text-3xl font-bold text-[#08134b] mb-4 leading-tight">{item.highlight}</h2>
              <p className="text-lg text-gray-700 mb-6">{item.description}</p>
              <ul className="space-y-2 text-base text-black list-disc pl-5">
                {item.links.map((text, i) => (
                  <li key={i} className="hover:underline cursor-pointer">{text}</li>
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