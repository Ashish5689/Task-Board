import type { Board, Column, Task, UserPresence, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ref, set, onValue, update, remove, onDisconnect, get } from 'firebase/database';
import { db } from './config';

// Initial data structure for a new board if none exists
const initialBoardData: Board = {
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: [],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: [],
    },
  },
  tasks: {},
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

// Board operations
export const getBoardData = (callback: (board: Board | null) => void) => {
  const boardRef = ref(db, 'board');
  onValue(boardRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    } else {
      // Initialize board if it doesn't exist
      set(boardRef, initialBoardData)
        .then(() => callback(initialBoardData))
        .catch(error => {
          console.error('Error initializing board:', error);
          callback(null);
        });
    }
  }, (error) => {
    console.error('Error getting board data:', error);
    callback(null);
  });
};

// Column operations
export const addColumn = async (title: string) => {
  const columnId = uuidv4();
  
  const newColumn: Column = {
    id: columnId,
    title,
    taskIds: [],
  };
  
  try {
    // Add the new column
    const columnRef = ref(db, `board/columns/${columnId}`);
    await set(columnRef, newColumn);
    
    // Update the column order
    const snapshot = await get(ref(db, 'board/columnOrder'));
    const columnOrder = snapshot.exists() ? snapshot.val() : [];
    
    await set(ref(db, 'board/columnOrder'), [...columnOrder, columnId]);
    
    return columnId;
  } catch (error) {
    console.error('Error adding column:', error);
    throw error;
  }
};

export const updateColumnTitle = async (columnId: string, title: string) => {
  try {
    const columnRef = ref(db, `board/columns/${columnId}`);
    await update(columnRef, { title });
  } catch (error) {
    console.error('Error updating column title:', error);
    throw error;
  }
};

export const removeColumn = async (columnId: string) => {
  try {
    // Get the column to check for tasks
    const columnRef = ref(db, `board/columns/${columnId}`);
    const snapshot = await get(columnRef);
    const column = snapshot.exists() ? snapshot.val() : null;
    
    if (column) {
      // Ensure taskIds is an array before iterating
      const taskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
      
      // Remove all tasks in the column
      for (const taskId of taskIds) {
        await remove(ref(db, `board/tasks/${taskId}`));
      }
      
      // Remove the column
      await remove(columnRef);
      
      // Update column order
      const columnOrderRef = ref(db, 'board/columnOrder');
      const orderSnapshot = await get(columnOrderRef);
      const columnOrder = orderSnapshot.exists() ? 
        (Array.isArray(orderSnapshot.val()) ? orderSnapshot.val() : []) : 
        [];
      const newColumnOrder = columnOrder.filter((id: string) => id !== columnId);
      await set(columnOrderRef, newColumnOrder);
    }
  } catch (error) {
    console.error('Error removing column:', error);
    throw error;
  }
};

