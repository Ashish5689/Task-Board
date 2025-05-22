import { useState } from 'react';
import type { Task } from '../types';
import { useBoardContext } from '../context/BoardContext';

interface TaskCardProps {
  task: Task;
  columnId: string;
  index?: number;
  isDragging?: boolean;
}

const TaskCard = ({ task, columnId, isDragging }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  
  const { updateTaskDetails, removeTask } = useBoardContext();
  
  const handleSave = async () => {
    if (title.trim() === '') return;
    
    await updateTaskDetails(task.id, {
      title,
      description: description.trim() === '' ? undefined : description,
    });
    
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    await removeTask(task.id, columnId);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isEditing) {
    return (
      <div className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-task dark:shadow-task-dark border-l-4 border-primary-500 dark:border-primary-600 transition-colors duration-200">
        <input
          type="text"
          className="w-full p-2 mb-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          className="w-full p-2 mb-3 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-task dark:shadow-task-dark hover:shadow-task-hover dark:hover:shadow-task-dark-hover border-l-4 border-primary-500 dark:border-primary-600 cursor-pointer transition-all duration-200 ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">{task.title}</div>
      {task.description && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-line">{task.description}</div>
      )}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 mt-2">
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {formatDate(task.updatedAt)}
        </span>
        <button
          className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
