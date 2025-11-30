"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FaSpinner, FaGoogle, FaTimes } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/post-login");
    }
  }, [status, router]);

  const validateFields = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;

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
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFields()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Email ou senha inválidos");
      } else {
        toast.success("Login bem-sucedido!");
        router.push("/post-login");
      }
    } catch {
      toast.error("Ocorreu um erro ao tentar fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/post-login" });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Por favor, insira seu email");
      return;
    }

    setIsSendingReset(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email de recuperação enviado com sucesso!");
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      } else {
        toast.error(data.message || "Erro ao enviar email de recuperação");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Erro ao processar sua solicitação");
    } finally {
      setIsSendingReset(false);
    }
  };

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-6 text-black dark:text-white">
          TaskFlow
        </h1>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mb-6 transition-colors"
        >
          <FaGoogle className="h-5 w-5 text-red-500" />
          {isLoading ? "Entrando com Google..." : "Entrar com Google"}
        </button>

        <div className="relative w-full max-w-xs my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              ou
            </span>
          </div>
        </div>

        <form className="w-full max-w-xs" onSubmit={handleLogin}>
          <label className="block mb-2 text-gray-800 dark:text-gray-200 font-medium">
            Email
          </label>
          <input
            type="email"
            className={`w-full p-2 border ${
              errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } rounded-md text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}

          <label className="block mt-4 mb-2 text-gray-800 dark:text-gray-200 font-medium">
            Senha
          </label>
          <input
            type="password"
            className={`w-full p-2 border ${
              errors.password
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-md text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            Ao entrar, você concorda com os{' '}
            <button 
              type="button" 
              onClick={() => setShowTerms(true)} 
              className="text-blue-600 hover:underline dark:text-blue-400 focus:outline-none"
            >
              Termos de Serviço
            </button>{' '}
            e{' '}
            <button 
              type="button" 
              onClick={() => setShowPrivacy(true)} 
              className="text-blue-600 hover:underline dark:text-blue-400 focus:outline-none"
            >
              Política de Privacidade
            </button>
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar com Email"
            )}
          </button>

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Esqueceu sua senha?
            </button>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 items-center justify-center transition-colors">
        <div className="text-center text-white p-10 max-w-lg">
          <h2 className="text-3xl font-bold mb-4">Bem-vindo ao TaskFlow</h2>
          <p className="text-lg mb-8">
            Gerencie suas tarefas de forma simples e eficiente.
          </p>
          <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md p-6 rounded-lg text-left">
            <h3 className="text-xl font-semibold mb-4">
              Por que usar o TaskFlow?
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Organize suas tarefas em quadros visuais</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Colabore com sua equipe em tempo real</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-300 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Acompanhe o progresso de seus projetos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative shadow-xl">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recuperar Senha
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300">
                Digite seu endereço de email e enviaremos um link para redefinir sua senha.
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label 
                    htmlFor="forgot-email" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendingReset ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
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
                Bem-vindo ao TaskFlow (&quot;Plataforma&quot;, &quot;Serviço&quot;, &quot;nós&quot;, &quot;nosso&quot;).
                Ao criar uma conta ou utilizar qualquer recurso da Plataforma, você (&quot;usuário&quot;) concorda integralmente com estes Termos de Serviço. Caso não concorde, não continue o uso.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">1. Sobre o TaskFlow</h3>
              <p className="mb-4">
                O TaskFlow é uma plataforma online destinada ao gerenciamento de tarefas, organização de fluxos de trabalho, colaboração em equipe e acompanhamento de projetos.
              </p>
              <p className="mb-2">Nossos recursos podem incluir:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Quadros de tarefas estilo Kanban</li>
                <li>Projetos compartilhados</li>
                <li>Gerenciamento de equipes</li>
                <li>Acompanhamento de progresso</li>
                <li>Integrações com serviços externos</li>
                <li>Ferramentas de produtividade e automação</li>
              </ul>
              <p className="mb-6">A Plataforma pode evoluir continuamente com novos recursos, correções ou melhorias.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">2. Elegibilidade</h3>
              <p className="mb-4">Para utilizar o TaskFlow você declara que:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>possui ao menos 18 anos;</li>
                <li>tem capacidade legal para aceitar estes Termos;</li>
                <li>fornecerá informações verdadeiras, precisas e atualizadas.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">3. Cadastro e Segurança da Conta</h3>
              <p className="mb-2">Ao se registrar no TaskFlow, você concorda que:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>é responsável por manter suas credenciais seguras;</li>
                <li>não compartilhará seu acesso com terceiros;</li>
                <li>nos notificará caso suspeite de uso indevido da sua conta.</li>
              </ul>
              <p className="mb-6">Não somos responsáveis por danos decorrentes do uso não autorizado da conta.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">4. Licença de Uso</h3>
              <p className="mb-2">Concedemos uma licença limitada, não exclusiva e revogável para acessar e utilizar o TaskFlow conforme estes Termos.</p>
              <p className="mb-2">Não é permitida a:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>cópia, modificação ou engenharia reversa do serviço;</li>
                <li>exploração comercial não autorizada do software;</li>
                <li>tentativa de burlar sistemas de segurança.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">5. Uso Aceitável</h3>
              <p className="mb-2">Você concorda em não utilizar o TaskFlow para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>atividades ilegais, ofensivas ou abusivas;</li>
                <li>armazenar conteúdo que infrinja direitos de terceiros;</li>
                <li>tentar comprometer a segurança da plataforma;</li>
                <li>enviar spam, bots ou automações maliciosas;</li>
                <li>interferir no funcionamento normal do serviço.</li>
              </ul>
              <p className="mb-6">Detectado uso indevido, sua conta pode ser suspensa imediatamente.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">6. Conteúdo do Usuário</h3>
              <p className="mb-2">Você mantém seus direitos sobre qualquer conteúdo enviado ou criado no TaskFlow (&quot;Conteúdo do Usuário&quot;).</p>
              <p className="mb-2">Ao usar o Serviço, você nos concede permissão limitada para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>armazenar seus dados;</li>
                <li>processar, exibir e sincronizá-los para fornecer o serviço;</li>
                <li>realizar backups e otimizações técnicas.</li>
              </ul>
              <p className="mb-6">Nós não revendemos, não compartilhamos e não utilizamos seus dados para fins comerciais fora da operação da plataforma.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">7. Privacidade</h3>
              <p className="mb-6">
                O uso do TaskFlow também é regido pela nossa Política de Privacidade, disponível em:{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">
                  /privacy
                </Link>
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">8. Planos, Pagamentos e Assinaturas (se aplicável)</h3>
              <p className="mb-2">Se o TaskFlow oferecer planos pagos, as seguintes regras serão aplicadas:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>assinaturas são renovadas automaticamente;</li>
                <li>você pode cancelar a qualquer momento;</li>
                <li>valores pagos não são reembolsáveis, salvo determinação legal;</li>
                <li>falha no pagamento pode resultar na suspensão do acesso a recursos premium.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">9. Modificações no Serviço</h3>
              <p className="mb-2">Podemos:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>atualizar recursos;</li>
                <li>alterar funcionalidades;</li>
                <li>descontinuar partes da plataforma.</li>
              </ul>
              <p className="mb-6">Sempre que possível, notificaremos com antecedência.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">10. Disponibilidade e Garantias</h3>
              <p className="mb-2">O TaskFlow é oferecido &quot;como está&quot;.</p>
              <p className="mb-2">Não garantimos:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>disponibilidade contínua 24/7;</li>
                <li>ausência de bugs ou falhas;</li>
                <li>compatibilidade com todos dispositivos, navegadores ou integrações.</li>
              </ul>
              <p className="mb-6">Nosso objetivo é manter o serviço estável, mas interrupções podem ocorrer.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">11. Limitação de Responsabilidade</h3>
              <p className="mb-2">Na extensão máxima permitida por lei, o TaskFlow não é responsável por:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>perda de dados causada por fatores externos;</li>
                <li>indisponibilidade da plataforma;</li>
                <li>danos indiretos, lucros cessantes ou prejuízos decorrentes do uso do serviço.</li>
              </ul>
              <p className="mb-6">Você é responsável por manter backups de qualquer informação sensível.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">12. Cancelamento e Encerramento</h3>
              <p className="mb-2">Você pode excluir sua conta a qualquer momento.</p>
              <p className="mb-2">Podemos suspender ou encerrar o acesso caso identifiquemos:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>violação destes Termos;</li>
                <li>uso fraudulento;</li>
                <li>ameaças à segurança da plataforma.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">13. Propriedade Intelectual</h3>
              <p className="mb-6">
                Todo o conteúdo da plataforma, incluindo interface, logotipos, marca TaskFlow, código e componentes, pertence exclusivamente ao TaskFlow e não pode ser copiado ou reutilizado sem permissão.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">14. Comunicações</h3>
              <p className="mb-2">Você concorda em receber comunicações relacionadas à sua conta, como:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>avisos técnicos,</li>
                <li>alertas de segurança,</li>
                <li>informações sobre as funcionalidades.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">15. Alterações nos Termos</h3>
              <p className="mb-6">
                Podemos atualizar estes Termos periodicamente.
                A continuidade de uso após a atualização significa aceitação automática.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">16. Contato</h3>
              <p className="mb-6">
                Em caso de dúvidas, fale conosco:
                <br />
                📧 suporte@taskflow.com
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
    </div>
  );
}