// User operations
export const saveUser = async (user: User) => {
  try {
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, user);
    return user.uid;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUser = async (uid: string): Promise<User | null> => {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Task operations
export const addNewTask = async (columnId: string, title: string, description?: string, userId?: string) => {
  const taskId = uuidv4();
  const now = new Date().toISOString();
  
  // Create the task object - Firebase doesn't allow undefined values
  const newTask: Task = {
    id: taskId,
    title,
    createdAt: now,
    updatedAt: now,
  };
  
  // Only add description if it has a value (not undefined or empty string)
  if (description && description.trim() !== '') {
    newTask.description = description;
  }

  // Add user information if available
  if (userId) {
    newTask.createdBy = userId;
    newTask.lastModifiedBy = userId;
  }
  
  try {
    // Add the task
    await set(ref(db, `board/tasks/${taskId}`), newTask);
    
    // Update the column's taskIds
    const columnRef = ref(db, `board/columns/${columnId}`);
    const snapshot = await get(columnRef);
    const column = snapshot.exists() ? snapshot.val() : null;
    
    if (column) {
      // Ensure taskIds is an array before spreading
      const existingTaskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
      const taskIds = [...existingTaskIds, taskId];
      await update(columnRef, { taskIds });
    }
    
    return taskId;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const updateTaskDetails = async (taskId: string, updates: Partial<Task>, userId?: string) => {
  try {
    const taskRef = ref(db, `board/tasks/${taskId}`);
    const snapshot = await get(taskRef);
    const task = snapshot.exists() ? snapshot.val() : null;
    
    if (task) {
      // Create a clean updates object without undefined values
      const cleanUpdates: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      
      // Add user who modified the task
      if (userId) {
        cleanUpdates.lastModifiedBy = userId;
      }
      
      // Add title if it exists
      if (updates.title !== undefined) {
        cleanUpdates.title = updates.title;
      }
      
      // Only add description if it has a value
      if (updates.description !== undefined) {
        if (updates.description && updates.description.trim() !== '') {
          cleanUpdates.description = updates.description;
        } else {
          // If description is empty or just whitespace, remove it from the task
          // We'll use a Firebase field removal technique
          cleanUpdates.description = null;
        }
      }
      
      await update(taskRef, cleanUpdates);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const removeTask = async (taskId: string, columnId: string) => {
  try {
    // Remove the task
    await remove(ref(db, `board/tasks/${taskId}`));
    
    // Update the column's taskIds
    const columnRef = ref(db, `board/columns/${columnId}`);
    const snapshot = await get(columnRef);
    const column = snapshot.exists() ? snapshot.val() : null;
    
    if (column) {
      // Ensure taskIds is an array before filtering
      const existingTaskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
      const taskIds = existingTaskIds.filter((id: string) => id !== taskId);
      await update(columnRef, { taskIds });
    }
  } catch (error) {
    console.error('Error removing task:', error);
    throw error;
  }
};

// Drag and drop operations
export const reorderTasks = async (columnId: string, newTaskIds: string[]) => {
  try {
    // Ensure newTaskIds is a valid array
    const safeTaskIds = Array.isArray(newTaskIds) ? newTaskIds : [];
    
    const columnRef = ref(db, `board/columns/${columnId}`);
    await update(columnRef, { taskIds: safeTaskIds });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    throw error;
  }
};

export const reorderColumns = async (newColumnOrder: string[]) => {
  try {
    // Ensure newColumnOrder is a valid array
    const safeColumnOrder = Array.isArray(newColumnOrder) ? newColumnOrder : [];
    
    const columnOrderRef = ref(db, 'board/columnOrder');
    await set(columnOrderRef, safeColumnOrder);
  } catch (error) {
    console.error('Error reordering columns:', error);
    throw error;
  }
};

export const moveTask = async (
  sourceColumnId: string,
  destinationColumnId: string,
  _taskId: string,
  sourceTaskIds: string[],
  destinationTaskIds: string[]
) => {
  try {
    // Ensure arrays are valid before updating
    const safeSourceTaskIds = Array.isArray(sourceTaskIds) ? sourceTaskIds : [];
    const safeDestinationTaskIds = Array.isArray(destinationTaskIds) ? destinationTaskIds : [];
    
    // Update source column
    await update(ref(db, `board/columns/${sourceColumnId}`), { taskIds: safeSourceTaskIds });
    
    // Update destination column
    await update(ref(db, `board/columns/${destinationColumnId}`), { taskIds: safeDestinationTaskIds });
  } catch (error) {
    console.error('Error moving task:', error);
    throw error;
  }
};

// User presence operations
export const getUserPresence = (callback: (users: UserPresence[]) => void) => {
  const presenceRef = ref(db, 'presence');
  onValue(presenceRef, (snapshot) => {
    const data = snapshot.val() || {};
    const users = Object.values(data) as UserPresence[];
    callback(users);
  }, (error) => {
    console.error('Error getting user presence:', error);
    callback([]);
  });
};

export const updateUserPresence = async (userId: string, online: boolean, displayName?: string, photoURL?: string) => {
  const presenceRef = ref(db, `presence/${userId}`);
  const userStatus: UserPresence = {
    userId,
    online,
    lastActive: new Date().toISOString(),
  };

  // Add user profile info if available
  if (displayName) userStatus.displayName = displayName;
  if (photoURL) userStatus.photoURL = photoURL;
  
  set(presenceRef, userStatus);
  
  // Set up disconnect handler
  if (online) {
    const onDisconnectRef = onDisconnect(presenceRef);
    onDisconnectRef.update({
      online: false,
      lastActive: new Date().toISOString(),
    });
  }
};

// Setup user presence and return cleanup function
export const setupPresence = (userId: string, displayName?: string, photoURL?: string) => {
  // Set user as online
  updateUserPresence(userId, true, displayName, photoURL);
  
  // Return cleanup function to set user as offline when component unmounts
  return () => {
    updateUserPresence(userId, false, displayName, photoURL);
  };
};

export const getOnlineUsers = (callback: (users: UserPresence[]) => void) => {
  // Use the real Firebase implementation
  const presenceRef = ref(db, 'presence');
  
  onValue(presenceRef, (snapshot) => {
    const data = snapshot.val() || {};
    const users = Object.values(data) as UserPresence[];
    callback(users);
  }, (error) => {
    console.error('Error getting online users:', error);
    callback([]);
  });
};
