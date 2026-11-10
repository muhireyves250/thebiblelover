import React, { useRef } from 'react';

type Props = {
  isOpen: boolean;
  initialText: string;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

const NoteSheet: React.FC<Props> = ({ isOpen, initialText, onSave, onDelete, onClose }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const value = textareaRef.current?.value ?? '';
    if (value === initialText) {
      onClose();
      return;
    }
    onSave(value);
    onClose();
  };

  return (
    <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50">
      <div className="bg-white dark:bg-[#141417] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-4 max-w-md mx-auto">
        <textarea
          ref={textareaRef}
          defaultValue={initialText}
          placeholder="Add a note..."
          rows={3}
          autoFocus
          className="w-full text-sm bg-transparent resize-none focus:outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
        />
        <div className="flex items-center justify-end gap-2 mt-2">
          {initialText && (
            <button
              onClick={() => { onDelete(); onClose(); }}
              className="text-xs font-bold uppercase tracking-wider text-red-500 hover:underline px-2 py-1"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:underline px-2 py-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-full px-4 py-1.5"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteSheet;
