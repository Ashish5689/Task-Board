import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../types';
import SortableTaskCard from './SortableTaskCard.tsx';

interface TaskListProps {
  id: string;
  tasks: Task[];
}

const TaskList = ({ id, tasks }: TaskListProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className="task-list">
      <SortableContext 
        items={tasks.map(task => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task, index) => (
          <SortableTaskCard 
            key={task.id} 
            task={task} 
            columnId={id} 
            index={index} 
          />
        ))}
      </SortableContext>
    </div>
  );
};

export default TaskList;
