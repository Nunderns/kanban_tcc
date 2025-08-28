"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Sidebar from "@/components/Sidebar";

interface Activity {
  id: number;
  user: string;
  action: string;
  field?: string;
  taskTitle: string;
  createdAt: string;
  oldValue?: string;
  newValue?: string;
}

type Section = 'profile' | 'preferences' | 'notifications' | 'security' | 'activity' | 'connections' | 'developer';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const name = session?.user?.name || "Usuário";
  const email = session?.user?.email || "";

  // Activity state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch activities when the component mounts or when the active section changes to 'activity'
  useEffect(() => {
    const fetchActivities = async () => {
      if (activeSection !== 'activity') return;
      
      console.log('Fetching activities...');
      setIsLoadingActivities(true);
      try {
        setError(null);
        const response = await fetch('/api/activities', {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Invalid content type: ${contentType}, Response: ${text}`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch activities');
        }
        
        console.log('Activities fetched successfully:', data);
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        let errorMessage = 'Unknown error occurred';
        if (err instanceof Error) {
          errorMessage = err.message;
          console.error('Error details:', {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        console.error('Error fetching activities:', errorMessage);
        setError(`Falha ao carregar atividades. Por favor, tente novamente.`);
        setActivities([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [activeSection]);

  // Format date to relative time (e.g., "2 hours ago")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    }
    
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format activity message based on action type
  const formatActivityMessage = (activity: Activity) => {
    const { action, field, taskTitle, oldValue, newValue } = activity;
    
    switch (action) {
      case 'create':
        return `criou a tarefa "${taskTitle}"`;
      case 'update':
        if (field === 'status') {
          return `alterou o status de "${taskTitle}" de "${oldValue}" para "${newValue}"`;
        } else if (field === 'assignee') {
          if (newValue) {
            return `atribuiu "${taskTitle}" para ${newValue}`;
          } else {
            return `removeu a atribuição de "${taskTitle}"`;
          }
        } else if (field) {
          return `atualizou ${field} de "${taskTitle}"`;
        }
        return `atualizou a tarefa "${taskTitle}"`;
      case 'delete':
        return `excluiu a tarefa "${taskTitle}"`;
      case 'comment':
        return `comentou em "${taskTitle}"`;
      default:
        return `realizou uma ação em "${taskTitle}"`;
    }
  };
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [notifyPropertyChanges, setNotifyPropertyChanges] = useState<boolean>(true);
  const [notifyStateChange, setNotifyStateChange] = useState<boolean>(true);
  const [notifyWorkItemCompleted, setNotifyWorkItemCompleted] = useState<boolean>(false);
  const [notifyComments, setNotifyComments] = useState<boolean>(true);
  const [notifyMentions, setNotifyMentions] = useState<boolean>(true);
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Falha ao alterar a senha' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Ocorreu um erro. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

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

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações por e-mail</CardTitle>
                <CardDescription>Mantenha-se informado sobre itens de trabalho que você acompanha. Ative para ser notificado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações por e-mail</h3>
                    <p className="text-sm text-gray-600">Mantenha-se atualizado sobre os itens de trabalho que você acompanha. Ative para receber notificações.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailNotifications ?? false}
                      onChange={() => setEmailNotifications(v => !v)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Mudanças nas propriedades</h3>
                    <p className="text-sm text-gray-600">Me notifique quando as propriedades dos itens de trabalho, como responsáveis, prioridade, estimativas ou qualquer outra coisa, forem alteradas.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifyPropertyChanges ?? false}
                      onChange={() => setNotifyPropertyChanges(v => !v)}
                      disabled={!emailNotifications}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Mudança de estado</h3>
                    <p className="text-sm text-gray-600">Me notifique quando o item de trabalho mudar para um estado diferente.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifyStateChange ?? false}
                      onChange={() => setNotifyStateChange(v => !v)}
                      disabled={!emailNotifications}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Item concluído</h3>
                    <p className="text-sm text-gray-600">Me notifique apenas quando um item de trabalho for concluído.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifyWorkItemCompleted ?? false}
                      onChange={() => setNotifyWorkItemCompleted(v => !v)}
                      disabled={!emailNotifications}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Comentários</h3>
                    <p className="text-sm text-gray-600">Me notifique quando alguém deixar um comentário no item de trabalho.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifyComments ?? false}
                      onChange={() => setNotifyComments(v => !v)}
                      disabled={!emailNotifications}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Menções</h3>
                    <p className="text-sm text-gray-600">Me notifique apenas quando alguém me mencionar nos comentários ou descrição.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifyMentions ?? false}
                      onChange={() => setNotifyMentions(v => !v)}
                      disabled={!emailNotifications}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-2">
                  <Button type="button" variant="outline" onClick={() => { /* TODO: persist settings */ }}>
                    Salvar preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Gerencie suas configurações de segurança e senha</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Alterar senha</h3>
                  {message && (
                    <div className={`mb-4 p-3 rounded-md ${
                      message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {message.text}
                    </div>
                  )}
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha atual
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Nova senha
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Digite a nova senha"
                        minLength={8}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        A senha deve ter pelo menos 8 caracteres
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar nova senha
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirme a nova senha"
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Alterando senha...' : 'Alterar senha'}
                      </button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividades</CardTitle>
                <CardDescription>Acompanhe suas ações recentes e alterações em todos os projetos e itens de trabalho.</CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-red-600 font-medium mb-2">Erro ao carregar atividades</div>
                    <p className="text-sm text-red-500">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-3 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : isLoadingActivities ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma atividade recente encontrada.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex-shrink-0 mr-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {activity.user.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span>{' '}
                            {formatActivityMessage(activity)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
      <div className="w-72">
        <Sidebar />
      </div>

      {/* Settings local sidebar */}
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
