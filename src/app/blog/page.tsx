import Image from 'next/image';
import Link from 'next/link';


export default function BlogPage() {
  return (
    <main className="bg-[#f5f8fc] text-gray-800">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-purple-700">TaskFlow</Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-purple-600">
            {categories.map((cat, idx) => (
              <a key={idx} href="#" className="hover:text-pink-600">
                {cat}
              </a>
            ))}
          </nav>
          <button className="bg-pink-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-pink-700">
            Experimente
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-700 text-white p-8 rounded-2xl flex flex-col justify-between h-full">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              <strong>Controle</strong> os jobs da sua agência da execução ao faturamento em um só lugar!
            </h2>
            <p className="text-lg font-bold">Conheça TaskFlow!</p>
          </div>
          <div className="mt-6">
            <button className="bg-pink-500 text-white px-6 py-2 rounded font-semibold hover:bg-pink-600">
              DEMONSTRAÇÃO GRATUITA
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Pesquisar conteúdo"
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
            <button className="absolute top-1/2 right-3 transform -translate-y-1/2 text-pink-600 text-lg">🔍</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-center">
            <Image
              src="/images/Blog_main_page.png"
              alt="Ilustração"
              width={300}
              height={200}
              className="rounded-md w-full h-auto"
            />
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1">PRODUTIVIDADE</p>
              <h3 className="text-xl font-bold text-purple-700 mb-2">
                Relatório de produtividade: Quais itens não podem faltar no seu?
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Veja o que não pode faltar em seu relatório de produtividade para tomar as melhores decisões para o seu negócio.
              </p>
              <a href="#" className="bg-pink-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-pink-700">
                Continue lendo
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-10">
        <h2 className="text-center text-2xl font-bold text-purple-700">
          Artigos <span className="text-pink-600">+</span> recentes
        </h2>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {articles.map((article, idx) => (
          <div key={idx} className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <Image
              src={`/images/${article.image}`}
              alt={article.title}
              width={400}
              height={250}
              className="w-full h-52 object-cover"
            />
            <div className="p-5">
              <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide mb-2">{article.category}</p>
              <h3 className="text-base font-bold text-blue-900 mb-2">{article.title}</h3>
              <p className="text-sm text-gray-600">{article.excerpt}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const categories = [
  'Gestão',
  'Captação e Retenção de clientes',
  'Gestão Financeira',
  'Gestão de Projetos',
  'Operação e Criatividade',
  'Cases',
  'TaskFlow',
];

const articles = [
  {
    category: 'Operação e Criatividade',
    title: 'Métricas de mídia offline: como consolidar dados de diferentes veículos',
    excerpt: 'Ainda vale a pena investir em mídia offline se eu não consigo medir os resultados?...',
    image: 'artigo-midia-offline.png',
  },
  {
    category: 'Gestão Financeira',
    title: 'Custo total da agência: como calcular tudo inclusive o que não está visível',
    excerpt: 'Muitos gestores acreditam dominar seus números quando controlam salários, aluguel e mídia...',
    image: 'artigo-custos-agencia.png',
  },
  {
    category: 'Gestão Financeira',
    title: 'Política de pagamento em agências: como definir a melhor forma de cobrar os clientes?',
    excerpt: 'Ter uma política de pagamento bem estruturada é essencial para a saúde financeira...',
    image: 'artigo-politica-pagamento.png',
  },
  {
    category: 'Gestão Financeira',
    title: 'Como emitir notas fiscais de forma eficiente em agências e evitar os erros mais comuns',
    excerpt: 'Emitir notas fiscais corretamente é um dos desafios operacionais mais comuns para agências...',
    image: 'artigo-notas-fiscais.png',
  },
  {
    category: 'Gestão',
    title: 'Liderança feminina nas agências: como criar um ambiente mais igualitário?',
    excerpt: 'A publicidade sempre foi um mercado dinâmico, mas por muito tempo, a liderança...',
    image: 'artigo-lideranca-feminina.png',
  },
  {
    category: 'Gestão de Projetos',
    title: 'Como criar projetos com AI: um guia para gestores de agências',
    excerpt: 'A Inteligência Artificial está mudando a forma como gerenciamos e criamos projetos...',
    image: 'artigo-projetos-ai.png',
  },
  {
    category: 'TaskFlow',
    title: 'TaskFlow para gestão de agências: a ferramenta ideal para o seu negócio',
    excerpt: 'Gerir uma agência de publicidade é como equilibrar vários pratinhos ao mesmo tempo...',
    image: 'artigo-TaskFlow-gestao.png',
  },
  {
    category: 'TaskFlow',
    title: 'Gestão de mídia em TaskFlow: o segredo para campanhas mais estratégicas e eficientes',
    excerpt: 'Gerenciar mídia em uma agência é uma tarefa cheia de desafios. Veja como o TaskFlow ajuda!',
    image: 'artigo-midia-TaskFlow.png',
  },
  {
    category: 'Captação e Retenção de clientes',
    title: 'Como criar propostas comerciais eficientes para agências de marketing?',
    excerpt: 'Conquistar novos clientes, expandir a agência, depender menos de indicação...',
    image: 'artigo-propostas.png',
  },
];
