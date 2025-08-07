import React from 'react';
import type { TypingResult } from '../types';

interface StatsDisplayProps {
  results: TypingResult[];
  showTitle?: boolean;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  results, 
  showTitle = true 
}) => {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500 text-center">No tests completed yet</p>
      </div>
    );
  }

  const averageWpm = Math.round(
    results.reduce((sum, result) => sum + result.wpm, 0) / results.length
  );
  
  const averageAccuracy = Math.round(
    results.reduce((sum, result) => sum + result.accuracy, 0) / results.length
  );
  
  const bestWpm = Math.max(...results.map(result => result.wpm));
  const totalTests = results.length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Stats
        </h3>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{averageWpm}</div>
          <div className="text-sm text-gray-600">Avg WPM</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{averageAccuracy}%</div>
          <div className="text-sm text-gray-600">Avg Accuracy</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{bestWpm}</div>
          <div className="text-sm text-gray-600">Best WPM</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{totalTests}</div>
          <div className="text-sm text-gray-600">Tests Completed</div>
        </div>
      </div>
    </div>
  );
};
