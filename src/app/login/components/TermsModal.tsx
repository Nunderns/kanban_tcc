"use client";

import { FaTimes } from "react-icons/fa";

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function TermsModal({ visible, onClose }: Props) {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-xl">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                    <FaTimes className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Termos de Serviço – TaskFlow
                </h2>

                {/* --- CONTEÚDO --- */}
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">

                    <p>
                        <strong>Última atualização:</strong> 29/11/2025
                    </p>

                    <p>
                        Bem-vindo ao TaskFlow. Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma,
                        você concorda integralmente com estes Termos de Serviço.
                    </p>

                    <h3 className="text-lg font-semibold">1. Sobre o TaskFlow</h3>
                    <p>
                        O TaskFlow é uma plataforma de gerenciamento de tarefas, colaboração e produtividade.
                    </p>

                    <h3 className="text-lg font-semibold">2. Elegibilidade</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Ter pelo menos 18 anos</li>
                        <li>Fornecer informações verdadeiras ao cadastrar-se</li>
                    </ul>

                    <h3 className="text-lg font-semibold">3. Segurança da Conta</h3>
                    <p>
                        Você é responsável por manter suas credenciais seguras e por notificar qualquer uso indevido.
                    </p>

                    <h3 className="text-lg font-semibold">4. Uso Permitido</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>É proibido uso ilegal ou abusivo</li>
                        <li>Não tente comprometer a segurança da plataforma</li>
                        <li>Não envie automações maliciosas ou spam</li>
                    </ul>

                    <h3 className="text-lg font-semibold">5. Conteúdo do Usuário</h3>
                    <p>
                        Você mantém todos os direitos sobre qualquer conteúdo criado na plataforma.
                    </p>

                    <h3 className="text-lg font-semibold">6. Planos e Pagamentos</h3>
                    <p>
                        Assinaturas podem ser renovadas automaticamente. Valores pagos não são reembolsáveis,
                        exceto quando exigido por lei.
                    </p>

                    <h3 className="text-lg font-semibold">7. Cancelamento</h3>
                    <p>
                        Você pode excluir sua conta a qualquer momento.
                    </p>

                    <h3 className="text-lg font-semibold">8. Limitação de Responsabilidade</h3>
                    <p>
                        O TaskFlow não se responsabiliza por perdas de dados causadas por fatores externos.
                    </p>
                </div>

                {/* --- FOOTER --- */}
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
