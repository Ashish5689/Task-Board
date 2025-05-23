export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // User UID
  lastModifiedBy?: string; // User UID
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
