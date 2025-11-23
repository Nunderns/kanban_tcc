'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

interface AddProjectModalProps {
  workspaceSlug: string;
  onProjectCreated?: () => void;
}

export function AddProjectModal({ workspaceSlug, onProjectCreated }: AddProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectCreated = () => {
    setIsOpen(false);
    if (onProjectCreated) {
      onProjectCreated();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <FiPlus className="h-4 w-4" />
          <span>Criar Projeto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Projeto</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CreateProjectForm 
            workspaceSlug={workspaceSlug} 
            onSuccess={handleProjectCreated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
