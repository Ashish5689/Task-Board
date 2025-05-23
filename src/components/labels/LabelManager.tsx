import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TaskLabel } from '../../types';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../../firebase/db';
import { useAuth } from '../../context/AuthContext';

interface LabelManagerProps {
  selectedLabels: string[];
  onLabelsChange: (labelIds: string[]) => void;
}

// Predefined colors for labels
const LABEL_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

const LabelManager = ({ selectedLabels, onLabelsChange }: LabelManagerProps) => {
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  // Fetch labels from Firebase
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true);
        const fetchedLabels = await getLabels();
        setLabels(fetchedLabels);
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabels();
  }, []);

  // Handle creating a new label
  const handleCreateLabel = async () => {
    if (newLabelName.trim() === '') return;

    try {
      const newLabel: TaskLabel = {
        id: uuidv4(),
        name: newLabelName.trim(),
        color: newLabelColor,
      };

      await createLabel(newLabel, authState.user?.uid);
      setLabels([...labels, newLabel]);
      setNewLabelName('');
      setNewLabelColor(LABEL_COLORS[0]);
      setIsCreatingLabel(false);
    } catch (error) {
      console.error('Error creating label:', error);
    }
  };

  // Handle toggling a label selection
  const handleToggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      onLabelsChange(selectedLabels.filter(id => id !== labelId));
    } else {
      onLabelsChange([...selectedLabels, labelId]);
    }
  };

  // Handle editing a label
  const handleEditLabel = async (labelId: string, updates: Partial<TaskLabel>) => {
    try {
      await updateLabel(labelId, updates);
      setLabels(labels.map(label => 
        label.id === labelId ? { ...label, ...updates } : label
      ));
    } catch (error) {
      console.error('Error updating label:', error);
    }
  };

  // Handle deleting a label
  const handleDeleteLabel = async (labelId: string) => {
    try {
      await deleteLabel(labelId);
      setLabels(labels.filter(label => label.id !== labelId));
      
      // Also remove from selected labels if present
      if (selectedLabels.includes(labelId)) {
        onLabelsChange(selectedLabels.filter(id => id !== labelId));
      }
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Labels</label>
        <button
          type="button"
          className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          onClick={() => setIsCreatingLabel(!isCreatingLabel)}
        >
          {isCreatingLabel ? 'Cancel' : '+ Add Label'}
        </button>
      </div>

      {/* Create new label form */}
      {isCreatingLabel && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <input
            type="text"
            className="w-full p-2 mb-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Label name"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
          />
          <div className="mb-2">
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Color</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full ${color} ${
                    newLabelColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  onClick={() => setNewLabelColor(color)}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="w-full p-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={handleCreateLabel}
          >
            Create Label
          </button>
        </div>
      )}

      {/* Labels list */}
      {isLoading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading labels...</div>
      ) : labels.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No labels created yet</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <div key={label.id} className="relative group">
              <button
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                  label.color
                } ${
                  selectedLabels.includes(label.id)
                    ? 'ring-2 ring-offset-1 ring-gray-400'
                    : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => handleToggleLabel(label.id)}
              >
                {label.name}
              </button>
              
              {/* Edit/Delete controls - visible on hover */}
              <div className="absolute right-0 top-0 -mt-2 -mr-2 hidden group-hover:flex bg-white dark:bg-gray-800 rounded-full shadow-md">
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newName = prompt('Enter new label name:', label.name);
                    if (newName && newName.trim() !== '') {
                      handleEditLabel(label.id, { name: newName.trim() });
                    }
                  }}
                  aria-label="Edit label"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete the "${label.name}" label?`)) {
                      handleDeleteLabel(label.id);
                    }
                  }}
                  aria-label="Delete label"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabelManager;
