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
        // If results are provided, calculate stats from them
        if (results.length > 0) {
          const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length);
          const averageAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length);
          const bestWpm = Math.max(...results.map(r => r.wpm));
          
          // Calculate category and subcategory stats
          const categoryStats: { [key: string]: { tests: number; averageWpm: number; averageAccuracy: number } } = {};
          const subcategoryStats: { [key: string]: { tests: number; averageWpm: number; averageAccuracy: number } } = {};
          
          results.forEach(result => {
            // Category stats
            if (!categoryStats[result.category]) {
              categoryStats[result.category] = { tests: 0, averageWpm: 0, averageAccuracy: 0, totalWpm: 0, totalAccuracy: 0 };
            }
            categoryStats[result.category].tests++;
            categoryStats[result.category].totalWpm += result.wpm;
            categoryStats[result.category].totalAccuracy += result.accuracy;
            
            // Subcategory stats
            const subcategoryKey = `${result.category}_${result.subcategory}`;
            if (!subcategoryStats[subcategoryKey]) {
              subcategoryStats[subcategoryKey] = { tests: 0, averageWpm: 0, averageAccuracy: 0, totalWpm: 0, totalAccuracy: 0 };
            }
            subcategoryStats[subcategoryKey].tests++;
            subcategoryStats[subcategoryKey].totalWpm += result.wpm;
            subcategoryStats[subcategoryKey].totalAccuracy += result.accuracy;
          });
          
          // Calculate averages
          Object.keys(categoryStats).forEach(category => {
            const cat = categoryStats[category];
            cat.averageWpm = Math.round(cat.totalWpm / cat.tests);
            cat.averageAccuracy = Math.round(cat.totalAccuracy / cat.tests);
            delete (cat as any).totalWpm;
            delete (cat as any).totalAccuracy;
          });
          
          Object.keys(subcategoryStats).forEach(subcategory => {
            const sub = subcategoryStats[subcategory];
            sub.averageWpm = Math.round(sub.totalWpm / sub.tests);
            sub.averageAccuracy = Math.round(sub.totalAccuracy / sub.tests);
            delete (sub as any).totalWpm;
            delete (sub as any).totalAccuracy;
          });
          
          setStats({
            totalTests: results.length,
            averageWpm,
            bestWpm,
            averageAccuracy,
            lastTestDate: Math.max(...results.map(r => r.timestamp)),
            categoryStats
          });
        } else {
          // If no results provided, get hybrid stats (localStorage + SQLite)
          const hybridStats = await DatabaseSync.getUserStats('default_user');
          setStats(hybridStats);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback to local calculation
        if (results.length > 0) {
          const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length);
          const averageAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length);
          const bestWpm = Math.max(...results.map(r => r.wpm));
          setStats({
            totalTests: results.length,
            averageWpm,
            bestWpm,
            averageAccuracy,
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
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.averageWpm}</div>
          <div className="text-sm text-gray-600">Avg WPM</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.averageAccuracy}%</div>
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

      {/* Category Stats */}
      {stats.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Category Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(stats.categoryStats).map(([category, catStats]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 capitalize mb-2">{category.replace('_', ' ')}</h5>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{catStats.tests}</div>
                    <div className="text-gray-500">Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{catStats.averageWpm}</div>
                    <div className="text-gray-500">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{catStats.averageAccuracy}%</div>
                    <div className="text-gray-500">Acc</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
