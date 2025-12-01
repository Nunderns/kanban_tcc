"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FaTimes, FaGoogle } from "react-icons/fa";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [processedCallback, setProcessedCallback] = useState(false);

  const handleGoogleSuccess = useCallback(async (user: { email: string; name?: string; image?: string }) => {
    try {
      toast.success("Conta Google conectada com sucesso!");
      if (invitationId) {
        try {
          const acceptRes = await fetch("/api/invitations/accept", {
            method: "POST",
            body: JSON.stringify({ 
              token: invitationId, 
              email: user.email, 
              slug: workspace 
            }),
            headers: { "Content-Type": "application/json" },
          });
          
          const acceptData = await acceptRes.json();
          if (acceptRes.ok) {
            toast.success("Você foi adicionado ao workspace com sucesso!");
            if (acceptData?.redirectUrl) {
              router.push(acceptData.redirectUrl);
              return;
            }
          } else {
            console.error("Failed to accept invitation:", acceptData);
          }
        } catch (error) {
          console.error("Error accepting invitation:", error);
        }
      }
      router.push("/post-login");
    } catch (error) {
      console.error("Error handling Google success:", error);
      toast.error("Erro ao processar login com Google");
    }
  }, [invitationId, workspace, router]);

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session?.user && !processedCallback) {
          router.push("/post-login");
        }
      } catch {
      }
    };

    checkExistingAuth();
  }, [router, processedCallback]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const invitationIdParam = searchParams.get("invitation_id");
    const workspaceParam = searchParams.get("workspace");
    
    if (emailParam) {
      setEmail(emailParam);
    }
    if (invitationIdParam) {
      setInvitationId(invitationIdParam);
    }
    if (workspaceParam) {
      setWorkspace(workspaceParam);
    }
    if (!processedCallback) {
      const checkGoogleCallback = async () => {
        try {
          const res = await fetch("/api/auth/session");
          const session = await res.json();
          
          if (session?.user) {
            setProcessedCallback(true);
            handleGoogleSuccess(session.user);
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      };

      checkGoogleCallback();
    }
  }, [searchParams, processedCallback, handleGoogleSuccess]);

  const validateFields = () => {
    const newErrors: { name: string; email: string; password: string } = {
      name: "",
      email: "",
      password: "",
    };

    let valid = true;

    if (!name) {
      newErrors.name = "O nome é obrigatório.";
      valid = false;
    }
    if (!email) {
      newErrors.email = "O email é obrigatório.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Insira um email válido.";
      valid = false;
    }
    if (!password) {
      newErrors.password = "A senha é obrigatória.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateFields()) return;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Conta criada com sucesso!");

      let loggedIn = false;
      try {
        const signInRes = await signIn("credentials", { redirect: false, email, password });
        loggedIn = !!signInRes && !signInRes.error;
      } catch {}

      if (invitationId && loggedIn) {
        try {
          const acceptRes = await fetch("/api/invitations/accept", {
            method: "POST",
            body: JSON.stringify({ 
              token: invitationId, 
              email, 
              slug: workspace 
            }),
            headers: { "Content-Type": "application/json" },
          });
          
          const acceptData = await acceptRes.json();
          if (acceptRes.ok) {
            toast.success("Você foi adicionado ao workspace com sucesso!");
            if (acceptData?.redirectUrl) return router.push(acceptData.redirectUrl);
          } else {
            console.error("Failed to accept invitation:", acceptData);
          }
        } catch (error) {
          console.error("Error accepting invitation:", error);
        }
      }
      if (!loggedIn && invitationId) {
        const qp = new URLSearchParams({ invitation_id: invitationId, email, workspace: workspace ?? "" }).toString();
        return router.push(`/login?callbackUrl=/register?${qp}`);
      }
      router.push("/login");
    } else {
      if (data.error.includes("email")) {
        setErrors((prev) => ({ ...prev, email: "Este email já está em uso." }));
      }
      toast.error(data.error || "Erro ao criar conta");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      let callbackUrl = "/register";
      if (invitationId || workspace) {
        const params = new URLSearchParams();
        if (invitationId) params.set("invitation_id", invitationId);
        if (workspace) params.set("workspace", workspace);
        callbackUrl += `?${params.toString()}`;
      }

      await signIn("google", { 
        callbackUrl,
        redirect: false 
      });
    } catch (error) {
      toast.error("Erro ao fazer login com Google");
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Criar uma conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              faça login na sua conta existente
            </Link>
          </p>
        </div>
        
        {/* Mensagem de convite */}
        {invitationId && (
          <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                  Você foi convidado para participar de um workspace!
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Crie sua conta para aceitar o convite e começar a colaborar.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <FaGoogle className="w-5 h-5 mr-2" />
              Continuar com Google
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Ou continue com email
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600`}
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600`}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs text-center text-gray-500 dark:text-gray-400">
              Ao se registrar, você concorda com nossos{' '}
              <button 
                type="button" 
                onClick={() => setShowTerms(true)} 
                className="text-indigo-600 hover:underline dark:text-indigo-400 focus:outline-none"
              >
                Termos de Serviço
              </button>{' '}
              e{' '}
              <button 
                type="button" 
                onClick={() => setShowPrivacy(true)} 
                className="text-indigo-600 hover:underline dark:text-indigo-400 focus:outline-none"
              >
                Política de Privacidade
              </button>
            </p>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Criar conta
              <ArrowRight className="ml-2 -mr-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Termos de Serviço – TaskFlow
              </h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors p-2 -mr-2"
                aria-label="Fechar"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 overflow-y-auto pr-2">
              <p className="mb-4">
                <strong>Última atualização:</strong> 29/11/2025
              </p>
              <p className="mb-6">
                Bem-vindo ao TaskFlow (&quot;Plataforma&quot;, &quot;Serviço&quot;, &quot;nós&quot;, &quot;nosso&quot;). Ao criar uma conta ou utilizar qualquer recurso da Plataforma, você (&quot;usuário&quot;) concorda integralmente com estes Termos de Serviço. Caso não concorde, não continue o uso.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">1. Aceitação dos Termos</h3>
              <p className="mb-4">
                Ao se cadastrar no TaskFlow, você concorda em cumprir estes Termos, nossa Política de Privacidade e todas as leis aplicáveis. Se você estiver usando o TaskFlow em nome de uma organização, você está concordando com estes Termos em nome dessa organização.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">2. Conta do Usuário</h3>
              <p className="mb-2">Para usar o TaskFlow, você deve:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Ter pelo menos 13 anos de idade</li>
                <li>Fornecer informações precisas e completas durante o cadastro</li>
                <li>Manter a segurança de sua senha</li>
                <li>Ser responsável por todas as atividades que ocorram em sua conta</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">3. Uso Aceitável</h3>
              <p className="mb-2">Você concorda em não:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
                <li>Violar quaisquer leis em sua jurisdição</li>
                <li>Enviar spam, vírus ou código malicioso</li>
                <li>Interferir na segurança ou integridade do serviço</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">4. Conteúdo do Usuário</h3>
              <p className="mb-4">
                Você é responsável por todo o conteúdo que enviar, publicar ou exibir no TaskFlow. Ao fazer upload de conteúdo, você nos concede uma licença mundial, não exclusiva e livre de royalties para usar, reproduzir, modificar e exibir tal conteúdo.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">5. Propriedade Intelectual</h3>
              <p className="mb-4">
                O TaskFlow e seu conteúdo original, recursos e funcionalidades são de nossa propriedade exclusiva. Nossas marcas registradas não podem ser usadas sem nossa permissão por escrito.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">6. Limitação de Responsabilidade</h3>
              <p className="mb-4">
                O TaskFlow é fornecido &quot;no estado em que se encontra&quot;. Não garantimos que o serviço será ininterrupto, oportuno, seguro ou livre de erros. Em nenhuma circunstância seremos responsáveis por quaisquer danos decorrentes do uso ou incapacidade de usar o serviço.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">7. Modificações nos Termos</h3>
              <p className="mb-4">
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos sobre alterações significativas. O uso contínuo do serviço após tais alterações constitui aceitação dos novos Termos.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">8. Encerramento</h3>
              <p className="mb-4">
                Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes Termos.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">9. Lei Aplicável</h3>
              <p className="mb-6">
                Estes Termos serão regidos pelas leis do Brasil, sem considerar seus conflitos de disposições legais.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">10. Contato</h3>
              <p className="mb-2">
                Dúvidas sobre estes Termos? Entre em contato:
              </p>
              <p className="mb-6">
                📧 suporte@taskflow.app
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Política de Privacidade – TaskFlow
              </h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors p-2 -mr-2"
                aria-label="Fechar"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 overflow-y-auto pr-2">
              <p className="mb-4">
                <strong>Última atualização:</strong> 29/11/2025
              </p>
              
              <p className="mb-6">
                No TaskFlow, sua privacidade é prioridade. Levamos a sério o compromisso de tratar seus dados com responsabilidade, segurança e transparência — seja você um usuário do TaskFlow Cloud ou de uma eventual versão self-hosted instalada na sua própria infraestrutura.
              </p>
              <p className="mb-6">
                Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações, além dos seus direitos em relação aos seus dados.
              </p>
              <p className="mb-6">
                Se você utiliza uma versão self-hosted, esta política se aplica apenas às interações com nosso site, canais de suporte e recursos opcionais de telemetria. Não temos acesso ao conteúdo da sua instância instalada localmente, a menos que você escolha compartilhar algo explicitamente.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">1. Escopo desta Política</h3>
              <p className="mb-4">Esta política se aplica às seguintes interações:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Serviços em nuvem fornecidos pelo TaskFlow Cloud</li>
                <li>Website taskflow.app, taskflow.com e páginas relacionadas</li>
                <li>Comunicações feitas via suporte, vendas ou formulários de contato</li>
                <li>Telemetria opcional utilizada em instalações self-hosted (somente com consentimento)</li>
              </ul>
              <p className="mb-6">
                Esta política <strong>NÃO</strong> se aplica ao conteúdo salvo em sua instância self-hosted do TaskFlow.
                Se você hospedar o TaskFlow por conta própria, seus dados permanecem exclusivamente no seu ambiente, exceto quando você nos envia algo voluntariamente para suporte.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">2. Informações que Coletamos</h3>
              <p className="mb-4">A coleta pode variar conforme sua interação com o TaskFlow.</p>
              
              <p className="font-medium mb-2">Quando você usa o TaskFlow Cloud ou visita nosso site:</p>
              <p className="mb-2">Coletamos:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Dados de contato:</strong> nome, email, telefone (quando fornecidos)</li>
                <li><strong>Dados de conta:</strong> foto de perfil, senha (criptografada), preferências, equipes</li>
                <li><strong>Informações de pagamento e faturamento</strong> (processadas por parceiros como Stripe)</li>
                <li><strong>Dados de uso:</strong> IP, navegador, sistema operacional, páginas acessadas, logs de atividade</li>
                <li><strong>Comunicações:</strong> mensagens enviadas via suporte, feedbacks, solicitações</li>
              </ul>

              <p className="font-medium mb-2">Quando utiliza o TaskFlow Self-Hosted:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>Nenhuma informação sobre suas tarefas, dados internos ou projetos é coletada por padrão.</li>
                <li>Podemos coletar telemetria mínima (ex.: versão do software, ambiente básico) somente se você optar por isso.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">3. Como Utilizamos Seus Dados</h3>
              <p className="mb-2">Usamos seus dados pessoais para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Operar, fornecer e melhorar o TaskFlow</li>
                <li>Autenticar e proteger sua conta</li>
                <li>Processar pagamentos e cobranças</li>
                <li>Responder a pedidos de suporte e dúvidas</li>
                <li>Enviar atualizações, novidades e conteúdos educativos</li>
                <li>Monitorar segurança, prevenir fraudes e cumprir obrigações legais</li>
              </ul>
              <p className="mb-6">
                Tratamos seus dados somente quando houver:
                <br />- Consentimento,
                <br />- Necessidade contratual, ou
                <br />- Interesse legítimo, quando permitido.
                <br /><br />
                Você pode cancelar comunicações promocionais a qualquer momento.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">4. Como Compartilhamos Informações</h3>
              <p className="mb-4">Nunca vendemos seus dados pessoais.</p>
              <p className="mb-2">Podemos compartilhá-los apenas com parceiros confiáveis que auxiliam na operação do serviço:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>Processadores de pagamento (ex.: Stripe)</li>
                <li>Provedores de hospedagem e infraestrutura</li>
                <li>Ferramentas de suporte e atendimento</li>
                <li>Serviços de e-mail e automação</li>
                <li>Obrigações legais (quando exigido por lei)</li>
              </ul>
              <p className="mb-6">Todos os parceiros seguem contratos rigorosos de proteção de dados.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">5. Sobre Usuários Self-Hosted</h3>
              <p className="mb-2">Para usuários que instalam o TaskFlow por conta própria:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>Não acessamos sua instância nem os dados nela armazenados.</li>
                <li>Você é o controlador total das informações e responsável pela segurança do ambiente.</li>
                <li>Somente coletaremos dados caso você:
                  <ul className="list-disc pl-6 mt-1">
                    <li>habilite telemetria voluntária, ou</li>
                    <li>compartilhe logs ou dados para receber suporte técnico.</li>
                  </ul>
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">6. Seus Direitos e Opções</h3>
              <p className="mb-2">Dependendo da legislação da sua região (LGPD, GDPR, etc.), você pode:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Solicitar acesso aos seus dados</li>
                <li>Solicitar retificação ou exclusão</li>
                <li>Pedir a portabilidade das informações</li>
                <li>Restringir ou contestar o processamento</li>
                <li>Revogar consentimento</li>
                <li>Cancelar comunicações não essenciais</li>
                <li>Solicitar que deixemos de compartilhar seus dados com terceiros permitidos por lei</li>
              </ul>
              <p className="mb-6">
                Para exercer esses direitos, entre em contato:
                <br />📧 privacidade@taskflow.app
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">7. Transferência Internacional de Dados</h3>
              <p className="mb-4">
                Se você estiver fora do Brasil ou dos EUA, seus dados podem ser processados em países onde operamos ou onde nossos parceiros possuem servidores.
              </p>
              <p className="mb-2">Empregamos salvaguardas como:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>Cláusulas contratuais padrão</li>
                <li>Criptografia</li>
                <li>Processamento mínimo necessário</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">8. Retenção de Dados</h3>
              <p className="mb-2">Mantemos seus dados apenas pelo tempo necessário para:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>fornecer e manter sua conta ativa</li>
                <li>cumprir obrigações legais e fiscais</li>
                <li>resolver disputas e prevenir abusos</li>
                <li>melhorar nossos serviços e segurança</li>
              </ul>
              <p className="mb-6">Quando os dados não forem mais necessários, eles são excluídos ou anonimizados.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">9. Segurança</h3>
              <p className="mb-2">Utilizamos medidas de segurança padrão da indústria, como:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Criptografia em repouso e em trânsito</li>
                <li>Controle de acesso</li>
                <li>Monitoramento e auditoria</li>
                <li>Proteção contra ataques comuns (DDoS, brute force etc.)</li>
              </ul>
              <p className="mb-6">
                Nenhum sistema é totalmente infalível.
                <br />Você também é responsável por proteger sua senha e dispositivos.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">10. Crianças e Menores de Idade</h3>
              <p className="mb-6">
                O TaskFlow não é destinado a menores de 13 anos.
                <br />Se identificarmos dados coletados inadvertidamente de um menor, removeremos imediatamente.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">11. Alterações nesta Política</h3>
              <p className="mb-6">
                Podemos atualizar esta Política conforme nossa evolução.
                <br />Mudanças significativas serão comunicadas por e-mail ou notificação no produto.
                <br />A versão mais recente estará sempre disponível em: <span className="text-blue-600">/privacy</span>
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">12. Contato</h3>
              <p className="mb-2">Se tiver dúvidas, sugestões ou solicitações relacionadas à privacidade:</p>
              <p className="mb-1">TaskFlow – Departamento de Privacidade</p>
              <p className="mb-6">📧 privacidade@taskflow.app</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
