"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkItemSidebar from "@/components/WorkItemSidebar";
import type { WorkItem } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";

interface Task extends WorkItem {
  remainingDays: number | null;
}

export default function DashboardContent() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  return (
    <>
      {selectedTask && (
        <WorkItemSidebar
          item={selectedTask as unknown as WorkItem}
          onClose={() => {
            setSelectedTask(null);
            const params = new URLSearchParams(window.location.search);
            params.delete('task');
            router.replace(`/dashboard?${params.toString()}`);
          }}
          onUpdate={(updated: WorkItem) => {
            setSelectedTask(updated as unknown as Task);
          }}
        />
      )}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-white">Bem-vindo de volta! Aqui está seu resumo diário.</p>
          </div>
        </header>
      </div>
    </>
  );
}
