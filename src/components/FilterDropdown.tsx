"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-700 py-2">
      <button
        className="w-full flex justify-between items-center text-sm font-medium text-white mb-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </button>
      {isOpen && <div className="pl-1 text-sm text-white space-y-1">{children}</div>}
    </div>
  );
}

interface FilterDropdownProps {
  filters: {
    priority: string[];
    status: string[];
    assignee: string[];
    creator: string[];
    project: string[];
    startDate: string[];
    dueDate: string[];
  };
  onFilterChange: (filterType: keyof FilterDropdownProps['filters'], value: string, checked: boolean) => void;
}

export default function FilterDropdown({ filters, onFilterChange }: FilterDropdownProps) {
  // Verifica se há algum filtro ativo
  const hasActiveFilters = Object.values(filters).some(filter => filter.length > 0);
  
  // Limpa todos os filtros
  const clearAllFilters = () => {
    Object.keys(filters).forEach(filterType => {
      // Para cada filtro, desmarca todas as opções
      filters[filterType as keyof typeof filters].forEach(value => {
        onFilterChange(filterType as keyof FilterDropdownProps['filters'], value, false);
      });
    });
  };
  return (
    <div className="w-72 max-h-[400px] overflow-y-auto bg-[#1f1f1f] text-white border border-gray-700 rounded-md shadow-lg p-4 text-sm z-50">
      <input
        type="text"
        placeholder="Procurar"
        className="w-full mb-3 px-2 py-1 rounded bg-[#2a2a2a] border border-gray-600 text-white placeholder-gray-400 text-sm"
      />

      <Section title="Prioridade">
        {["Urgent", "High", "Medium", "Low", "None"].map((p) => (
          <label className="flex items-center gap-2" key={p}>
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600"
              checked={filters.priority.includes(p)}
              onChange={(e) => onFilterChange('priority', p, e.target.checked)}
            />
            {p}
          </label>
        ))}
      </Section>

      <Section title="Status">
        {["Backlog", "Não iniciado", "Iniciado", "Completado", "Cancelado"].map((s) => (
          <label className="flex items-center gap-2" key={s}>
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600"
              checked={filters.status.includes(s)}
              onChange={(e) => onFilterChange('status', s, e.target.checked)}
            />
            {s}
          </label>
        ))}
      </Section>

      <Section title="Responsável">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" />
          <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">H</span>
          Você
        </label>
      </Section>

      <Section title="Criado por">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" />
          <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">H</span>
          Você
        </label>
      </Section>

      <Section title="Etiqueta">
        <span className="text-gray-400 italic">Não encontrado</span>
      </Section>

      <Section title="Projeto">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" />
          <span className="text-yellow-500">👌</span> Primeiro Projeto
        </label>
      </Section>

      <Section title="Data de início">
        {["Hoje", "Amanhã", "Esta semana", "Próxima semana", "Próximo mês"].map((option) => (
          <label className="flex items-center gap-2" key={`start-${option}`}>
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600"
              checked={filters.startDate.includes(option)}
              onChange={(e) => onFilterChange('startDate', option, e.target.checked)}
            />
            {option}
          </label>
        ))}
        <div className="mt-2">
          <input 
            type="date" 
            className="w-full px-2 py-1 rounded bg-[#2a2a2a] border border-gray-600 text-white text-sm"
            onChange={(e) => {
              const date = e.target.value;
              if (date) {
                // Converte a data do formato yyyy-MM-dd para dd/MM/yyyy
                const [year, month, day] = date.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                onFilterChange('startDate', `data:${formattedDate}`, true);
              }
            }}
          />
        </div>
      </Section>

      <Section title="Data de entrega">
        {["Hoje", "Amanhã", "Esta semana", "Próxima semana", "Próximo mês"].map((option) => (
          <label className="flex items-center gap-2" key={`due-${option}`}>
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600"
              checked={filters.dueDate.includes(option)}
              onChange={(e) => onFilterChange('dueDate', option, e.target.checked)}
            />
            {option}
          </label>
        ))}
        <div className="mt-2">
          <input 
            type="date" 
            className="w-full px-2 py-1 rounded bg-[#2a2a2a] border border-gray-600 text-white text-sm"
            onChange={(e) => {
              const date = e.target.value;
              if (date) {
                // Converte a data do formato yyyy-MM-dd para dd/MM/yyyy
                const [year, month, day] = date.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                onFilterChange('dueDate', `data:${formattedDate}`, true);
              }
            }}
          />
        </div>
      </Section>
      
      {/* Botão Limpar Filtros */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <button
            onClick={clearAllFilters}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
