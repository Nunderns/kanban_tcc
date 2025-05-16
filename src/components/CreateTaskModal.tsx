"use client";

import Sidebar from "@/components/Sidebar";
import FilterDropdown from "@/components/FilterDropdown";
import DisplayDropdown from "@/components/DisplayDown";
import { format } from "date-fns";
import WorkItemSidebar from "@/components/WorkItemSidebar";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  FaFilter,
  FaChartBar,
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
  FaTimes,
  FaUser,
  FaTag,
  FaCalendarAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";

export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export type WorkItem = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  assignees?: string[];
  module?: string;
  cycle?: string;
  labels?: string[];
  creator?: string;
};

function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description });
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Criar Tarefa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full bg-white border border-gray-300 rounded p-2 text-sm mb-4"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full bg-white border border-gray-300 rounded p-2 text-sm h-24 mb-4"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-between items-center mt-4 relative">
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="flex items-center gap-1 bg-[#2c2c2c] text-white px-3 py-1 rounded-md text-sm border border-gray-700 hover:bg-[#3a3a3a] transition"
                >
                  <FaFilter className="text-white" />
                  Filtros
                </button>
                {isFilterOpen && (
                  <div className="absolute mt-2 z-50">
                    <FilterDropdown />
                  </div>
                )}
              </div>
              <DisplayDropdown />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-sm border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando..." : "Criar Tarefa"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
