import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Board, Task, TaskPriority } from '../types';
import {
  getBoardData,
  addColumn as dbAddColumn,
  updateColumnTitle as dbUpdateColumnTitle,
  removeColumn as dbRemoveColumn,
  addNewTask as dbAddNewTask,
  updateTaskDetails as dbUpdateTaskDetails,
  removeTask as dbRemoveTask,
  reorderTasks,
  reorderColumns,
  moveTask,
} from '../firebase/db';

// Define a type for the task data when creating a new task
interface NewTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
}

interface BoardContextProps {
  board: Board | null;
  loading: boolean;
  error: string | null;
  addNewColumn: (title: string) => Promise<string>;
  updateColumnTitle: (columnId: string, title: string) => Promise<void>;
  removeColumn: (columnId: string) => Promise<void>;
  addNewTask: (columnId: string, taskData: NewTaskData, userId?: string) => Promise<string>;
  updateTaskDetails: (taskId: string, updates: Partial<Task>, userId?: string) => Promise<void>;
  removeTask: (taskId: string, columnId: string) => Promise<void>;
  handleDragEnd: (result: any) => Promise<void>;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoardData = () => {
      try {
        getBoardData((data) => {
          if (data) {
            setBoard(data);
          } else {
            // Initialize with empty board if no data exists
            const initialBoard: Board = {
              columns: {},
              tasks: {},
              columnOrder: []
            };
            setBoard(initialBoard);
          }
          setLoading(false);
        });
      } catch (err) {
        setError('Failed to load board data');
        setLoading(false);
        console.error('Error fetching board data:', err);
      }
    };

    fetchBoardData();
  }, []);

  const addNewColumn = async (title: string) => {
    try {
      const columnId = await dbAddColumn(title);
      return columnId;
    } catch (error) {
      setError('Failed to add column');
      console.error('Error adding column:', error);
      throw error;
    }
  };

  const updateColumnTitle = async (columnId: string, title: string) => {
    try {
      await dbUpdateColumnTitle(columnId, title);
    } catch (err) {
      setError('Failed to update column');
      console.error('Error updating column title:', err);
      throw err;
    }
  };

  const removeColumn = async (columnId: string) => {
    try {
      await dbRemoveColumn(columnId);
    } catch (err) {
      setError('Failed to delete column');
      console.error('Error deleting column:', err);
      throw err;
    }
  };

  const addNewTask = async (columnId: string, taskData: { title: string; description?: string; dueDate?: string; priority?: TaskPriority; }, userId?: string) => {
    try {
      const taskId = await dbAddNewTask(columnId, taskData, userId);
      return taskId;
    } catch (error) {
      console.error('Error adding new task:', error);
      throw error;
    }
  };

  const updateTaskDetails = async (taskId: string, updates: Partial<Task>, userId?: string) => {
    try {
      await dbUpdateTaskDetails(taskId, updates, userId);
    } catch (error) {
      console.error('Error updating task details:', error);
      throw error;
    }
  };

  const removeTask = async (taskId: string, columnId: string) => {
    try {
      await dbRemoveTask(taskId, columnId);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;

    // If no destination or dropped in the same place, do nothing
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    // Handle column reordering
    if (type === 'column') {
      if (!board) return;
      
      // Ensure columnOrder is an array before using Array.from
      const columnOrder = Array.isArray(board.columnOrder) ? board.columnOrder : [];
      const newColumnOrder = [...columnOrder];
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      try {
        await reorderColumns(newColumnOrder);
      } catch (err) {
        setError('Failed to reorder columns');
        console.error('Error reordering columns:', err);
      }
      return;
    }

    // Handle task reordering
    if (!board) return;
    
    const sourceColumn = board.columns[source.droppableId];
    const destinationColumn = board.columns[destination.droppableId];

    if (!sourceColumn || !destinationColumn) {
      console.error('Source or destination column not found', {
        sourceId: source.droppableId,
        destinationId: destination.droppableId
      });
      return;
    }

    // Reordering within the same column
    if (sourceColumn.id === destinationColumn.id) {
      // Ensure taskIds is an array before using it
      const taskIds = Array.isArray(sourceColumn.taskIds) ? sourceColumn.taskIds : [];
      const newTaskIds = [...taskIds];
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      try {
        await reorderTasks(sourceColumn.id, newTaskIds);
      } catch (err) {
        setError('Failed to reorder tasks');
        console.error('Error reordering tasks:', err);
      }
      return;
    }

    // Moving task from one column to another
    // Ensure taskIds are arrays before using them
    const sourceTaskIds = Array.isArray(sourceColumn.taskIds) ? [...sourceColumn.taskIds] : [];
    sourceTaskIds.splice(source.index, 1);
    
    const destinationTaskIds = Array.isArray(destinationColumn.taskIds) ? [...destinationColumn.taskIds] : [];
    destinationTaskIds.splice(destination.index, 0, draggableId);

    console.log('Moving task between columns:', {
      task: draggableId,
      from: { column: sourceColumn.id, taskIds: sourceTaskIds },
      to: { column: destinationColumn.id, taskIds: destinationTaskIds }
    });

    try {
      await moveTask(
        sourceColumn.id,
        destinationColumn.id,
        draggableId,
        sourceTaskIds,
        destinationTaskIds
      );
    } catch (err) {
      setError('Failed to move task between columns');
      console.error('Error moving task:', err);
    }
  };

  const value = {
    board,
    loading,
    error,
    addNewColumn,
    updateColumnTitle,
    removeColumn,
    addNewTask,
    updateTaskDetails,
    removeTask,
    handleDragEnd
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};
