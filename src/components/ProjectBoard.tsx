"use client";

import { useMemo } from "react";

export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: Status;
  priority?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  createdAt?: string;
  updatedAt?: string;
};

const STATUS_COLUMNS: { key: Status; label: string }[] = [
  { key: "BACKLOG", label: "Backlog" },
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "Em progresso" },
  { key: "DONE", label: "Concluído" },
];

export default function ProjectBoard({ tasks }: { tasks: Task[] }) {
  const columns = useMemo(() => {
    const map: Record<Status, Task[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    for (const t of tasks) map[t.status]?.push(t);
    return map;
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STATUS_COLUMNS.map((col) => (
        <div key={col.key} className="rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium">
            {col.label}
          </div>
          <div className="p-3 space-y-2 min-h-[160px]">
            {columns[col.key].length === 0 ? (
              <div className="text-xs text-gray-500">Sem itens</div>
            ) : (
              columns[col.key].map((t) => (
                <div key={t.id} className="rounded border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
                  <div className="text-sm font-medium">{t.title}</div>
                  {t.description ? (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
