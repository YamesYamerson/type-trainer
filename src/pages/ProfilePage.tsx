import React, { useState, useEffect } from 'react';
import type { TypingResult, UserStats } from '../types';
import { StatsDisplay } from '../components/StatsDisplay';
import { DataManager } from '../utils/dataManager';

export const ProfilePage: React.FC = () => {
  const [results, setResults] = useState<TypingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallStats, setOverallStats] = useState<UserStats>({
    totalTests: 0,
    averageWpm: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    lastTestDate: null
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedResults, stats] = await Promise.all([
          DataManager.getResults(100),
          DataManager.getUserStats()
        ]);
        setResults(loadedResults);
        setOverallStats(stats);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getResultsByMode = (modeId: string): TypingResult[] => {
    return results.filter(result => result.category === modeId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Profile</h1>
      
      {/* Overall Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Statistics</h2>
        <StatsDisplay results={results} />
      </div>

      {/* Category-Specific Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Words Stats</h3>
          <StatsDisplay results={getResultsByMode('lowercase')} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Punctuation Stats</h3>
          <StatsDisplay results={getResultsByMode('punctuation')} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Code Stats</h3>
          <StatsDisplay results={getResultsByMode('code')} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Entry Stats</h3>
          <StatsDisplay results={getResultsByMode('data_entry')} />
        </div>
      </div>

      {/* Recent Tests */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Tests</h2>
        {results.length === 0 ? (
          <p className="text-gray-600">No tests completed yet. Start practicing to see your results here!</p>
        ) : (
          <div className="space-y-3">
            {results.slice(0, 10).map((result, index) => (
              <div key={`${result.testId}-${result.timestamp}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">
                    {result.category === 'lowercase' ? 'Basic Words' :
                     result.category === 'punctuation' ? 'Punctuation' :
                     result.category === 'code' ? 'Code' :
                     result.category === 'data_entry' ? 'Data Entry' : result.category}
                  </span>
                  <span className="text-gray-600 ml-2">• {new Date(result.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{result.wpm} WPM</div>
                  <div className="text-sm text-gray-600">{result.accuracy}% accuracy</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
