"use client";

import WorkItemSidebar from "@/components/WorkItemSidebar";
import { useState } from "react";
import {
  FaFilter,
  FaChartBar,
  FaPlus,
  FaUser,
  FaTag,
  FaCalendarAlt,
  FaBoxes,
  FaSyncAlt,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
  FaEllipsisV
} from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";
import { format } from "date-fns";

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
};

export default function KanbanPage() {
  const [workspaceName] = useState("Primeiro Projeto");
  const [collapsedColumns, setCollapsedColumns] = useState<Record<Status, boolean>>({
    BACKLOG: false,
    TODO: false,
    IN_PROGRESS: false,
    DONE: false
  });
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([
    {
      id: "1",
      title: "Praise 3 - More problems",
      status: "BACKLOG",
      priority: "HIGH",
      startDate: "2023-10-15",
      dueDate: "2023-11-20",
      assignees: ["user1"],
      module: "Core",
      cycle: "Sprint 1",
      labels: ["bug"]
    },
    {
      id: "2",
      title: "Praise 1 - More pressing pages",
      status: "BACKLOG",
      priority: "MEDIUM",
      startDate: "2023-10-10",
      dueDate: "2023-11-15",
      assignees: ["user2"],
      module: "UI",
      cycle: "Sprint 1",
      labels: ["enhancement"]
    },
    {
      id: "3",
      title: "Trace",
      status: "TODO",
      priority: "LOW",
      startDate: "2023-10-05",
      dueDate: "2023-10-30",
      assignees: ["user3"],
      module: "API",
      labels: ["documentation"]
    },
    {
      id: "4",
      title: "Debug",
      status: "IN_PROGRESS",
      priority: "HIGH",
      startDate: "2023-10-01",
      dueDate: "2023-10-25",
      assignees: ["user1", "user2"],
      module: "Core",
      cycle: "Sprint 2"
    },
    {
      id: "5",
      title: "New Work Item",
      status: "DONE",
      priority: "NONE",
      startDate: "2023-09-20",
      dueDate: "2023-10-10",
      assignees: ["user3"],
      module: "UI",
      cycle: "Sprint 1"
    }
  ]);

  const toggleColumnCollapse = (status: Status) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const addWorkItem = (status: Status) => {
    const newItem: WorkItem = {
      id: `new-${Date.now()}`,
      title: "New Work Item",
      status,
      priority: "NONE"
    };
    setWorkItems([...workItems, newItem]);
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "HIGH": return <FaCircle className="text-red-500 text-xs" />;
      case "MEDIUM": return <FaCircle className="text-yellow-500 text-xs" />;
      case "LOW": return <FaCircle className="text-green-500 text-xs" />;
      default: return <FaRegCircle className="text-gray-500 text-xs" />;
    }
  };

  const renderCard = (item: WorkItem) => (
    <div key={item.id} className="bg-gray-700 p-3 rounded hover:bg-gray-600" onClick={() => setSelectedItem(item)}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{item.title}</h3>
        <button className="text-gray-400 hover:text-white">
          <FaEllipsisV />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        {getPriorityIcon(item.priority)}
        <span>{item.module}</span>
        <span>{item.cycle}</span>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs">
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="text-xs" />
          <span>{item.startDate ? format(new Date(item.startDate), "MMM dd, yyyy") : "-"}</span>
        </div>
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="text-xs" />
          <span>{item.dueDate ? format(new Date(item.dueDate), "MMM dd, yyyy") : "-"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs">
        <FaUser className="text-xs" />
        <span>{item.assignees?.join(", ")}</span>
      </div>
      {item.labels?.length && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          <FaTag className="text-xs" />
          <span>{item.labels.join(", ")}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">{workspaceName} &gt; Work items</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-sm">
              <FaFilter /> Filters
            </button>
            <button className="flex items-center gap-1 bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-sm">
              <IoMdOptions /> Display
            </button>
            <button className="flex items-center gap-1 bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-sm">
              <FaChartBar /> Analytics
            </button>
            <button className="flex items-center gap-1 bg-blue-600 px-3 py-2 rounded hover:bg-blue-500 text-sm">
              <FaPlus /> Add Work Item
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 min-w-max">
            {Object.keys(collapsedColumns).map((status) => {
              const typedStatus = status as Status;
              return (
                <div key={typedStatus} className="w-72 flex-shrink-0">
                  <div className="flex justify-between items-center bg-gray-800 p-2 rounded-t cursor-pointer"
                       onClick={() => toggleColumnCollapse(typedStatus)}>
                    <div className="flex items-center gap-2">
                      {collapsedColumns[typedStatus] ? <FaChevronRight /> : <FaChevronDown />}
                      <h2 className="font-semibold">{typedStatus.replace("_", " ")}</h2>
                      <span className="text-gray-400 text-sm">{workItems.filter(i => i.status === typedStatus).length}</span>
                    </div>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        addWorkItem(typedStatus);
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {!collapsedColumns[typedStatus] && (
                    <div className="bg-gray-800 rounded-b p-2 space-y-2">
                      {workItems.filter(item => item.status === typedStatus).map(renderCard)}
                      <button
                        className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm flex items-center justify-center gap-1"
                        onClick={() => addWorkItem(typedStatus)}
                      >
                        <FaPlus /> Add Work Item
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selectedItem && (
        <WorkItemSidebar
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={(updated: WorkItem) => {
            setWorkItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
            setSelectedItem(updated);
          }}
        />
      )}
    </div>
  );
}
