import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
// import { v4 as uuidv4 } from 'uuid';
import type { Board, Task } from '../types';
import { 
  getBoardData, 
  addColumn as dbAddColumn, 
  updateColumnTitle as dbUpdateColumnTitle, 
  removeColumn as dbRemoveColumn, 
  addNewTask as dbAddNewTask, 
  updateTaskDetails as dbUpdateTaskDetails, 
  removeTask as dbRemoveTask, 
  reorderTasks, 
  moveTask,
  reorderColumns
} from '../firebase/db';

interface BoardContextProps {
  board: Board | null;
  loading: boolean;
  error: string | null;
  addNewColumn: (title: string) => Promise<string>;
  updateColumnTitle: (columnId: string, title: string) => Promise<void>;
  removeColumn: (columnId: string) => Promise<void>;
  addNewTask: (columnId: string, title: string, description?: string) => Promise<string>;
  updateTaskDetails: (taskId: string, updates: Partial<Task>) => Promise<void>;
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
      return await dbAddColumn(title);
    } catch (err) {
      setError('Failed to add column');
      console.error('Error adding column:', err);
      throw err;
    }
  };

  const updateColumnTitle = async (columnId: string, title: string) => {
    try {
      // Call the imported function from db.ts with its renamed import
      await dbUpdateColumnTitle(columnId, title);
    } catch (err) {
      setError('Failed to update column');
      console.error('Error updating column:', err);
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

  const addNewTask = async (columnId: string, title: string, description?: string) => {
    try {
      return await dbAddNewTask(columnId, title, description);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTaskDetails = async (taskId: string, updates: Partial<Task>) => {
    try {
      await dbUpdateTaskDetails(taskId, updates);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
      throw err;
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
      
      const newColumnOrder = Array.from(board.columnOrder);
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

    // Reordering within the same column
    if (sourceColumn.id === destinationColumn.id) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
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
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    
    const destinationTaskIds = Array.from(destinationColumn.taskIds);
    destinationTaskIds.splice(destination.index, 0, draggableId);

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
