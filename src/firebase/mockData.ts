import type { Board, UserPresence } from '../types';
// import { v4 as uuidv4 } from 'uuid'; // Uncomment when needed for generating IDs

// Mock initial data for development
export const mockInitialData: Board = {
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-4', 'task-5'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-6'],
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Create project structure',
      description: 'Set up the initial project structure and dependencies',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'task-2': {
      id: 'task-2',
      title: 'Design database schema',
      description: 'Create the database schema for the application',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'task-3': {
      id: 'task-3',
      title: 'Implement authentication',
      description: 'Add user authentication to the application',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'task-4': {
      id: 'task-4',
      title: 'Create UI components',
      description: 'Design and implement the UI components',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'task-5': {
      id: 'task-5',
      title: 'Implement drag and drop',
      description: 'Add drag and drop functionality to the board',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'task-6': {
      id: 'task-6',
      title: 'Set up Firebase',
      description: 'Configure Firebase for the application',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

// Mock users for development
export const mockUsers: Record<string, UserPresence> = {
  'user-1': {
    userId: 'user-1',
    online: true,
    lastActive: new Date().toISOString(),
  },
  'user-2': {
    userId: 'user-2',
    online: true,
    lastActive: new Date().toISOString(),
  },
};
