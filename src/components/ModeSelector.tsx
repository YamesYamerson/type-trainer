import React, { useState } from 'react';
import type { TypingMode } from '../types';

interface ModeSelectorProps {
  selectedMode: string;
  selectedSubcategory: string;
  onModeSelect: (modeId: string, subcategoryId: string) => void;
  modes: TypingMode[];
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  selectedSubcategory,
  onModeSelect,
  modes
}) => {
  const [expandedMode, setExpandedMode] = useState<string | null>(selectedMode || null);

  // Update expandedMode when selectedMode changes
  React.useEffect(() => {
    if (selectedMode) {
      setExpandedMode(selectedMode);
    }
  }, [selectedMode]);

  // Safety check for valid props
  if (!modes || modes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Select Typing Mode & Subcategory
        </h2>
        <div className="text-center">
          <p className="text-gray-600">No typing modes available.</p>
        </div>
      </div>
    );
  }

  // Only show error if selectedMode is provided but invalid
  if (selectedMode && !modes.find(m => m.id && m.id === selectedMode)) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-gray-600">Please select a valid typing mode.</p>
        </div>
      </div>
    );
  }

  const handleModeClick = (modeId: string) => {
    if (!modeId) return;
    
    if (expandedMode === modeId) {
      setExpandedMode(null);
    } else {
      setExpandedMode(modeId);
      // Auto-select first subcategory when expanding a mode
      const mode = modes.find(m => m.id && m.id === modeId);
      if (mode && mode.subcategories && mode.subcategories.length > 0 && mode.subcategories[0].id) {
        onModeSelect(modeId, mode.subcategories[0].id);
      }
    }
  };

  const handleSubcategoryClick = (modeId: string, subcategoryId: string) => {
    if (!modeId || !subcategoryId) return;
    onModeSelect(modeId, subcategoryId);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Select Typing Mode & Subcategory
      </h2>
      
      <div className="space-y-4">
        {modes.map((mode) => (
          <div key={mode.id || `mode-${Math.random()}`} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => mode.id && handleModeClick(mode.id)}
                              className={`w-full p-4 text-left transition-all duration-200 ${
                  selectedMode && mode.id && selectedMode === mode.id
                    ? 'bg-blue-50 border-blue-500 border-l-4'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{mode.name || 'Unnamed Mode'}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {mode.options?.join(', ') || 'No options available'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {mode.subcategories?.length || 0} subcategories
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedMode && mode.id && expandedMode === mode.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
            
            {expandedMode && mode.id && expandedMode === mode.id && mode.subcategories && mode.subcategories.length > 0 && (
              <div className="border-t bg-white">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Subcategory:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mode.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id || `subcategory-${Math.random()}`}
                        onClick={() => mode.id && subcategory.id && handleSubcategoryClick(mode.id, subcategory.id)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                          selectedMode && mode.id && selectedMode === mode.id && 
                          selectedSubcategory && subcategory.id && selectedSubcategory === subcategory.id
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-sm">{subcategory.name || 'Unnamed Subcategory'}</h5>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            subcategory.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            subcategory.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            subcategory.difficulty === 'advanced' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subcategory.difficulty || 'unknown'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{subcategory.description || 'No description available'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
