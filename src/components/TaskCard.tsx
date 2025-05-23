import { useState, useEffect } from 'react';
import type { Task, User, TaskPriority } from '../types';
import { useBoardContext } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import { getUser } from '../firebase/db';
import LabelManager from './labels/LabelManager';
import TaskLabels from './labels/TaskLabels';

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
  const [dueDate, setDueDate] = useState<string | undefined>(task.dueDate);
  const [priority, setPriority] = useState<TaskPriority | undefined>(task.priority);
  const [labels, setLabels] = useState<string[]>(task.labels || []);
  const [creator, setCreator] = useState<User | null>(null);
  const [lastModifier, setLastModifier] = useState<User | null>(null);
  
  const { updateTaskDetails, removeTask } = useBoardContext();
  const { authState } = useAuth();
  
  // Fetch user information for created by and last modified by
  useEffect(() => {
    const fetchUserData = async () => {
      if (task.createdBy) {
        const userData = await getUser(task.createdBy);
        setCreator(userData);
      }
      
      if (task.lastModifiedBy && task.lastModifiedBy !== task.createdBy) {
        const userData = await getUser(task.lastModifiedBy);
        setLastModifier(userData);
      }
    };
    
    fetchUserData();
  }, [task.createdBy, task.lastModifiedBy]);
  
  const handleSave = async () => {
    if (title.trim() === '') return;
    
    await updateTaskDetails(task.id, {
      title,
      description: description.trim() === '' ? undefined : description,
      dueDate,
      priority,
      labels,
    }, authState.user?.uid);
    
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setLabels(task.labels || []);
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
  
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  if (isEditing) {
    return (
      <div className="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-lg border-l-4 border-primary-500 dark:border-primary-600 transition-colors duration-200 z-20 relative">
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
        
        {/* Due Date Picker */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
            value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
          />
        </div>
        
        {/* Priority Selector */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <select
            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
            value={priority || ''}
            onChange={(e) => setPriority(e.target.value as TaskPriority || undefined)}
          >
            <option value="">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        {/* Label Manager */}
        <LabelManager selectedLabels={labels} onLabelsChange={setLabels} />
        <div className="flex justify-between items-center">
          <button
            className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
            onClick={handleDelete}
            type="button"
            aria-label="Delete task"
          >
            Delete
          </button>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              onClick={handleCancel}
              type="button"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              onClick={handleSave}
              type="button"
              aria-label="Save changes"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg ${isDragging 
        ? 'shadow-xl scale-105 border-l-4 border-secondary-500 dark:border-secondary-400 ring-2 ring-secondary-200 dark:ring-secondary-900 z-10' 
        : 'shadow-task dark:shadow-task-dark hover:shadow-task-hover dark:hover:shadow-task-dark-hover border-l-4 border-primary-500 dark:border-primary-600'} 
        cursor-pointer transition-all duration-200`}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center">
        <div className="flex-1">
          <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">{task.title}</div>
          {task.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-line">{task.description}</div>
          )}
          
          {/* Display labels */}
          {task.labels && task.labels.length > 0 && (
            <TaskLabels labelIds={task.labels} maxDisplay={3} size="sm" />
          )}
        </div>
        {isDragging && (
          <div className="ml-2 text-secondary-500 dark:text-secondary-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 mt-2">
        {/* Priority and Due Date */}
        <div className="flex flex-wrap gap-2 text-xs mb-2">
          {task.priority && (
            <div className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Due: {formatDueDate(task.dueDate)}</span>
            </div>
          )}
        </div>
        
        {/* User information */}
        {(creator || lastModifier) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {creator && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                <span className="text-gray-600 dark:text-gray-300 mr-1">Created by:</span>
                <div className="flex items-center">
                  {creator.photoURL ? (
                    <img 
                      src={creator.photoURL} 
                      alt={creator.displayName} 
                      className="w-4 h-4 rounded-full mr-1"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 mr-1 flex items-center justify-center text-[8px] text-white">
                      {creator.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-gray-700 dark:text-gray-200">{creator.displayName}</span>
                </div>
              </div>
            )}
            {lastModifier && lastModifier.uid !== creator?.uid && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                <span className="text-gray-600 dark:text-gray-300 mr-1">Modified by:</span>
                <div className="flex items-center">
                  {lastModifier.photoURL ? (
                    <img 
                      src={lastModifier.photoURL} 
                      alt={lastModifier.displayName} 
                      className="w-4 h-4 rounded-full mr-1"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 mr-1 flex items-center justify-center text-[8px] text-white">
                      {lastModifier.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-gray-700 dark:text-gray-200">{lastModifier.displayName}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Date and delete button */}
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
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
    </div>
  );
};

export default TaskCard;
