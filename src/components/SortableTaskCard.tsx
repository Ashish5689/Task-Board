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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard 
        task={task} 
        columnId={columnId} 
        isDragging={isDragging}
      />
    </div>
  );
};

export default SortableTaskCard;
