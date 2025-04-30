"use client";

import { useEffect, useState } from "react";
import { FaTimes, FaUser, FaTag, FaCalendarAlt, FaBoxes, FaSyncAlt, FaPuzzlePiece } from "react-icons/fa";
import { format } from "date-fns";
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

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  const handleChange = (field: keyof WorkItem, value: any) => {
    const updated = { ...localItem, [field]: value };
    setLocalItem(updated);
    onUpdate(updated);
    // Simulação de persistência (substitua por API real):
    fetch(`/api/work-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    });
  };

  return (
    <div className="w-[400px] border-l border-gray-700 bg-gray-800 p-6 overflow-y-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">PRIME-{item.id}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FaTimes />
        </button>
      </div>

      <input
        value={localItem.title}
        onChange={(e) => handleChange("title", e.target.value)}
        className="bg-gray-700 w-full mb-4 p-2 rounded"
        placeholder="Task title"
      />

      <p className="text-sm text-gray-400 mb-1">Click to add description</p>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400">Status</p>
          <p className="text-white capitalize">{localItem.status.replace("_", " ")}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Assignees</p>
          <input
            value={localItem.assignees?.join(", ") || ""}
            onChange={(e) => handleChange("assignees", e.target.value.split(", "))}
            className="bg-gray-700 w-full p-2 rounded"
            placeholder="Add assignees"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400">Priority</p>
          <select
            value={localItem.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="bg-gray-700 w-full p-2 rounded"
          >
            <option value="NONE">None</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <p className="text-sm text-gray-400">Created by</p>
          <p className="text-white">henri.okayama</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Start date</p>
          <DatePicker
            selected={localItem.startDate ? new Date(localItem.startDate) : null}
            onChange={(date) => handleChange("startDate", date?.toISOString().split("T")[0])}
            className="bg-gray-700 w-full p-2 rounded text-white"
            dateFormat="MMM dd, yyyy"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400">Due date</p>
          <DatePicker
            selected={localItem.dueDate ? new Date(localItem.dueDate) : null}
            onChange={(date) => handleChange("dueDate", date?.toISOString().split("T")[0])}
            className="bg-gray-700 w-full p-2 rounded text-white"
            dateFormat="MMM dd, yyyy"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400">Modules</p>
          <input
            value={localItem.module || ""}
            onChange={(e) => handleChange("module", e.target.value)}
            className="bg-gray-700 w-full p-2 rounded"
            placeholder="No module"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400">Cycle</p>
          <input
            value={localItem.cycle || ""}
            onChange={(e) => handleChange("cycle", e.target.value)}
            className="bg-gray-700 w-full p-2 rounded"
            placeholder="No cycle"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400">Parent</p>
          <input
            className="bg-gray-700 w-full p-2 rounded"
            placeholder="Add parent work item"
            disabled
          />
        </div>

        <div>
          <p className="text-sm text-gray-400">Labels</p>
          <input
            value={localItem.labels?.join(", ") || ""}
            onChange={(e) => handleChange("labels", e.target.value.split(", "))}
            className="bg-gray-700 w-full p-2 rounded"
            placeholder="Select labels"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400">Activity</p>
          <ul className="text-xs text-gray-400 space-y-1 mt-2">
            <li>henri.okayama created the work item. 20 days ago</li>
            <li>henri.okayama set the due date to {format(new Date(localItem.dueDate || Date.now()), "MMM dd, yyyy")}</li>
            <li>henri.okayama set the start date to {format(new Date(localItem.startDate || Date.now()), "MMM dd, yyyy")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
