import Image from 'next/image';

export default function Planos() {
  return (
    <main className="bg-white text-gray-900">
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white">
        <h1 className="text-4xl font-bold mb-4">Integração e controle em um único lugar</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Escolha o plano certo para escalar o seu negócio de forma rápida e eficiente
        </p>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className="relative border rounded-2xl p-6 pt-20 shadow hover:shadow-lg transition text-center bg-white"
          >
            <Image
              src={`/images/${plan.image}.png`}
              alt={`Imagem do plano ${plan.title}`}
              width={80}
              height={80}
              className="absolute -top-10 left-1/2 transform -translate-x-1/2"
            />
            <h2 className="text-2xl font-bold mb-4 text-purple-700">{plan.title}</h2>
            <p className="mb-4 text-gray-600 text-sm">{plan.description}</p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6 text-left">
              {plan.features.map((f, idx) => (
                <li key={idx}>• {f}</li>
              ))}
            </ul>
            {plan.button && (
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                {plan.button}
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Depoimentos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow">
                <p className="italic mb-4">“{t.text}”</p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Perguntas frequentes</h2>
        <div className="space-y-4">
          {faq.map((q, idx) => (
            <div key={idx}>
              <h3 className="font-semibold">{q.question}</h3>
              <p className="text-sm text-gray-700">{q.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const plans = [
  {
    title: 'Growth',
    image: 'Base',
    description: 'Ideal para equipes em crescimento e que desejam padronizar seus processos',
    features: [
      '5 GB de espaço',
      'Modelos de peça customizados ilimitados',
      'Todos os templates de peça',
      'Apontamento de horas nas atividades',
      '5 usuários freelancers',
      '5 usuários para o espaço do cliente',
      '1 mês de histórico de alterações',
      'Relatório básico',
      'Suporte por email',
    ],
    button: 'Agendar demonstração',
  },
  {
    title: 'Pro',
    image: 'Avancado',
    description: 'Ideal para grandes equipes que precisam de precisão e controle',
    features: [
      '50 GB de espaço',
      '10 usuários freelancers',
      '10 usuários para o espaço do cliente',
      '12 meses de histórico de alterações',
      'Slack e RD Station',
      'Gestão de carga de trabalho',
      'Relatórios avançados',
      'Suporte por email e chat',
      '+ Vantagens do plano Growth',
    ],
    button: 'Agendar demonstração',
  },
  {
    title: 'Enterprise',
    image: 'Empresarial',
    description: 'Potencialize a estratégia com larga escala de colaboração e gestão.',
    features: ['Plano sob medida', 'Entre em contato para detalhes'],
    button: 'Fale conosco',
  },
];

const testimonials = [
  {
    text: 'Uso muito no dia a dia e sem TaskFlow eu e minha equipe iríamos ficar perdidos na organização dos projetos.',
    name: 'Lucas Resende',
    title: 'Sócio Fundador',
  },
  {
    text: 'Na Chuva, utilizamos TaskFlow como uma ferramenta estratégica para organizar os nossos fluxos de trabalho.',
    name: 'Vania da Cunha Mastela',
    title: 'Coordenadora da Cultura e Processos',
  },
  {
    text: 'TaskFlow se destaca com todas as funcionalidades, recursos, navegabilidade, e relatórios com apontamentos precisos.',
    name: 'Amanda Ronconi',
    title: 'Head de Marketing',
  },
];

const faq = [
  {
    question: 'Posso testar o sistema antes de contratá-lo?',
    answer: 'Sim! Você pode solicitar uma demonstração gratuita com nossos consultores.',
  },
  {
    question: 'Existe multa ao cancelar um plano pago?',
    answer: 'Não. O cancelamento pode ser feito a qualquer momento, sem multa.',
  },
  {
    question: 'Posso mudar de plano a qualquer momento?',
    answer: 'Sim, a mudança de plano pode ser feita conforme a necessidade do seu time.',
  },
  {
    question: 'Preciso instalar algo para o armazenamento de arquivos?',
    answer: 'Não. O TaskFlow é 100% em nuvem, sem necessidade de instalação local.',
  },
];
