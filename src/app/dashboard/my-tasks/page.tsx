"use client";

import { useState } from "react";
import { FaFilter, FaChartBar, FaPlus, FaUser, FaTag, FaCalendarAlt } from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";

const initialData = {
  backlog: [
    { id: 1, title: "Meu primeiro projeto" },
    { id: 2, title: "Novo problema" },
  ],
  todo: [],
  inProgress: [],
  done: [],
};

export default function KanbanPage() {
  const [tasks, setTasks] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const addWorkItem = () => {
    if (!newTitle.trim()) return;
    const newTask = { id: Date.now(), title: newTitle };
    setTasks((prev) => ({
      ...prev,
      backlog: [newTask, ...prev.backlog],
    }));
    setNewTitle("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      {/* Header */}
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

      {/* Board */}
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="grid grid-cols-4 gap-4 min-w-[1200px]">
          {Object.entries(tasks).map(([column, items]) => (
            <div key={column} className="bg-gray-800 rounded-xl p-4 min-h-[300px]">
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {column === "backlog"
                  ? "Backlog"
                  : column === "todo"
                  ? "Todo"
                  : column === "inProgress"
                  ? "In Progress"
                  : "Done"}
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-700 p-3 rounded-lg shadow hover:bg-gray-600 transition"
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

      {/* Modal */}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <button className="flex items-center justify-center bg-gray-700 p-2 rounded hover:bg-gray-600">
                <FaUser className="mr-2" /> Assignees
              </button>
              <button className="flex items-center justify-center bg-gray-700 p-2 rounded hover:bg-gray-600">
                <FaTag className="mr-2" /> Labels
              </button>
              <button className="flex items-center justify-center bg-gray-700 p-2 rounded hover:bg-gray-600">
                <FaCalendarAlt className="mr-2" /> Start Date
              </button>
              <button className="flex items-center justify-center bg-gray-700 p-2 rounded hover:bg-gray-600">
                <FaCalendarAlt className="mr-2" /> Due Date
              </button>
            </div>

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