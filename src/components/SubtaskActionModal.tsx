"use client";

import { XMarkIcon, PlusIcon, SquaresPlusIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onAddExisting: () => void;
}

export default function SubtaskActionModal({ isOpen, onClose, onCreateNew, onAddExisting }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d0f14]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adicionar sub-item de trabalho</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600 dark:text-white/60 dark:hover:text-white"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onCreateNew}
            className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
          >
            <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-500/20">
              <PlusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Criar novo</p>
              <p className="text-sm text-gray-500 dark:text-white/60">Criar uma nova subtarefa</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onAddExisting}
            className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
          >
            <div className="flex-shrink-0 rounded-lg bg-purple-100 p-2 dark:bg-purple-500/20">
              <SquaresPlusIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Adicionar existente</p>
              <p className="text-sm text-gray-500 dark:text-white/60">Adicionar tarefas existentes como subtarefas</p>
            </div>
          </button>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
