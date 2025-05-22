import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { 
  SortableContext, 
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBoardContext } from '../context/BoardContext';
import { usePresenceContext } from '../context/PresenceContext';
import Column from './Column';
import SortableColumn from './SortableColumn';
import TaskCard from './TaskCard';

const Board = () => {
  const { board, loading, error, addNewColumn, handleDragEnd: handleDragEndFirebase } = useBoardContext();
  const { onlineUsers } = usePresenceContext();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'column' | 'task' | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    // Disable keyboard sensor to prevent space bar issues
    // useSensor(KeyboardSensor)
  );
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }
  
  if (!board) {
    return <div className="flex justify-center items-center h-screen">No board data available</div>;
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || null);
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setActiveType(null);
    
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      await handleDragEndFirebase({
        draggableId: active.id,
        type: active.data.current?.type,
        source: {
          droppableId: active.data.current?.type === 'task' 
            ? active.data.current?.columnId 
            : 'board',
          index: active.data.current?.type === 'task'
            ? board.columns[active.data.current?.columnId].taskIds.indexOf(active.id as string)
            : board.columnOrder.indexOf(active.id as string),
        },
        destination: {
          droppableId: over.data.current?.type === 'task'
            ? over.data.current?.columnId
            : over.id,
          index: over.data.current?.type === 'task'
            ? board.columns[over.data.current?.columnId].taskIds.indexOf(over.id as string)
            : board.columnOrder.indexOf(over.id as string),
        },
      });
    }
  };
  
  const handleAddColumn = async () => {
    if (newColumnTitle.trim() === '') return;
    
    await addNewColumn(newColumnTitle);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };
  
  return (
    <div className="board-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
          </div>
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <SortableContext
            items={board.columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {board.columnOrder && board.columnOrder.map((columnId, index) => {
              const column = board.columns?.[columnId];
              if (!column) return null;
              const tasks = column.taskIds?.map(taskId => board.tasks?.[taskId]).filter(Boolean) || [];
              
              return (
                <SortableColumn
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  index={index}
                />
              );
            })}
          </SortableContext>
          
          {isAddingColumn ? (
            <div className="column min-w-[300px] max-w-[300px]">
              <div className="column-header">
                <input
                  type="text"
                  className="w-full p-1 border rounded"
                  placeholder="Column title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setNewColumnTitle('');
                      setIsAddingColumn(false);
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setNewColumnTitle('');
                    setIsAddingColumn(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddColumn}
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <div
              className="min-w-[300px] max-w-[300px] h-12 flex items-center justify-center bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
              onClick={() => setIsAddingColumn(true)}
            >
              + Add Column
            </div>
          )}
        </div>
        
        <DragOverlay>
          {activeId && activeType === 'column' && board.columns?.[activeId] && (
            <Column
              column={board.columns[activeId]}
              tasks={(board.columns[activeId].taskIds || []).map(taskId => board.tasks?.[taskId]).filter(Boolean) || []}
            />
          )}
          {activeId && activeType === 'task' && board.tasks?.[activeId] && (
            <TaskCard
              task={board.tasks[activeId]}
              columnId={Object.values(board.columns || {}).find(column => 
                column?.taskIds?.includes(activeId)
              )?.id || ''}
              isDragging={true}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;
