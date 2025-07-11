"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
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
          <h2 className="text-2xl font-bold text-gray-900">Termos de Serviço</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="prose max-w-none space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Termos de Serviço da TaskFlow</h3>
            <p className="text-gray-600 mb-8"><strong>Última atualização: 11 de julho de 2025</strong></p>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">1. Aceitação dos Termos</h4>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar ou utilizar a plataforma TaskFlow ("Serviço"), você concorda em cumprir e ficar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá acessar ou utilizar nosso Serviço.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">2. Descrição do Serviço</h4>
              <p className="text-gray-700 leading-relaxed">
                A TaskFlow é uma plataforma de gerenciamento de projetos e tarefas que permite aos usuários organizar, acompanhar e colaborar em projetos. Nosso serviço inclui recursos de quadros Kanban, gerenciamento de tarefas, colaboração em equipe e ferramentas de produtividade.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">3. Contas de Usuário</h4>
              <p className="text-gray-700 leading-relaxed">
                Para utilizar certos recursos do Serviço, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de conta e por todas as atividades que ocorrem sob sua conta. Você concorda em notificar a TaskFlow imediatamente sobre qualquer uso não autorizado de sua conta.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">4. Uso Aceitável</h4>
              <p className="text-gray-700 leading-relaxed mb-3">
                Ao utilizar nosso Serviço, você concorda em não:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violar leis ou regulamentos aplicáveis</li>
                <li>Infringir direitos de propriedade intelectual</li>
                <li>Transmitir malware ou outros códigos maliciosos</li>
                <li>Interferir ou interromper a integridade ou desempenho do Serviço</li>
                <li>Coletar informações de usuários sem consentimento</li>
                <li>Utilizar o serviço para fins ilegais ou não autorizados</li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">5. Conteúdo do Usuário</h4>
              <p className="text-gray-700 leading-relaxed">
                Nosso Serviço permite que você publique, armazene e compartilhe conteúdo. Você mantém todos os direitos sobre seu conteúdo, mas concede à TaskFlow uma licença mundial, não exclusiva e isenta de royalties para usar, reproduzir e exibir seu conteúdo em conexão com o Serviço.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">6. Propriedade Intelectual</h4>
              <p className="text-gray-700 leading-relaxed">
                O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva da TaskFlow. O Serviço é protegido por direitos autorais, marcas registradas e outras leis de propriedade intelectual do Brasil e de outros países.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">7. Rescisão</h4>
              <p className="text-gray-700 leading-relaxed">
                A TaskFlow pode encerrar ou suspender sua conta e acesso ao Serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos de Serviço.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">8. Limitação de Responsabilidade</h4>
              <p className="text-gray-700 leading-relaxed">
                Em nenhuma circunstância a TaskFlow, nem seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de seu acesso ou uso ou incapacidade de acessar ou usar o Serviço.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">9. Alterações nos Termos</h4>
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar ou substituir estes termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor.
              </p>
            </div>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">10. Lei Aplicável</h4>
              <p className="text-gray-700 leading-relaxed">
                Estes termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições de conflito de leis.
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">11. Contato</h4>
              <p className="text-gray-700 leading-relaxed">
                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em suporte@taskflow.com.br.
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
