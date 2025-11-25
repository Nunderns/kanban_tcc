export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export interface WorkItemLink {
  id: string;
  url: string;
  displayName: string;
  createdAt: string;
}

export type WorkItem = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  assignees?: string[];
  assignedUserId?: string;
  assignedUserName?: string;
  module?: string;
  cycle?: string;
  labels?: string[];
  creator?: string;
  links?: WorkItemLink[];
};