import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
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
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-pulse-slow flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-primary-500 dark:text-primary-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your board...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-3">
            <svg className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Board</h3>
          </div>
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!board) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md text-center">
          <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No board data available</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || null);
    
    // Log the active item data for debugging
    console.log('Drag start:', {
      id: active.id,
      type: active.data.current?.type,
      columnId: active.data.current?.columnId
    });
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setActiveType(null);
    
    const { active, over } = event;
    
    if (!over || !board) return;
    
    if (active.id !== over.id) {
      try {
        // Get the type and data from the dragged item
        const activeType = active.data.current?.type;
        const activeData = active.data.current;
        
        console.log('Drag end event:', { 
          activeId: active.id, 
          activeType, 
          activeData,
          overId: over.id, 
          overType: over.data.current?.type,
          overData: over.data.current
        });
        
        // Handle column reordering
        if (activeType === 'column') {
          // Ensure columnOrder is an array
          const columnOrder = Array.isArray(board.columnOrder) ? board.columnOrder : [];
          const oldIndex = columnOrder.indexOf(active.id as string);
          const newIndex = columnOrder.indexOf(over.id as string);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            await handleDragEndFirebase({
              draggableId: active.id as string,
              type: 'column',
              source: {
                droppableId: 'board',
                index: oldIndex,
              },
              destination: {
                droppableId: 'board',
                index: newIndex,
              },
            });
          }
          return;
        }
        
        // Handle task movement
        if (activeType === 'task') {
          // Try multiple ways to get the source column ID
          let sourceColumnId = activeData?.columnId || activeData?.sourceId;
          
          // If still not found, try data attributes
          if (!sourceColumnId && active.data.current?.task?.id) {
            // Look for the task in all columns
            // Ensure columnOrder is an array
            const columnOrder = Array.isArray(board.columnOrder) ? board.columnOrder : [];
            for (const columnId of columnOrder) {
              const column = board.columns[columnId];
              if (!column) continue;
              
              // Ensure taskIds is an array
              const taskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
              if (taskIds.includes(active.id as string)) {
                sourceColumnId = columnId;
                break;
              }
            }
          }
          
          if (!sourceColumnId) {
            console.error('Source column ID not found in drag data', { active, activeData });
            return;
          }
          
          // Find source index
          const sourceColumn = board.columns[sourceColumnId];
          if (!sourceColumn) {
            console.error('Source column not found in board data', sourceColumnId);
            return;
          }
          
          // Ensure taskIds is an array
          const sourceTaskIds = Array.isArray(sourceColumn.taskIds) ? sourceColumn.taskIds : [];
          const sourceIndex = sourceTaskIds.indexOf(active.id as string);
          if (sourceIndex === -1) {
            console.error('Task not found in source column', active.id, sourceColumnId);
            return;
          }
          
          // Determine destination
          let destinationColumnId;
          let destinationIndex;
          
          // If dropping on a task, use its column
          if (over.data.current?.type === 'task') {
            // Try multiple ways to get the destination column ID
            destinationColumnId = over.data.current?.columnId || over.data.current?.sourceId;
            
            if (!destinationColumnId) {
              // Fallback: search through columns
              // Ensure columnOrder is an array
              const columnOrder = Array.isArray(board.columnOrder) ? board.columnOrder : [];
              for (const columnId of columnOrder) {
                const column = board.columns[columnId];
                if (!column) continue;
                
                // Ensure taskIds is an array
                const taskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
                const taskIndex = taskIds.indexOf(over.id as string);
                if (taskIndex !== -1) {
                  destinationColumnId = columnId;
                  destinationIndex = taskIndex;
                  break;
                }
              }
            } else {
              // Get the destination index
              const destinationColumn = board.columns[destinationColumnId];
              if (destinationColumn) {
                // Ensure taskIds is an array
                const taskIds = Array.isArray(destinationColumn.taskIds) ? destinationColumn.taskIds : [];
                destinationIndex = taskIds.indexOf(over.id as string);
              }
            }
          } else {
            // Dropping directly on a column
            destinationColumnId = over.id as string;
            const column = board.columns[destinationColumnId];
            if (column) {
              // Ensure taskIds is an array
              const taskIds = Array.isArray(column.taskIds) ? column.taskIds : [];
              destinationIndex = taskIds.length;
            }
          }
          
          if (!destinationColumnId) {
            console.error('Could not determine destination column', { 
              taskId: active.id,
              over
            });
            return;
          }
          
          // If destination index is still not determined, set it to the end of the column
          if (destinationIndex === undefined || destinationIndex === -1) {
            const destinationColumn = board.columns[destinationColumnId];
            if (destinationColumn) {
              // Ensure taskIds is an array
              const taskIds = Array.isArray(destinationColumn.taskIds) ? destinationColumn.taskIds : [];
              destinationIndex = taskIds.length;
            } else {
              destinationIndex = 0; // Default to beginning if column has no tasks
            }
          }
          
          console.log('Moving task:', {
            taskId: active.id,
            from: { columnId: sourceColumnId, index: sourceIndex },
            to: { columnId: destinationColumnId, index: destinationIndex }
          });
          
          await handleDragEndFirebase({
            draggableId: active.id as string,
            type: 'task',
            source: {
              droppableId: sourceColumnId,
              index: sourceIndex,
            },
            destination: {
              droppableId: destinationColumnId,
              index: destinationIndex,
            },
          });
        }
      } catch (error) {
        console.error('Error in drag and drop operation:', error);
      }
    }
  };
  
  const handleAddColumn = async () => {
    if (newColumnTitle.trim() === '') return;
    
    await addNewColumn(newColumnTitle);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="relative mr-2">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
              {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
            </div>
          </div>
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className="flex space-x-4 overflow-x-auto pb-6 custom-scrollbar">
          <SortableContext items={board.columnOrder || []} strategy={horizontalListSortingStrategy}>
            {(board.columnOrder || []).map((columnId) => {
              const column = board.columns?.[columnId];
              if (!column) return null;
              
              const columnTasks = (column.taskIds || [])
                .map(taskId => board.tasks?.[taskId])
                .filter(Boolean) || [];
              
              return (
                <SortableColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  index={(board.columnOrder || []).indexOf(columnId)}
                />
              );
            })}
          </SortableContext>
          
          {isAddingColumn ? (
            <div className="min-w-[280px] max-w-[280px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Column</div>
              <input
                type="text"
                className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200"
                placeholder="Column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddColumn();
                  } else if (e.key === 'Escape') {
                    setNewColumnTitle('');
                    setIsAddingColumn(false);
                  }
                }}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                  onClick={() => {
                    setNewColumnTitle('');
                    setIsAddingColumn(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                  onClick={handleAddColumn}
                  disabled={!newColumnTitle.trim()}
                >
                  Add Column
                </button>
              </div>
            </div>
          ) : (
            <div
              className="min-w-[280px] max-w-[280px] h-[calc(100vh-160px)] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200"
              onClick={() => setIsAddingColumn(true)}
            >
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">Add Column</span>
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
