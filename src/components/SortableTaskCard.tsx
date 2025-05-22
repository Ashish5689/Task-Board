import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import TaskCard from './TaskCard';

interface SortableTaskCardProps {
  task: Task;
  columnId: string;
  index: number; // Still needed for sorting context
}

const SortableTaskCard = ({ task, columnId }: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId,
    },
  });

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
      aria-roledescription="Draggable task"
      aria-label={`Task: ${task.title}`}
    >
      <TaskCard 
        task={task} 
        columnId={columnId} 
        isDragging={isDragging}
      />
      {isDragging && (
        <div className="absolute inset-0 bg-secondary-100 dark:bg-secondary-900 opacity-20 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default SortableTaskCard;
