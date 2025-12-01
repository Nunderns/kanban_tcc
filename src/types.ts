export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export type RelationType = "RELATED_TO" | "DUPLICATED_BY" | "BLOCKED_BY" | "BLOCKING";

export interface WorkItemRelation {
  id: string;
  type: RelationType;
  relatedTaskId: string;
  relatedTaskTitle: string;
  createdAt: string;
}

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
  relations?: WorkItemRelation[];
  subtasks?: string[];
  parentTaskId?: string;
};