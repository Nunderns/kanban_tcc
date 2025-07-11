"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!mounted) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Política de Privacidade</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="prose max-w-none space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Política de Privacidade da TaskFlow</h3>
            <p className="text-gray-600 mb-8"><strong>Última atualização: 11 de julho de 2025</strong></p>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">1. Introdução</h4>
              <p className="text-gray-700 leading-relaxed">
                A TaskFlow ("nós", "nosso" ou "empresa") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando você utiliza nossa plataforma de gerenciamento de projetos e tarefas ("Serviço").
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">2. Informações que Coletamos</h4>
              <p className="text-gray-700 leading-relaxed mb-3">
                Coletamos os seguintes tipos de informações:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-700">
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Informações de Registro:</strong></p>
                  <p>Quando você cria uma conta, coletamos seu nome, endereço de e-mail, senha e outras informações de perfil opcionais.</p>
                </li>
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Dados de Uso:</strong></p>
                  <p>Coletamos informações sobre como você interage com nosso Serviço, incluindo as páginas que você visita, as ações que realiza e o tempo que passa na plataforma.</p>
                </li>
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Conteúdo do Usuário:</strong></p>
                  <p>Armazenamos o conteúdo que você cria, carrega ou compartilha através do nosso Serviço, como tarefas, projetos, comentários e arquivos.</p>
                </li>
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Informações do Dispositivo:</strong></p>
                  <p>Coletamos informações sobre o dispositivo que você usa para acessar nosso Serviço, incluindo modelo de hardware, sistema operacional, endereço IP e identificadores de dispositivo.</p>
                </li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">3. Como Usamos Suas Informações</h4>
              <p className="text-gray-700 leading-relaxed mb-3">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Fornecer, manter e melhorar nosso Serviço</li>
                <li>Processar e completar transações</li>
                <li>Enviar informações técnicas, atualizações e mensagens administrativas</li>
                <li>Responder a seus comentários, perguntas e solicitações</li>
                <li>Monitorar e analisar tendências, uso e atividades relacionadas ao nosso Serviço</li>
                <li>Detectar, investigar e prevenir atividades fraudulentas e não autorizadas</li>
                <li>Personalizar e melhorar sua experiência no Serviço</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">4. Compartilhamento de Informações</h4>
              <p className="text-gray-700 leading-relaxed mb-3">
                Podemos compartilhar suas informações nas seguintes circunstâncias:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-700">
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Com outros usuários:</strong></p>
                  <p>Quando você colabora em projetos ou tarefas, suas informações de perfil e conteúdo podem ser visíveis para outros usuários com permissões adequadas.</p>
                </li>
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Com prestadores de serviços:</strong></p>
                  <p>Compartilhamos informações com fornecedores terceirizados que nos ajudam a operar, fornecer e melhorar nosso Serviço.</p>
                </li>
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Para conformidade legal:</strong></p>
                  <p>Podemos divulgar informações se acreditarmos que tal ação é necessária para cumprir a lei, ordens judiciais ou processos legais.</p>
                </li>
                <li>
                  <p className="mb-1"><strong className="text-gray-800">Em caso de transferência de negócios:</strong></p>
                  <p>Se a TaskFlow estiver envolvida em uma fusão, aquisição ou venda de ativos, suas informações podem ser transferidas como parte desse processo.</p>
                </li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">5. Segurança de Dados</h4>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum sistema é completamente seguro, e não podemos garantir a segurança absoluta de suas informações.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">6. Retenção de Dados</h4>
              <p className="text-gray-700 leading-relaxed">
                Mantemos suas informações pelo tempo necessário para fornecer o Serviço e cumprir nossas obrigações legais. Se você excluir sua conta, podemos reter certas informações por um período limitado para fins legais ou comerciais legítimos.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">7. Seus Direitos</h4>
              <p className="text-gray-700 leading-relaxed mb-3">
                Dependendo da sua localização, você pode ter os seguintes direitos relacionados às suas informações pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Acessar e receber uma cópia de suas informações pessoais</li>
                <li>Retificar informações imprecisas</li>
                <li>Solicitar a exclusão de suas informações pessoais</li>
                <li>Restringir ou opor-se ao processamento de suas informações</li>
                <li>Transferir suas informações para outro serviço (portabilidade de dados)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Para exercer esses direitos, entre em contato conosco através de privacidade@taskflow.com.br.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">8. Cookies e Tecnologias Semelhantes</h4>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos cookies e tecnologias semelhantes para coletar informações sobre como você interage com nosso Serviço. Você pode configurar seu navegador para recusar todos ou alguns cookies, mas isso pode afetar a funcionalidade do Serviço.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">9. Alterações nesta Política</h4>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações significativas publicando a nova Política de Privacidade em nosso site e, quando apropriado, enviando um e-mail.
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">10. Contato</h4>
              <p className="text-gray-700 leading-relaxed">
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em privacidade@taskflow.com.br.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-xl transition-all duration-200"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
}
