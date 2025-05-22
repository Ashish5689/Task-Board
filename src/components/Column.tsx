import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column as ColumnType, Task } from '../types';
import { useBoardContext } from '../context/BoardContext';
import TaskList from './TaskList.tsx';

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
  
  const { updateColumnTitle, removeColumn, addNewTask } = useBoardContext();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
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
    setIsAddingTask(false);
  };
  
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') return;
    
    await addNewTask(
      column.id,
      newTaskTitle,
      newTaskDescription.trim() === '' ? undefined : newTaskDescription
    );
    
    setNewTaskTitle('');
    setNewTaskDescription('');
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
      className="column"
    >
      <div className="column-header" {...attributes} {...listeners}>
        {isEditing ? (
          <div className="flex items-center w-full">
            <input
              type="text"
              className="flex-1 p-1 border rounded mr-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelTitleEdit();
              }}
            />
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleCancelTitleEdit}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="cursor-grab" onDoubleClick={() => setIsEditing(true)}>
              {column.title}
            </div>
            <div className="flex space-x-2">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={handleDeleteColumn}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
      
      <TaskList id={column.id} tasks={tasks} />
      
      {isAddingTask ? (
        <div className="mt-2 p-2 bg-gray-100 rounded" onClick={(e) => e.stopPropagation()}>
          {/* Use a div instead of a form to prevent implicit submissions */}
          <div>
            <input
              type="text"
              className="w-full p-1 mb-2 border rounded"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={handleTaskTitleChange}
              onKeyDown={handleTitleKeyDown}
              autoFocus
            />
            <textarea
              id="task-description"
              className="w-full p-1 mb-2 border rounded text-sm"
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChange={handleTaskDescriptionChange}
              onKeyDown={handleDescriptionKeyDown}
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelAddTask}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddTask}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full mt-2">
          <button
            type="button"
            className="w-full p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded text-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAddingTask(true);
            }}
          >
            + Add Task
          </button>
        </div>
      )}
    </div>
  );
};

export default Column;
