import React from 'react';
import type { TypingMode } from '../types';

interface ModeSelectorProps {
  selectedMode: string;
  onModeSelect: (modeId: string) => void;
  modes: TypingMode[];
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  modes
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Select Typing Mode
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedMode === mode.id
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <h3 className="font-semibold mb-2">{mode.name}</h3>
            <p className="text-sm text-gray-600">
              {mode.options.join(', ')}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
