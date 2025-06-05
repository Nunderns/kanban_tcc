"use client";

import { useEffect, useState, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { ptBR } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { WorkItem } from "@/app/dashboard/my-tasks/page";

interface Props {
  item: WorkItem;
  onClose: () => void;
  onUpdate: (updated: WorkItem) => void;
}

export default function WorkItemSidebar({ item, onClose, onUpdate }: Props) {
  const [localItem, setLocalItem] = useState(item);
  interface TaskActivity {
    id: number;
    taskId: number;
    user: string;
    action: string;
    field?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
    createdAt: string;
  }

  const [activities, setActivities] = useState<TaskActivity[]>([]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${item.id}/activities`);
      const data: TaskActivity[] = await res.json();
      if (Array.isArray(data)) {
        setActivities(data);
      }
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
    }
  }, [item.id]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleChange = (field: keyof WorkItem, value: string | string[] | null | undefined) => {
    const updated = { ...localItem, [field]: value };
    const oldValue = localItem[field];
    setLocalItem(updated);

    fetch(`/api/work-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    });

    fetch(`/api/tasks/${item.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: "henri.okayama",
        action: "atualizou o campo",
        field,
        oldValue: Array.isArray(oldValue) ? oldValue.join(", ") : oldValue,
        newValue: Array.isArray(value) ? value.join(", ") : value
      })
    }).then(() => fetchActivities());
  };

  const handleUpdateClick = () => {
    onUpdate(localItem);
    onClose();
  };

  return (
    <aside className="w-[400px] bg-white text-gray-900 border-l border-gray-300 p-6 overflow-y-auto h-screen fixed right-0 top-0 z-40 shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">PRIME-{item.id}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black">
          <FaTimes />
        </button>
      </div>

      <input
        value={localItem.title}
        onChange={(e) => handleChange("title", e.target.value)}
        className="bg-gray-100 w-full mb-4 p-2 rounded border border-gray-300"
        placeholder="Título da tarefa"
      />

      <p className="text-sm text-gray-600 mb-1">Clique para adicionar uma descrição</p>

      <div className="space-y-6 pb-6">
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-black font-semibold capitalize">{localItem.status.replace("_", " ")}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Responsáveis</p>
          <input
            value={localItem.assignees?.join(", ") || ""}
            onChange={(e) => handleChange("assignees", e.target.value.split(", "))}
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
            placeholder="Adicionar responsáveis"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">Prioridade</p>
          <select
            value={localItem.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
          >
            <option value="NONE">Nenhuma</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </select>
        </div>

        <div>
          <p className="text-sm text-gray-600">Criado por</p>
          <p className="font-medium">{item.creator || "henri.okayama"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Data de Início</p>
          <DatePicker
            selected={localItem.startDate ? new Date(localItem.startDate) : null}
            onChange={(date) =>
              handleChange("startDate", date?.toISOString().split("T")[0])
            }
            locale={ptBR}
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/AAAA"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">Data de Entrega</p>
          <DatePicker
            selected={localItem.dueDate ? new Date(localItem.dueDate) : null}
            onChange={(date) =>
              handleChange("dueDate", date?.toISOString().split("T")[0])
            }
            locale={ptBR}
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/AAAA"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">Módulo</p>
          <input
            value={localItem.module || ""}
            onChange={(e) => handleChange("module", e.target.value)}
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
            placeholder="Sem módulo"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">Ciclo</p>
          <input
            value={localItem.cycle || ""}
            onChange={(e) => handleChange("cycle", e.target.value)}
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
            placeholder="Sem ciclo"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">Item pai</p>
          <input
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
            placeholder="Adicionar item pai"
            disabled
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">Etiquetas</p>
          <input
            value={localItem.labels?.join(", ") || ""}
            onChange={(e) => handleChange("labels", e.target.value.split(", "))}
            className="bg-gray-100 w-full p-2 rounded border border-gray-300"
            placeholder="Adicionar etiquetas"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600">Atividades</p>
          <ul className="text-xs text-gray-600 space-y-1 mt-2">
            {activities.length === 0 ? (
              <li>Nenhuma atividade registrada.</li>
            ) : (
              activities.map((activity) => (
                <li key={activity.id}>
                  {`${activity.user} ${activity.action}${activity.field ? ` ${activity.field}` : ""}`}
                  {activity.oldValue || activity.newValue ? (
                    <> {activity.oldValue ? ` de ${activity.oldValue}` : ""}{activity.newValue ? ` para ${activity.newValue}` : ""}</>
                  ) : null}
                  {` em ${new Date(activity.createdAt).toLocaleDateString("pt-BR")}`}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="pt-4">
          <button
            onClick={handleUpdateClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold"
          >
            Atualizar Tarefa
          </button>
        </div>
      </div>
    </aside>
  );
}
