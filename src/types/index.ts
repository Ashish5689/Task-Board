export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string; // User UID
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // User UID
  lastModifiedBy?: string; // User UID
  dueDate?: string; // ISO date string
  priority?: TaskPriority;
  labels?: string[]; // Array of label IDs
  attachments?: string[]; // Array of attachment IDs
  checklist?: ChecklistItem[];
  assignedTo?: string[]; // Array of user UIDs
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
  displayName?: string;
  photoURL?: string;
}

export type AuthProvider = 'password' | 'google';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
