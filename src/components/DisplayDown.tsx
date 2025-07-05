"use client";
import { useState, useRef, useEffect } from "react";
import { IoMdOptions } from "react-icons/io";

interface DisplayDropdownProps {
  visibleProperties: string[];
  showSubtasks: boolean;
  onDisplayOptionChange: (option: string, checked: boolean) => void;
  onToggleSubtasks: (checked: boolean) => void;
}

function DisplayDropdown({ 
  visibleProperties, 
  showSubtasks, 
  onDisplayOptionChange, 
  onToggleSubtasks 
}: DisplayDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const displayOptions = [
    "ID",
    "Responsável",
    "Data de início",
    "Prazo",
    "Etiquetas",
    "Prioridade",
    "Estado",
    "Subtarefas",
    "Anexos",
    "Link",
    "Estimativa",
    "Módulo",
    "Ciclo",
  ];



  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-[#2c2c2c] text-white px-3 py-2 rounded-md text-sm border border-gray-700 hover:bg-[#3a3a3a] transition"
      >
        <IoMdOptions />
        Exibição
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-72 bg-[#1f1f1f] text-white border border-gray-700 rounded-md shadow-lg p-4 z-50">
          <div className="text-sm font-semibold text-gray-400 mb-2">Propriedades visíveis</div>

          <div className="flex flex-wrap gap-2">
            {displayOptions.map((option) => (
              <button
                key={option}
                onClick={() => onDisplayOptionChange(option, !visibleProperties.includes(option))}
                className={`px-2 py-1 rounded-md text-sm font-medium transition ${
                  visibleProperties.includes(option)
                    ? "bg-blue-600 text-white"
                    : "bg-[#2a2a2a] text-white hover:bg-[#333]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700">
            <label className="flex items-center gap-2 text-sm text-white">
              <input 
              type="checkbox" 
              className="form-checkbox text-blue-600 bg-[#2a2a2a] border-gray-600" 
              checked={showSubtasks}
              onChange={(e) => onToggleSubtasks(e.target.checked)}
            />
            Mostrar subtarefas
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayDropdown;
