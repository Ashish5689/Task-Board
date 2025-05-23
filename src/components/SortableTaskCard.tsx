import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import TaskCard from './TaskCard';
import { useEffect } from 'react';

interface SortableTaskCardProps {
  task: Task;
  columnId: string;
  index: number; // Still needed for sorting context
}

const SortableTaskCard = ({ task, columnId, index }: SortableTaskCardProps) => {
  // Create a stable data object that won't change between renders
  // We need to ensure this object is stable but also contains the current columnId
  const data = {
    type: 'task',
    task,
    columnId,
    index,
    sourceId: columnId, // Explicitly track the source column ID
  };
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data,
  });
  
  // Always log when dragging to help debug
  useEffect(() => {
    if (isDragging) {
      console.log(`Dragging task ${task.id} from column ${columnId} at index ${index}`, { data });
    }
  }, [isDragging, task.id, columnId, index, data]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-manipulation ${isDragging ? 'relative' : ''}`}
      data-dragging={isDragging ? 'true' : 'false'}
      data-column-id={columnId} // Add data attribute for column ID
      data-task-id={task.id} // Add data attribute for task ID
      aria-roledescription="Draggable task"
      aria-label={`Task: ${task.title}`}
    >
      <TaskCard 
        task={task} 
        columnId={columnId} 
        isDragging={isDragging}
      />
      {isDragging && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 opacity-50 pointer-events-none rounded-lg border-2 border-dashed border-primary-400 dark:border-primary-600" />
      )}
    </div>
  );
};

export default SortableTaskCard;
