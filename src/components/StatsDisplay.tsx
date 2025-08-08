import React, { useEffect, useState } from 'react';
import type { TypingResult, UserStats } from '../types';
import { DatabaseSync } from '../utils/databaseSync';

interface StatsDisplayProps {
  results: TypingResult[];
  showTitle?: boolean;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  results, 
  showTitle = true 
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        // Get hybrid stats (localStorage + SQLite)
        const hybridStats = await DatabaseSync.getUserStats('default_user');
        setStats(hybridStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback to local calculation
        if (results.length > 0) {
          const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length);
          const averageAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length);
          const bestWpm = Math.max(...results.map(r => r.wpm));
          setStats({
            userId: 'default_user',
            totalTests: results.length,
            averageWpm,
            bestWpm,
            totalAccuracy: averageAccuracy,
            lastTestDate: Math.max(...results.map(r => r.timestamp))
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [results]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalTests === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500 text-center">No tests completed yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Stats
        </h3>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.averageWpm}</div>
          <div className="text-sm text-gray-600">Avg WPM</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalAccuracy}%</div>
          <div className="text-sm text-gray-600">Avg Accuracy</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.bestWpm}</div>
          <div className="text-sm text-gray-600">Best WPM</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.totalTests}</div>
          <div className="text-sm text-gray-600">Tests Completed</div>
        </div>
      </div>
    </div>
  );
};
