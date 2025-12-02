export default function LoginHero() {
  return (
    <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 
    dark:to-blue-900 items-center justify-center transition-colors">

      <div className="text-center text-white p-10 max-w-lg">
        <h2 className="text-3xl font-bold mb-4">Bem-vindo ao TaskFlow</h2>
        <p className="text-lg mb-8">
          Gerencie suas tarefas de forma simples e eficiente.
        </p>

        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md p-6 rounded-lg text-left">
          <h3 className="text-xl font-semibold mb-4">Por que usar o TaskFlow?</h3>

          <ul className="space-y-2">
            <li className="flex items-start">✔ Organize suas tarefas em quadros visuais</li>
            <li className="flex items-start">✔ Colabore com sua equipe em tempo real</li>
            <li className="flex items-start">✔ Acompanhe o progresso dos projetos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
