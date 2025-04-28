"use client";

import { useState } from "react";
import { FaFilter, FaChartBar, FaPlus, FaUser, FaTag, FaCalendarAlt, FaBoxes, FaSyncAlt, FaPuzzlePiece, FaClipboardList } from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";

type Task = {
  id: number;
  title: string;
  description: string;
  state: string;
  assignees: string;
  priority: string;
};

const initialData: { [key: string]: Task[] } = {
  backlog: [
    { id: 1, title: "Meu primeiro projeto", description: "Descrição do meu primeiro projeto.", state: "Backlog", assignees: "", priority: "None" },
    { id: 2, title: "Novo problema", description: "Descrição do novo problema.", state: "Backlog", assignees: "", priority: "None" },
  ],
  todo: [],
  inProgress: [],
  done: [],
};

export default function KanbanPage() {
  const [tasks, setTasks] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [filters, setFilters] = useState({ updates: true, comments: true });
  const [newComment, setNewComment] = useState("");

  const addWorkItem = () => {
    if (!newTitle.trim()) return;
    const newTask: Task = { id: Date.now(), title: newTitle, description: newDescription, state: "Backlog", assignees: "", priority: "None" };
    setTasks((prev) => ({
      ...prev,
      backlog: [newTask, ...prev.backlog],
    }));
    setNewTitle("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  const updateSelectedTask = (field: keyof Task, value: string) => {
    setSelectedTask((prev) => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Primeiro Projeto &gt; Work items</h1>
          </div>
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
            <button
              className="flex items-center gap-1 bg-blue-600 px-3 py-2 rounded hover:bg-blue-500 text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Add Work Item
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-x-auto">
          <div className="grid grid-cols-4 gap-4 min-w-[1200px]">
            {Object.entries(tasks).map(([column, items]) => (
              <div key={column} className="bg-gray-800 rounded-xl p-4 min-h-[300px]">
                <h2 className="text-xl font-semibold mb-4 capitalize">
                  {column === "backlog" ? "Backlog" : column === "todo" ? "Todo" : column === "inProgress" ? "In Progress" : "Done"}
                </h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTask(item)}
                      className="bg-gray-700 p-3 rounded-lg shadow hover:bg-gray-600 transition cursor-pointer"
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm">
                  + New Work Item
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="fixed top-0 right-0 w-[850px] h-full bg-gray-800 border-l border-gray-700 p-8 overflow-y-auto z-50">
          <button className="text-gray-400 hover:text-white mb-6" onClick={() => setSelectedTask(null)}>
            Close
          </button>
          <div className="space-y-6">
            <input
              type="text"
              className="bg-gray-700 p-3 w-full rounded text-lg font-bold"
              value={selectedTask.title}
              onChange={(e) => updateSelectedTask("title", e.target.value)}
            />

            <textarea
              className="bg-gray-700 p-3 w-full rounded"
              rows={4}
              placeholder="Add description"
              value={selectedTask.description}
              onChange={(e) => updateSelectedTask("description", e.target.value)}
            />

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaClipboardList /> State</label>
                <select className="bg-gray-700 p-2 w-full rounded mt-1" value={selectedTask.state} onChange={(e) => updateSelectedTask("state", e.target.value)}>
                  <option>Backlog</option>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaUser /> Assignees</label>
                <input className="bg-gray-700 p-2 w-full rounded mt-1" value={selectedTask.assignees} onChange={(e) => updateSelectedTask("assignees", e.target.value)} />
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaTag /> Priority</label>
                <select className="bg-gray-700 p-2 w-full rounded mt-1" value={selectedTask.priority} onChange={(e) => updateSelectedTask("priority", e.target.value)}>
                  <option>None</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaCalendarAlt /> Start Date</label>
                <input type="date" className="bg-gray-700 p-2 w-full rounded mt-1" />
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaCalendarAlt /> Due Date</label>
                <input type="date" className="bg-gray-700 p-2 w-full rounded mt-1" />
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaBoxes /> Modules</label>
                <input type="text" className="bg-gray-700 p-2 w-full rounded mt-1" placeholder="No module" />
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaSyncAlt /> Cycle</label>
                <input type="text" className="bg-gray-700 p-2 w-full rounded mt-1" placeholder="No cycle" />
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaPuzzlePiece /> Parent</label>
                <input type="text" className="bg-gray-700 p-2 w-full rounded mt-1" placeholder="Add parent work item" />
              </div>

              <div>
                <label className="text-gray-400 text-sm flex items-center gap-2"><FaTag /> Labels</label>
                <input type="text" className="bg-gray-700 p-2 w-full rounded mt-1" placeholder="Select label" />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Activity</h3>
                <button className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded">
                  Filters
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">henri.okayama created the work item. 19 days ago</p>
              </div>
              <div className="mt-4">
                <textarea
                  className="bg-gray-700 p-2 w-full rounded"
                  placeholder="Add comment"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button className="mt-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded">
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-6">Create new work item</h2>

            <div className="mb-4">
              <span className="bg-gray-700 text-xs px-3 py-1 rounded-full">Primeiro Projeto</span>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 rounded focus:outline-none"
            />

            <textarea
              placeholder="Click to add description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2 mb-6 bg-gray-700 rounded focus:outline-none"
              rows={4}
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Discard
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
                onClick={addWorkItem}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
