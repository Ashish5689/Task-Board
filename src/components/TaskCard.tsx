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
      <div className="task p-3 mb-2 bg-white rounded-md shadow border-l-4 border-blue-500">
        <input
          type="text"
          className="w-full p-1 mb-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          className="w-full p-1 mb-2 border rounded text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
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
      className={`task ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="task-title">{task.title}</div>
      {task.description && (
        <div className="task-description">{task.description}</div>
      )}
      <div className="task-footer">
        <span>Updated: {formatDate(task.updatedAt)}</span>
        <button
          className="text-red-500 hover:text-red-700"
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
