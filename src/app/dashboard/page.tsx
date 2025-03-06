import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar fixa */}
      <Sidebar />
      
      {/* Conteúdo principal expandido corretamente */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <h1 className="text-2xl font-semibold">Início</h1>
        <p className="text-gray-600 mb-6">Monitore todos os seus projetos e tarefas aqui</p>
        
        {/* Cards de Status - Ajustando a largura */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {["Total de Projetos", "Total de Tarefas", "Tarefas encarregadas", "Tarefas finalizadas", "Tarefas finalizadas"].map((title, index) => (
            <Card key={index} className="flex flex-col items-center justify-center p-4">
              <CardContent>
                <p className="text-gray-600 text-center">{title}</p>
                <p className="text-3xl font-bold">2</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de Tarefas - Expandindo corretamente */}
        <div className="bg-white p-4 rounded-lg shadow mt-6 max-w-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tarefas encarregadas (3)</h2>
            <button className="text-gray-500 hover:text-gray-700">+</button>
          </div>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((task) => (
              <div key={task} className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Nome da tarefa {task}</p>
                <p className="text-sm text-gray-500">Descrição da Tarefa • 14 Dias Restantes</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
