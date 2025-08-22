"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center min-h-screen w-full transition-colors duration-200">
      <section className="min-h-[80vh] flex items-center justify-center w-full bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80 dark:from-primary/90 dark:via-primary/80 dark:to-primary/70 transition-bg">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-center opacity-[0.03] dark:opacity-[0.05]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
              Transforme sua agência em uma <span className="text-primary-foreground/90">máquina de resultados</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              O TaskFlow é a plataforma completa para gerenciar sua agência com eficiência. Integre projetos, clientes e equipe em um único ecossistema, elimine retrabalhos e impulsione sua produtividade com ferramentas poderosas e fáceis de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center transition-all">
              <button 
                onClick={() => router.push("/login")} 
                className="px-8 py-4 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Agende uma demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 w-full max-w-7xl text-center bg-background/50 transition-colors">
        <h2 className="text-4xl font-bold text-foreground">Temos a <span className="text-primary">solução ideal</span> para os problemas do seu dia a dia</h2>
        <p className="mt-4 text-lg text-muted-foreground">Coisa que só uma plataforma capaz de <span className="font-bold text-foreground">integrar todos os setores</span> da sua agência pode fazer.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center border border-border/70 dark:border-border/50 hover:border-primary/40 dark:hover:border-primary/60 transition-bg transition-border">
            <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
              <Image src="/images/RankdeCliente.png" alt="Logo" width={120} height={80}/>
            </div>
            <h3 className="text-2xl font-bold text-foreground">Conheça seus clientes mais rentáveis</h3>
            <p className="mt-2 text-muted-foreground">Mensure a lucratividade de cada cliente e saiba exatamente o que é rentável para seu negócio.</p>
          </div>
          <div className="p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center border border-border/70 dark:border-border/50 hover:border-primary/40 dark:hover:border-primary/60 transition-bg transition-border">
            <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
              <Image src="/images/Provacao.png" alt="Aprovação de jobs" width={120} height={80} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Agilize a aprovação dos jobs</h3>
            <p className="mt-2 text-muted-foreground">Otimize o trabalho do atendimento com uma comunicação mais transparente e centralizada.</p>
          </div>
          <div className="p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center border border-border/70 dark:border-border/50 hover:border-primary/40 dark:hover:border-primary/60 transition-bg transition-border">
            <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
              <Image src="/images/DashboardTrafego.png" alt="Dashboard de tráfego" width={120} height={80} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Controle seus projetos</h3>
            <p className="mt-2 text-muted-foreground">Visualize e centralize as informações de todos os jobs da agência.</p>
          </div>
        </div>
      </section>

      <section className="py-24 w-full max-w-6xl mx-auto text-center bg-background">
        <h2 className="text-4xl font-bold text-primary">DEPOIMENTOS</h2>
        <p className="mt-4 text-lg text-muted-foreground">Conte com a experiência de quem já realizou <span className="font-bold text-foreground">mais de 900 implantações</span> em todo Brasil.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="relative p-8 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold">compasso coolab</h3>
            <p className="mt-4 italic">&quot;TaskFlow se destaca com todas as funcionalidades, fácil inserção e relatórios completos.&quot;</p>
            <p className="mt-6 font-medium border-t border-primary-foreground/20 pt-4">Amanda Ronconi - Head de Marketing</p>
          </div>
          <div className="p-8 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/50">
            <h3 className="text-lg font-bold text-foreground">agência 3xceler</h3>
            <p className="mt-4 italic text-muted-foreground">&quot;Aumentamos nossa produtividade em 40% após a implementação do TaskFlow. A gestão de projetos nunca foi tão simples.&quot;</p>
            <p className="mt-6 font-medium text-muted-foreground border-t border-border/50 pt-4">Carlos Eduardo - CEO</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold">Aproxima</h3>
            <p className="mt-4 italic">&quot;A automação dos fluxos de trabalho e relatórios inteligentes foram decisivos.&quot;</p>
            <p className="mt-6 font-medium border-t border-primary-foreground/20 pt-4">Lucas Resende - Sócio Fundador</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary/5 to-primary/10 w-full">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-foreground mb-6">Pronto para transformar sua agência?</h2>
          <p className="text-lg text-muted-foreground mb-8">Junte-se a mais de 1.000 agências que já usam o TaskFlow para otimizar seus processos.</p>
          <button 
            onClick={() => router.push("/register")} 
            className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-lg shadow-md hover:bg-primary/90 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Comece grátis por 14 dias
          </button>
        </div>
      </section>

      <section className="py-24 w-full text-center bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold">Aumente sua produtividade em <span className="text-primary-foreground/90">até 70%</span></h2>
          <p className="mt-4 text-lg text-primary-foreground/90 max-w-2xl mx-auto">Descubra como o TaskFlow pode transformar a gestão da sua agência em apenas 15 minutos.</p>
          <button 
            onClick={() => router.push("/login")} 
            className="mt-8 px-8 py-3.5 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Agende uma demonstração
          </button>
        </div>
      </section>
    </div>
  );
}
