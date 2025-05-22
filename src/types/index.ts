export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Board {
  columns: Record<string, Column>;
  tasks: Record<string, Task>;
  columnOrder: string[];
}

export interface UserPresence {
  userId: string;
  online: boolean;
  lastActive: string;
}
