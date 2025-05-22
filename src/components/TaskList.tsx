import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import SortableTaskCard from './SortableTaskCard.tsx';
import type { Task } from '../types';

interface TaskListProps {
  columnId: string;
  tasks: Task[];
}

const TaskList = ({ columnId, tasks }: TaskListProps) => {
  const [isOver, setIsOver] = useState(false);
  
  const { setNodeRef, isOver: dndIsOver } = useDroppable({
    id: columnId,
    data: {
      type: 'column',
      columnId,
    },
  });

  // Update isOver state when dndIsOver changes
  useEffect(() => {
    if (dndIsOver) {
      setIsOver(true);
    } else {
      setIsOver(false);
    }
  }, [dndIsOver]);

  return (
    <div 
      ref={setNodeRef}
      className={`task-list flex-1 overflow-y-auto custom-scrollbar p-1 space-y-2 rounded-md transition-colors duration-200 ${isOver ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
      data-column-id={columnId}
    >
      <SortableContext 
        items={tasks.map(task => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task, index) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            columnId={columnId}
            index={index}
          />
        ))}
      </SortableContext>
      {tasks.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500 text-sm italic min-h-[100px] rounded-md transition-colors duration-200 ${isOver ? 'bg-primary-100 dark:bg-primary-800/30' : ''}`}>
          {isOver ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-primary-600 dark:text-primary-400">Drop task here</span>
            </>
          ) : (
            <span>No tasks yet</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
