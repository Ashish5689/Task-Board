import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column as ColumnType, Task } from '../types';
import Column from './Column';

interface SortableColumnProps {
  column: ColumnType;
  tasks: Task[];
  index: number; // Still needed for sorting context
}

const SortableColumn = ({ column, tasks }: SortableColumnProps) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Column 
        column={column} 
        tasks={tasks} 
      />
    </div>
  );
};

export default SortableColumn;
