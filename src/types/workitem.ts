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
  subtasks?: string[];
  parentTaskId?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  creator?: string;
  links?: Array<{
    id: string;
    url: string;
    displayName: string;
    createdAt: string;
  }>;
};
