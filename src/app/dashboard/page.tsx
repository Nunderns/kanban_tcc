import { Card, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar fixa */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Início</h1>
        <p className="text-gray-600 mb-6">Monitore todos os seus projetos e tarefas aqui</p>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Total de Projetos",
            "Total de Tarefas",
            "Tarefas encarregadas",
            "Tarefas finalizadas",
          ].map((title, index) => (
            <Card key={index} className="flex flex-col items-center justify-center p-6 bg-white shadow-lg rounded-lg">
              <CardContent>
                <p className="text-gray-600 text-center">{title}</p>
                <p className="text-4xl font-bold text-blue-600">2</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Container para Tarefas e Projetos */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
          {/* Lista de Tarefas encarregadas */}
          <div className="bg-white p-6 rounded-lg shadow w-full md:w-2/3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tarefas encarregadas (3)</h2>
              <button className="text-gray-500 hover:text-gray-700">+</button>
            </div>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((task) => (
                <div key={task} className="bg-gray-100 p-4 rounded-lg shadow">
                  <p className="font-semibold text-gray-800">Nome da tarefa {task}</p>
                  <p className="text-sm text-gray-500">Descrição da Tarefa • 14 Dias Restantes</p>
                </div>
              ))}
            </div>
            <button className="w-full text-blue-600 mt-4">Mostrar Todos</button>
          </div>

          {/* Lista de Projetos */}
          <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Projetos (2)</h2>
              <button className="text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              </button>
            </div>
            <div className="mt-4 space-x-2">
              {["Desenvolvimento Mobile", "Web Design"].map((project, index) => (
                <button key={index} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700">
                  {project}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="bg-white p-6 rounded-lg shadow mt-6 max-w-4xl">
          <h2 className="text-xl font-semibold">Pessoas (2)</h2>
          <div className="flex justify-between items-center mt-4">
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                { name: "Antônio", email: "antonio@mail.com" },
                { name: "Jhonny", email: "jhonny@mail.com" },
              ].map((member, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-100 rounded-lg shadow">
                  <div className="text-xl font-semibold text-blue-600">{member.name[0]}</div>
                  <div className="ml-4">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-gray-600 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
