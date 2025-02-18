export default function Funcionalidades() {
  return (
    <section className="py-16 bg-white text-black text-center">
      <h2 className="text-4xl font-semibold">Funcionalidades</h2>
      <p className="mt-4 text-lg">A solução ideal para os desafios diários da sua agência.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-10">
        <div className="p-6 shadow-lg rounded-md border border-gray-200">
          <h3 className="text-xl font-semibold">Conheça seus clientes mais rentáveis</h3>
          <p className="mt-2 text-gray-600">Mensure a lucratividade de cada cliente e otimize sua gestão financeira.</p>
        </div>
        <div className="p-6 shadow-lg rounded-md border border-gray-200">
          <h3 className="text-xl font-semibold">Agilize a aprovação dos jobs</h3>
          <p className="mt-2 text-gray-600">Comunique-se de forma clara e eficiente para otimizar fluxos de trabalho.</p>
        </div>
        <div className="p-6 shadow-lg rounded-md border border-gray-200">
          <h3 className="text-xl font-semibold">Controle seus projetos</h3>
          <p className="mt-2 text-gray-600">Centralize todas as informações dos jobs da sua agência em um só lugar.</p>
        </div>
        <div className="p-6 shadow-lg rounded-md border border-gray-200">
          <h3 className="text-xl font-semibold">Dashboard de tráfego</h3>
          <p className="mt-2 text-gray-600">Visualize a carga de trabalho e distribua tarefas com eficiência.</p>
        </div>
      </div>
    </section>
  );
}