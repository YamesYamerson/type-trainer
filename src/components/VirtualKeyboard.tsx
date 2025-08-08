import React from 'react';

interface VirtualKeyboardProps {
  currentKey?: string;
  nextKey?: string;
  isActive?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  currentKey, 
  nextKey,
  isActive = true 
}) => {
  const keyboardLayout = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
  ];

  // Helper function to find the key on the keyboard
  const findKeyOnKeyboard = (char: string | undefined): string | null => {
    if (!char) return null;
    
    const lowerChar = char.toLowerCase();
    
    // Handle special cases
    if (char === ' ') return 'Space';
    if (char === '\n' || char === '\r') return 'Enter';
    if (char === '\t') return 'Tab';
    
    // Check if the character exists on the keyboard
    for (const row of keyboardLayout) {
      for (const key of row) {
        if (key.toLowerCase() === lowerChar) {
          return key;
        }
      }
    }
    
    // If not found, return the character as is (for special characters)
    return char;
  };

  const getKeyClass = (key: string) => {
    const baseClass = 'px-2 py-3 rounded text-sm font-medium transition-all duration-150 select-none';
    
    if (!isActive) {
      return `${baseClass} bg-gray-200 text-gray-500`;
    }
    
    // Current key being pressed (highest priority)
    const currentKeyOnKeyboard = findKeyOnKeyboard(currentKey);
    if (currentKey && currentKeyOnKeyboard && currentKeyOnKeyboard.toLowerCase() === key.toLowerCase()) {
      return `${baseClass} bg-blue-500 text-white shadow-lg scale-110`;
    }
    
    // Next key to be typed (second priority)
    const nextKeyOnKeyboard = findKeyOnKeyboard(nextKey);
    if (nextKey && nextKeyOnKeyboard && nextKeyOnKeyboard.toLowerCase() === key.toLowerCase()) {
      return `${baseClass} bg-yellow-400 text-gray-800 shadow-md`;
    }
    
    // Special styling for different key types
    if (key === 'Space') {
      return `${baseClass} bg-gray-300 text-gray-700 hover:bg-gray-400 min-w-[200px]`;
    }
    
    if (['Shift', 'Ctrl', 'Alt', 'Tab', 'Caps', 'Enter', 'Backspace'].includes(key)) {
      return `${baseClass} bg-gray-400 text-gray-800 hover:bg-gray-500`;
    }
    
    if (['Win', 'Menu'].includes(key)) {
      return `${baseClass} bg-gray-300 text-gray-700 hover:bg-gray-400`;
    }
    
    return `${baseClass} bg-gray-300 text-gray-700 hover:bg-gray-400`;
  };

  const getKeyWidth = (key: string) => {
    switch (key) {
      case 'Backspace':
        return 'w-20';
      case 'Tab':
        return 'w-16';
      case 'Caps':
        return 'w-20';
      case 'Enter':
        return 'w-20';
      case 'Shift':
        return 'w-16';
      case 'Space':
        return 'w-48';
      case 'Ctrl':
      case 'Alt':
      case 'Win':
      case 'Menu':
        return 'w-16';
      default:
        return 'w-10';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Virtual Keyboard
      </h3>
      
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            {row.map((key, keyIndex) => (
              <div
                key={`${rowIndex}-${keyIndex}`}
                className={`${getKeyClass(key)} ${getKeyWidth(key)} flex items-center justify-center border border-gray-400`}
              >
                {key === 'Space' ? 'Space' : key}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {isActive && (currentKey || nextKey) && (
        <div className="mt-4 text-center space-y-1">
          {currentKey && (
            <p className="text-sm text-gray-600">
              Current key: <span className="font-semibold text-blue-600">{currentKey}</span>
            </p>
          )}
          {nextKey && !currentKey && (
            <p className="text-sm text-gray-600">
              Next key: <span className="font-semibold text-yellow-600">{nextKey}</span>
            </p>
          )}
        </div>
      )}
      
      {/* Special character display for keys not on standard keyboard */}
      {isActive && nextKey && !findKeyOnKeyboard(nextKey) && (
        <div className="mt-2 text-center">
          <div className="inline-block bg-yellow-100 border-2 border-yellow-400 rounded px-3 py-1">
            <span className="text-sm font-semibold text-yellow-800">
              Special character: {nextKey}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
