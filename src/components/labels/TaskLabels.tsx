import { useState, useEffect } from 'react';
import type { TaskLabel } from '../../types';
import { getLabels } from '../../firebase/db';

interface TaskLabelsProps {
  labelIds: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const TaskLabels = ({ labelIds = [], maxDisplay = 3, size = 'md', onClick }: TaskLabelsProps) => {
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  // Fetch all labels
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true);
        const allLabels = await getLabels();
        
        // Filter to only include labels that are assigned to this task
        const taskLabels = allLabels.filter(label => labelIds.includes(label.id));
        setLabels(taskLabels);
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (labelIds.length > 0) {
      fetchLabels();
    } else {
      setLabels([]);
      setIsLoading(false);
    }
  }, [labelIds]);

  if (isLoading) {
    return <div className="flex gap-1 mt-2 animate-pulse">
      <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      {labelIds.length > 1 && <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>}
    </div>;
  }

  if (labels.length === 0) {
    return null;
  }

  // Display only a subset of labels if there are more than maxDisplay
  const displayLabels = labels.slice(0, maxDisplay);
  const remainingCount = labels.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1 mt-2" onClick={onClick}>
      {displayLabels.map(label => (
        <span 
          key={label.id}
          className={`${sizeClasses[size]} rounded-full font-medium text-white ${label.color} cursor-pointer`}
        >
          {label.name}
        </span>
      ))}
      
      {/* Show count of remaining labels if any */}
      {remainingCount > 0 && (
        <span className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer`}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default TaskLabels;
