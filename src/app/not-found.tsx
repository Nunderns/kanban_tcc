import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold tracking-tight">Página não encontrada</h2>
          <p className="text-muted-foreground">
            Desculpe, não conseguimos encontrar a página que você está procurando.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            <Home className="w-4 h-4" />
            Ir para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
