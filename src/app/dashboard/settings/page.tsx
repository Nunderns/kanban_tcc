"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

type Section = 'profile' | 'preferences' | 'notifications' | 'security' | 'activity' | 'connections' | 'developer';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const name = session?.user?.name || "Usuário";
  const email = session?.user?.email || "";

  // Ensure UI is mounted before showing theme selector
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const getInitials = (value?: string | null) => {
    if (!value) return "US";
    const parts = value.trim().split(/\s+/);
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    const at = value.indexOf("@");
    if (at > 0) return `${value[0]}${value[at + 1] || "S"}`.toUpperCase();
    return value.slice(0, 2).toUpperCase();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seu Perfil</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16 border border-gray-200">
                    <AvatarImage src={session?.user?.image ?? undefined} alt={name} />
                    <AvatarFallback>{getInitials(name || email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-medium">{name}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      id="firstName"
                      className="w-full rounded-md border border-gray-200 px-3 py-2"
                      defaultValue={name.split(" ")[0] || ""}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Sobrenome
                    </label>
                    <input
                      id="lastName"
                      className="w-full rounded-md border border-gray-200 px-3 py-2"
                      defaultValue={name.split(" ").slice(1).join(" ") || ""}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 bg-gray-50"
                      defaultValue={email}
                      disabled
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button>Salvar alterações</Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    Desativar conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'preferences':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>Personalize sua experiência no aplicativo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Tema</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Escolha como o Kanban TCC é exibido para você
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {mounted && ([
                      {
        				    value: 'light',
        				    label: 'Claro',
        				    icon: (
        				      <div className="w-full h-full rounded-lg bg-white border border-gray-200 p-4 flex flex-col items-center justify-center">
        				        <div className="w-6 h-6 rounded-full bg-yellow-300 mb-2" />
        				        <div className="w-full h-1 bg-gray-200 my-1" />
        				        <div className="w-full h-1 bg-gray-200 my-1" />
        				        <div className="w-3/4 h-1 bg-gray-200 mt-1" />
        				      </div>
        				    ),
        				  },
        				  {
        				    value: 'dark',
        				    label: 'Escuro',
        				    icon: (
        				      <div className="w-full h-full rounded-lg bg-gray-900 border border-gray-700 p-4 flex flex-col items-center justify-center">
        				        <div className="w-6 h-6 rounded-full bg-blue-500 mb-2" />
        				        <div className="w-full h-1 bg-gray-700 my-1" />
        				        <div className="w-full h-1 bg-gray-700 my-1" />
        				        <div className="w-3/4 h-1 bg-gray-700 mt-1" />
        				      </div>
        				    ),
        				  },
        				  {
        				    value: 'system',
        				    label: 'Sistema',
        				    icon: (
        				      <div className="w-full h-full rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center">
        				        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-300 to-blue-500 mb-2" />
        				        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 my-1" />
        				        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 my-1" />
        				        <div className="w-3/4 h-1 bg-gray-200 dark:bg-gray-700 mt-1" />
        				      </div>
        				    ),
        				  },
        				] as const).map(({ value, label, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTheme(value)}
                        className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                          theme === value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                        aria-pressed={theme === value}
                      >
                        <div className="w-full aspect-square max-h-24 mb-2">
                          {icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {label}
                        </span>
                        {theme === value && (
                          <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    A configuração do tema será aplicada a todo o site.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Primeiro dia da semana</h3>
                  <p className="text-sm text-gray-600 mb-3">Isso alterará como todos os calendários no aplicativo são exibidos.</p>
                  <select className="w-full rounded-md border border-gray-200 px-3 py-2">
                    <option value="sunday">Domingo</option>
                    <option value="monday">Segunda-feira</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cursor Suave</h3>
                    <p className="text-sm text-gray-600">Ativar animação suave do cursor</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</CardTitle>
              <CardDescription>Esta seção está em desenvolvimento.</CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  const sections: { id: Section; name: string; ptName: string }[] = [
    { id: 'profile', name: 'Perfil', ptName: 'Perfil' },
    { id: 'preferences', name: 'Preferências', ptName: 'Preferências' },
    { id: 'notifications', name: 'Notificações', ptName: 'Notificações' },
    { id: 'security', name: 'Segurança', ptName: 'Segurança' },
    { id: 'activity', name: 'Atividade', ptName: 'Atividade' },
    { id: 'connections', name: 'Conexões', ptName: 'Conexões' },
    { id: 'developer', name: 'Desenvolvedor', ptName: 'Desenvolvedor' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session?.user?.image} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === section.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {section.ptName}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {sections.find(s => s.id === activeSection)?.ptName}
            </h1>
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para o Painel
            </a>
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
