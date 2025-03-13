"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export const Sidebar = () => {
  const [workspace, setWorkspace] = useState("Nome do espaço de trabalho");
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectImage, setProjectImage] = useState(null);

  const fetchProjects = async () => {
    const response = await fetch("/api/projects");
    const data = await response.json();
    setProjects(data);
  };

  useState(() => {
    fetchProjects();
  }, []);

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
      setProjectImage(null);
    } else {
      setEditingProject(null);
      setProjectName("");
      setProjectImage(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setProjectName("");
    setProjectImage(null);
  };

  const handleFileChange = (e) => {
    setProjectImage(e.target.files[0]);
  };

  const saveProject = async () => {
    const formData = new FormData();
    formData.append("name", projectName);
    if (projectImage) formData.append("image", projectImage);

    if (editingProject) {
      await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        body: formData,
      });
    } else {
      await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });
    }
    fetchProjects();
    closeModal();
  };

  const deleteProject = async () => {
    await fetch(`/api/projects/${editingProject.id}`, {
      method: "DELETE",
    });
    fetchProjects();
    closeModal();
  };

  return (
    <aside className="h-screen w-64 bg-neutral-100 p-4 flex flex-col">
      <Link href="/dashboard" className="text-lg font-semibold">
        TaskPulse
      </Link>

      <div className="mt-4 flex items-center justify-between bg-gray-200 p-2 rounded-lg">
        <span className="text-sm font-medium">{workspace}</span>
        <button className="text-gray-600 hover:text-gray-900">
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-4">
        <Navigation />
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Projetos</span>
          <button className="text-gray-600 hover:text-gray-900" onClick={() => openModal()}>
            <Plus size={16} />
          </button>
        </div>
        <ul className="mt-2">
          {projects.map((project) => (
            <li key={project.id} className="flex items-center bg-gray-200 p-2 rounded-md mt-1 justify-between">
              <Link href={`/projects/${project.id}`} className="text-xs font-medium w-full">
                {project.name}
              </Link>
              <button onClick={() => openModal(project)} className="text-gray-600 hover:text-gray-900 text-xs">✏️</button>
            </li>
          ))}
        </ul>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-md w-80">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-medium">{editingProject ? "Editar Projeto" : "Novo Projeto"}</h2>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Nome do Projeto</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md text-sm"
                placeholder="Digite o nome"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Imagem do Projeto</label>
              <input type="file" className="w-full mt-1 p-2 border rounded-md text-sm" onChange={handleFileChange} />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              {editingProject && (
                <button onClick={deleteProject} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">
                  Deletar
                </button>
              )}
              <button onClick={closeModal} className="bg-gray-300 px-3 py-1 rounded-md text-sm">Cancelar</button>
              <button onClick={saveProject} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
