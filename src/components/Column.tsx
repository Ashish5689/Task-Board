import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column as ColumnType, Task, TaskPriority } from '../types';
import { useBoardContext } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import TaskList from './TaskList.tsx';
import LabelManager from './labels/LabelManager';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  index?: number;
}

const Column = ({ column, tasks }: ColumnProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string | undefined>(undefined);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority | undefined>(undefined);
  const [newTaskLabels, setNewTaskLabels] = useState<string[]>([]);
  
  const { updateColumnTitle, removeColumn, addNewTask } = useBoardContext();
  const { authState } = useAuth();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  
  const handleSaveTitle = async () => {
    if (title.trim() === '') return;
    
    await updateColumnTitle(column.id, title);
    setIsEditing(false);
  };
  
  const handleCancelTitleEdit = () => {
    setTitle(column.title);
    setIsEditing(false);
  };
  
  // Prevent space bar from triggering Add Task button
  const handleKeyDown = (e: KeyboardEvent) => {
    // If we're in task adding mode, prevent any keyboard events from propagating
    if (isAddingTask) {
      e.stopPropagation();
    }
  };

  // Add event listener for keydown when component mounts
  useEffect(() => {
    if (isAddingTask) {
      // Add the event listener when adding task
      window.addEventListener('keydown', handleKeyDown, true);
    }
    
    // Clean up the event listener when component unmounts or isAddingTask changes
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isAddingTask]);
  
  // Handle task title input change
  const handleTaskTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setNewTaskTitle(e.target.value);
  };
  
  // Handle task description input change
  const handleTaskDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    setNewTaskDescription(e.target.value);
  };
  
  // Handle title field keydown
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('task-description')?.focus();
    }
  };
  
  // Handle description field keydown
  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (newTaskTitle.trim() !== '') {
        handleAddTask();
      }
    }
  };
  
  // Cancel task addition
  const handleCancelAddTask = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(undefined);
    setNewTaskPriority(undefined);
    setNewTaskLabels([]);
    setIsAddingTask(false);
  };
  
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') return;
    
    // Create the task object with the new fields
    const taskData = {
      title: newTaskTitle,
      description: newTaskDescription.trim() === '' ? undefined : newTaskDescription,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      labels: newTaskLabels.length > 0 ? newTaskLabels : undefined,
    };
    
    await addNewTask(
      column.id,
      taskData,
      authState.user?.uid // Pass the user ID
    );
    
    // Reset all fields
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(undefined);
    setNewTaskPriority(undefined);
    setNewTaskLabels([]);
    setIsAddingTask(false);
  };
  
  const handleDeleteColumn = async () => {
    if (window.confirm(`Are you sure you want to delete the "${column.title}" column and all its tasks?`)) {
      await removeColumn(column.id);
    }
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg ${isDragging 
        ? 'shadow-xl ring-2 ring-primary-200 dark:ring-primary-900 opacity-90' 
        : 'shadow-md dark:shadow-md-dark'} 
        p-4 min-w-[300px] max-w-[300px] flex flex-col h-[calc(100vh-160px)] transition-all duration-200`}
      {...attributes}
      {...listeners}
      data-dragging={isDragging ? 'true' : 'false'}
      aria-roledescription="Draggable column"
      aria-label={`Column: ${column.title}`}
    >
      <div 
        className="column-header p-2 rounded-t-lg mb-2 bg-gray-50 dark:bg-gray-700 overflow-visible"
      >
        {isEditing ? (
          <div className="flex flex-col w-full gap-2">
            <input
              type="text"
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelTitleEdit();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-2 py-1 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                onClick={handleCancelTitleEdit}
                type="button"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                className="px-2 py-1 text-sm font-medium bg-primary-600 dark:bg-primary-700 rounded-md text-white hover:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                onClick={handleSaveTitle}
                type="button"
                aria-label="Save changes"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="font-medium text-gray-800 dark:text-gray-200 cursor-grab flex items-center" 
              onDoubleClick={() => setIsEditing(true)}
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
              {column.title}
            </div>
            <div className="flex space-x-2">
              <button
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                onClick={() => setIsEditing(true)}
                aria-label="Edit column"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                onClick={handleDeleteColumn}
                aria-label="Delete column"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-2">
        <TaskList columnId={column.id} tasks={tasks} />
      </div>
      
      {isAddingTask ? (
        <div 
          className="mt-auto p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm transition-colors duration-200" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-lg border-l-4 border-primary-500 dark:border-primary-600 transition-colors duration-200 z-20 relative">
            <input
              type="text"
              className="w-full p-2 mb-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
              value={newTaskTitle}
              onChange={handleTaskTitleChange}
              placeholder="Enter task title..."
              autoFocus
              onKeyDown={handleTitleKeyDown}
            />
            <textarea
              id="task-description"
              className="w-full p-2 mb-3 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
              value={newTaskDescription}
              onChange={handleTaskDescriptionChange}
              placeholder="Add a description..."
              rows={3}
              onKeyDown={handleDescriptionKeyDown}
            />
            
            {/* Due Date Picker */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
                value={newTaskDueDate ? new Date(newTaskDueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewTaskDueDate(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              />
            </div>
            
            {/* Priority Selector */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
                value={newTaskPriority || ''}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority || undefined)}
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            {/* Label Manager */}
            <LabelManager selectedLabels={newTaskLabels} onLabelsChange={setNewTaskLabels} />
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                onClick={handleCancelAddTask}
                type="button"
                aria-label="Cancel adding task"
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                onClick={handleAddTask}
                type="button"
                aria-label="Add task"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto">
          <button
            type="button"
            className="w-full p-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md text-center flex items-center justify-center transition-colors duration-200 group"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAddingTask(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
        </div>
      )}
    </div>
  );
};

export default Column;
