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

export default function FilterDropdown() {
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
            <input type="checkbox" className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" />
            {p}
          </label>
        ))}
      </Section>

      <Section title="Status">
        {["Backlog", "Nâo iniciado", "Iniciado", "Completado", "Cancelado"].map((s) => (
          <label className="flex items-center gap-2" key={s}>
            <input type="checkbox" className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" />
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
        {["Daqui a 1 semana", "Daqui a 2 semandas", "Daqui um mês", "Daqui 2 mêses", "Customizar"].map((d) => (
          <label className="flex items-center gap-2" key={d}>
            <input type="checkbox" className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" />
            {d}
          </label>
        ))}
      </Section>

      <Section title="Data de entrega">
        {["Daqui a 1 semana", "Daqui a 2 semandas", "Daqui um mês", "Daqui 2 mêses", "Customizar"].map((d) => (
          <label className="flex items-center gap-2" key={d}>
            <input type="checkbox" className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" />
            {d}
          </label>
        ))}
      </Section>
    </div>
  );
}
