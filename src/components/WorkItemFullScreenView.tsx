"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkItemSidebar from "@/components/WorkItemSidebar";
import type { WorkItem } from "@/app/[workspaceSlug]/dashboard/my-tasks/page";

interface WorkItemFullScreenViewProps {
  workspaceSlug: string;
  initialItem: WorkItem;
}

export default function WorkItemFullScreenView({ workspaceSlug, initialItem }: WorkItemFullScreenViewProps) {
  const router = useRouter();
  const [currentItem, setCurrentItem] = useState(initialItem);

  const numericId = String(currentItem.id).replace(/^PRIME-/i, "");
  const sidebarHref = `/${workspaceSlug}/dashboard/my-tasks?task=${numericId}`;

  return (
    <WorkItemSidebar
      item={currentItem}
      workspaceSlug={workspaceSlug}
      variant="fullscreen"
      sidebarHref={sidebarHref}
      onClose={() => router.push(sidebarHref)}
      onUpdate={(updated) => {
        setCurrentItem(updated);
        router.refresh();
      }}
    />
  );
}
