"use client";

import { FaTimes } from "react-icons/fa";
interface Props {
    visible: boolean;
    onClose: () => void;
}
export default function PrivacyModal({ visible, onClose }: Props) {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                    <FaTimes className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Política de Privacidade – TaskFlow
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                    <p><strong>Última atualização:</strong> 29/11/2025</p>

                    <p>
                        A privacidade dos usuários é prioridade para o TaskFlow. Esta Política descreve como coletamos,
                        armazenamos e utilizamos as informações fornecidas pelos usuários.
                    </p>

                    <h3 className="text-lg font-semibold">1. Informações coletadas</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Nome, email e dados do perfil</li>
                        <li>Registros de uso, logs e preferências</li>
                        <li>Dados fornecidos voluntariamente em suporte</li>
                    </ul>

                    <h3 className="text-lg font-semibold">2. Uso das informações</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Manter e operar a plataforma</li>
                        <li>Melhorar segurança e desempenho</li>
                        <li>Oferecer suporte e atendimento</li>
                    </ul>

                    <h3 className="text-lg font-semibold">3. Compartilhamento de dados</h3>
                    <p>
                        Não vendemos dados pessoais. Só compartilhamos com provedores essenciais, como hospedagem,
                        email e sistemas de pagamento.
                    </p>

                    <h3 className="text-lg font-semibold">4. Segurança</h3>
                    <p>
                        Utilizamos criptografia, proteção contra ataques e auditoria constante.
                    </p>

                    <h3 className="text-lg font-semibold">5. Direitos do usuário</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Acessar, corrigir ou excluir dados</li>
                        <li>Solicitar portabilidade</li>
                        <li>Revogar consentimento</li>
                    </ul>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Fechar
                    </button>
                </div>

            </div>
        </div>
    );
}
