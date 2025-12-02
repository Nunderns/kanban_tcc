"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X } from "lucide-react";
import { GoogleConnectButton } from "@/components/GoogleConnectButton";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const params = useParams();
  const { theme, setTheme } = useTheme();
  const name = session?.user?.name || "Usuário";
  const email = session?.user?.email || "";

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && !target.closest('.sidebar') && !target.closest('.menu-button')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const normalizeFieldKey = (field?: string) => field?.replace(/[\s_-]/g, '').toLowerCase() ?? '';
  const FIELD_LABELS: Record<string, string> = {
    status: 'status',
    priority: 'prioridade',
    duedate: 'prazo',
    startdate: 'data de início',
    enddate: 'data final',
    assignee: 'responsável',
    assignedto: 'responsável',
    assigneduserid: 'responsável',
    title: 'título',
    description: 'descrição',
    module: 'módulo',
    cycle: 'ciclo',
    project: 'projeto',
    projectid: 'projeto',
    workspaceid: 'workspace',
    assignees: 'responsáveis',
    labels: 'etiquetas',
  };
  const STATUS_LABELS: Record<string, string> = {
    BACKLOG: 'Backlog',
    TODO: 'A Fazer',
    IN_PROGRESS: 'Em andamento',
    REVIEW: 'Em revisão',
    DONE: 'Concluído',
  };
  const PRIORITY_LABELS: Record<string, string> = {
    HIGH: 'Alta',
    MEDIUM: 'Média',
    LOW: 'Baixa',
    NONE: 'Nenhuma',
  };
  const formatFieldLabel = (field?: string) => {
    if (!field) return 'campo';
    const key = normalizeFieldKey(field);
    return FIELD_LABELS[key] ?? field;
  };
  const formatFieldValue = (field?: string, value?: string) => {
    if (!value) return 'não definido';
    const normalizedField = normalizeFieldKey(field);

    if (normalizedField.includes('date')) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    }

    if (normalizedField === 'status') {
      const key = value.toUpperCase();
      return STATUS_LABELS[key] ?? value;
    }

    if (normalizedField === 'priority') {
      const key = value.toUpperCase();
      return PRIORITY_LABELS[key] ?? value;
    }

    return value;
  };
  const ACTION_TONES = {
    create: {
      label: 'Criação',
      avatarBg: 'bg-green-100 dark:bg-green-500/10',
      avatarText: 'text-green-700 dark:text-green-300',
      badge: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300',
    },
    'updated field': {
      label: 'Atualização',
      avatarBg: 'bg-blue-100 dark:bg-blue-500/10',
      avatarText: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    },
    update: {
      label: 'Atualização',
      avatarBg: 'bg-blue-100 dark:bg-blue-500/10',
      avatarText: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    },
    comment: {
      label: 'Comentário',
      avatarBg: 'bg-yellow-100 dark:bg-yellow-500/10',
      avatarText: 'text-yellow-700 dark:text-yellow-300',
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200',
    },
    commented: {
      label: 'Comentário',
      avatarBg: 'bg-yellow-100 dark:bg-yellow-500/10',
      avatarText: 'text-yellow-700 dark:text-yellow-300',
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200',
    },
    delete: {
      label: 'Exclusão',
      avatarBg: 'bg-red-100 dark:bg-red-500/10',
      avatarText: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    },
    deleted: {
      label: 'Exclusão',
      avatarBg: 'bg-red-100 dark:bg-red-500/10',
      avatarText: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    },
    assigned: {
      label: 'Atribuição',
      avatarBg: 'bg-purple-100 dark:bg-purple-500/10',
      avatarText: 'text-purple-700 dark:text-purple-300',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
    },
    default: {
      label: 'Atividade',
      avatarBg: 'bg-gray-100 dark:bg-gray-700',
      avatarText: 'text-gray-700 dark:text-gray-200',
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    },
  } as const;
  const getActionTone = (action?: string) => {
    const normalized = action?.toLowerCase() ?? 'default';
    return ACTION_TONES[normalized as keyof typeof ACTION_TONES] ?? ACTION_TONES.default;
  };

  const formatActivityMessage = (activity: Activity) => {
    const { action, field, taskTitle, oldValue, newValue } = activity;
    const normalizedAction = action?.toLowerCase?.() ?? '';
    const fieldLabel = formatFieldLabel(field);
    const oldVal = formatFieldValue(field, oldValue);
    const newVal = formatFieldValue(field, newValue);
    const hasOldValue = oldValue !== undefined;
    const hasNewValue = newValue !== undefined;
    const ValueChip = (value: string, tone: 'old' | 'new') => (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${tone === 'old'
            ? 'border-red-200 text-red-600 dark:border-red-500/30 dark:text-red-300'
            : 'border-green-200 text-green-600 dark:border-green-500/30 dark:text-green-300'
          }`}
      >
        {value}
      </span>
    );
    const renderTaskReference = () => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">&ldquo;{taskTitle}&rdquo;</span>
    );

    if (normalizedAction === 'create') {
      return (
        <span>
          <span className="text-green-600 dark:text-green-400 font-semibold">criou</span>{' '}
          a tarefa {renderTaskReference()}
        </span>
      );
    }

    if (normalizedAction === 'delete' || normalizedAction === 'deleted') {
      return (
        <span>
          <span className="text-red-600 dark:text-red-400 font-semibold">excluiu</span>{' '}
          a tarefa <span className="font-semibold line-through">&ldquo;{taskTitle}&rdquo;</span>
        </span>
      );
    }

    if (normalizedAction === 'comment' || normalizedAction === 'commented') {
      return (
        <span>
          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">comentou</span>{' '}
          na tarefa {renderTaskReference()}
        </span>
      );
    }

    const isAssignment = normalizeFieldKey(field) === 'assignee' || normalizeFieldKey(field) === 'assigneduserid';
    if (isAssignment && hasNewValue && !hasOldValue) {
      return (
        <span>
          <span className="text-purple-600 dark:text-purple-400 font-semibold">atribuiu</span>{' '}
          a tarefa {renderTaskReference()} para{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-300">{newVal}</span>
        </span>
      );
    }

    if (isAssignment && hasOldValue && !hasNewValue) {
      return (
        <span>
          <span className="text-orange-600 dark:text-orange-400 font-semibold">removeu a atribuição</span>{' '}
          da tarefa {renderTaskReference()}
        </span>
      );
    }

    return (
      <div>
        <span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">atualizou</span>{' '}
          {field ? (
            <>
              o campo <span className="font-medium text-gray-900 dark:text-gray-100">{fieldLabel}</span>{' '}
              da tarefa {renderTaskReference()}
            </>
          ) : (
            <>a tarefa {renderTaskReference()}</>
          )}
        </span>

        {(hasOldValue || hasNewValue) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
            {hasOldValue && (
              <>
                <span>de</span>
                {ValueChip(oldVal, 'old')}
              </>
            )}
            {hasNewValue && (
              <>
                <span>{hasOldValue ? 'para' : 'para'}</span>
                {ValueChip(newVal, 'new')}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    notifyPropertyChanges: true,
    notifyStateChange: true,
    notifyWorkItemCompleted: false,
    notifyComments: true,
    notifyMentions: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const response = await fetch('/api/user/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotificationSettings(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    };

    if (activeSection === 'notifications') {
      loadNotificationSettings();
    }
  }, [activeSection]);

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    const newValue = !notificationSettings[key];

    if (key === 'emailNotifications' && !newValue) {
      setNotificationSettings(prev => ({
        ...prev,
        emailNotifications: false,
        notifyPropertyChanges: false,
        notifyStateChange: false,
        notifyWorkItemCompleted: false,
        notifyComments: false,
        notifyMentions: false
      }));
    } else {
      setNotificationSettings(prev => ({
        ...prev,
        [key]: newValue
      }));
    }
  };

  const loadNotificationSettings = async () => {
    try {
      console.log('Fetching notification settings...');
      const response = await fetch('/api/user/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load settings:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Falha ao carregar configurações: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json().catch(error => {
        console.error('Error parsing JSON response:', error);
        throw new Error('Resposta inválida do servidor');
      });

      console.log('Received notification settings:', responseData);

      if (responseData && typeof responseData === 'object') {
        setNotificationSettings({
          emailNotifications: responseData.emailNotifications ?? true,
          notifyPropertyChanges: responseData.notifyPropertyChanges ?? true,
          notifyStateChange: responseData.notifyStateChange ?? true,
          notifyWorkItemCompleted: responseData.notifyWorkItemCompleted ?? false,
          notifyComments: responseData.notifyComments ?? true,
          notifyMentions: responseData.notifyMentions ?? true
        });
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      setNotificationSettings({
        emailNotifications: true,
        notifyPropertyChanges: true,
        notifyStateChange: true,
        notifyWorkItemCompleted: false,
        notifyComments: true,
        notifyMentions: true
      });

      setSaveStatus({
        type: 'error',
        message: 'Erro ao carregar configurações. Usando configurações padrão.'
      });

      const timer = setTimeout(() => setSaveStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    if (activeSection === 'notifications') {
      loadNotificationSettings();
    }
  }, [activeSection]);

  const saveNotificationSettings = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotifications: notificationSettings.emailNotifications,
          notifyPropertyChanges: notificationSettings.notifyPropertyChanges,
          notifyStateChange: notificationSettings.notifyStateChange,
          notifyWorkItemCompleted: notificationSettings.notifyWorkItemCompleted,
          notifyComments: notificationSettings.notifyComments,
          notifyMentions: notificationSettings.notifyMentions
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || 'Falha ao salvar configurações';
        console.error('API Error:', errorMessage, responseData);
        throw new Error(errorMessage);
      }

      if (responseData.success && typeof responseData === 'object') {
        const {
          emailNotifications,
          notifyPropertyChanges,
          notifyStateChange,
          notifyWorkItemCompleted,
          notifyComments,
          notifyMentions
        } = responseData;

        setNotificationSettings({
          emailNotifications: Boolean(emailNotifications ?? true),
          notifyPropertyChanges: Boolean(notifyPropertyChanges ?? true),
          notifyStateChange: Boolean(notifyStateChange ?? true),
          notifyWorkItemCompleted: Boolean(notifyWorkItemCompleted ?? false),
          notifyComments: Boolean(notifyComments ?? true),
          notifyMentions: Boolean(notifyMentions ?? true)
        });
      }

      setSaveStatus({
        type: 'success',
        message: 'Configurações salvas com sucesso!'
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao salvar configurações'
      });
    } finally {
      setIsSaving(false);
      const timer = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  };

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

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Sign out and redirect to login
        await signOut({ redirect: false });
        router.push('/login');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir a conta');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Ocorreu um erro ao excluir sua conta. Por favor, tente novamente.');
      setIsDeleting(false);
    }
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
                  <Avatar className="h-9 w-9 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                    <AvatarImage src={session?.user?.image ?? undefined} alt={name} />
                    <AvatarFallback>{getInitials(name || email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{name}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-400">{email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome Completo
                    </label>
                    <input
                      id="fullName"
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 dark:bg-gray-800 dark:text-white"
                      defaultValue={name}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white"
                      defaultValue={email}
                      disabled
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button>Salvar alterações</Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Excluir conta
                  </Button>
                </div>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá todos os dados associados.</p>
                        <p className="font-medium text-red-600 dark:text-red-400">
                          Todos os seus dados, incluindo projetos, tarefas e configurações, serão permanentemente removidos.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      >
                        {isDeleting ? 'Excluindo...' : 'Sim, excluir minha conta'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                    <h3 className="font-medium text-gray-900 dark:text-white">Tema</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400 mb-4">
                      Escolha como o Kanban TCC é exibido para você
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {mounted && theme && ([
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
                        className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${theme === value
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

                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    A configuração do tema será aplicada a todo o site.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Primeiro dia da semana</h3>
                  <p className="text-sm text-gray-700 mb-3">Isso alterará como todos os calendários no aplicativo são exibidos.</p>
                  <select className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 dark:bg-gray-800 dark:text-white">
                    <option value="sunday">Domingo</option>
                    <option value="monday">Segunda-feira</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Cursor Suave</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Ativar animação suave do cursor</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {saveStatus && (
              <div className={`p-3 rounded-md ${saveStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {saveStatus.message}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Notificações por e-mail</CardTitle>
                <CardDescription>Mantenha-se informado sobre itens de trabalho que você acompanha. Ative para ser notificado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Notificações por e-mail</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Mantenha-se atualizado sobre os itens de trabalho que você acompanha. Ative para receber notificações.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Mudanças nas propriedades</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Me notifique quando as propriedades dos itens de trabalho, como responsáveis, prioridade, estimativas ou qualquer outra coisa, forem alteradas.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.notifyPropertyChanges}
                      onChange={() => handleNotificationChange('notifyPropertyChanges')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <div className={`w-11 h-6 ${!notificationSettings.emailNotifications ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Mudança de estado</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Me notifique quando o item de trabalho mudar para um estado diferente.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.notifyStateChange}
                      onChange={() => handleNotificationChange('notifyStateChange')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <div className={`w-11 h-6 ${!notificationSettings.emailNotifications ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Item concluído</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Me notifique apenas quando um item de trabalho for concluído.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.notifyWorkItemCompleted}
                      onChange={() => handleNotificationChange('notifyWorkItemCompleted')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <div className={`w-11 h-6 ${!notificationSettings.emailNotifications ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Comentários</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Me notifique quando alguém deixar um comentário no item de trabalho.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.notifyComments}
                      onChange={() => handleNotificationChange('notifyComments')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <div className={`w-11 h-6 ${!notificationSettings.emailNotifications ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Menções</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Me notifique apenas quando alguém me mencionar nos comentários ou descrição.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.notifyMentions}
                      onChange={() => handleNotificationChange('notifyMentions')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <div className={`w-11 h-6 ${!notificationSettings.emailNotifications ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveNotificationSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar preferências'}
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
                    <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                      <p className="mt-1 text-xs text-gray-600">
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
                  <div className="text-center py-8 text-gray-900 dark:text-gray-500">
                    Nenhuma atividade recente encontrada.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activities.map((activity) => {
                      const tone = getActionTone(activity.action);
                      return (
                        <div key={activity.id} className="relative flex gap-4 pl-4">
                          <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-800" aria-hidden />
                          <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full font-semibold ${tone.avatarBg} ${tone.avatarText}`}>
                            {activity.user.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 space-y-2 pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activity.user}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}>
                                {tone.label}
                              </span>
                              <span>·</span>
                              <span>{formatDate(activity.createdAt)}</span>
                            </div>

                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {formatActivityMessage(activity)}
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                {activity.taskTitle}
                              </span>
                              {activity.field && (
                                <span className="rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                                  {formatFieldLabel(activity.field)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'connections':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conexões de Conta</CardTitle>
                <CardDescription>Gerencie suas conexões com serviços de terceiros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.88-1.757-4.382-2.832-6.735-2.832-5.522 0-10 4.479-10 10s4.478 10 10 10c8.396 0 10-7.496 10-9.634 0-0.996-0.102-1.277-0.201-1.491h-9.8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Google</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Conecte sua conta do Google</p>
                      </div>
                    </div>
                    {session?.user?.provider === 'google' ? (
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Conectado
                        </span>
                        <button
                          onClick={() => {
                            alert('Funcionalidade de desconexão do Google será implementada em breve');
                          }}
                          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Desconectar
                        </button>
                      </div>
                    ) : (
                      <GoogleConnectButton />
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Permissões</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Acesso ao seu endereço de e-mail
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Acesso ao seu nome e foto de perfil
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Por que conectar com o Google?</h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>Conecte sua conta do Google para fazer login mais rapidamente e sincronizar suas preferências entre dispositivos.</p>
                      </div>
                    </div>
                  </div>
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
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none menu-button"
        >
          <span className="sr-only">Abrir menu</span>
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {sections.find(s => s.id === activeSection)?.ptName}
        </h1>
        <div className="w-6"></div> {/* Spacer for flex alignment */}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto sidebar`}
      >
        <div className="p-6 pr-4 h-full flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1 pr-2">
              <Avatar className="h-9 w-9 flex-shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                <AvatarImage src={session?.user?.image} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-400 truncate">{email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeSection === section.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {section.ptName}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-auto mt-16 md:mt-0">
        <div className="max-w-3xl mx-auto">
          <div className="hidden md:flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sections.find(s => s.id === activeSection)?.ptName}
            </h1>
            <a
              href={`/${params.workspaceSlug}/dashboard`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
