import React from 'react';
import { Layout } from '../components/Layout';
import { StatsDisplay } from '../components/StatsDisplay';
import { useTypingResults } from '../hooks/useTypingResults';
import { useUser } from '../hooks/useUser';
import type { TypingResult } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const { results, clearResults } = useTypingResults();

  if (!user) {
    return (
      <Layout>
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Please log in to view your profile
              </h1>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getResultsByMode = (modeId: string): TypingResult[] => {
    return results.filter(result => result.testId.startsWith(modeId));
  };

  const recentResults = results.slice(0, 10);

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {formatDate(user.joinDate)}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="mb-6">
            <StatsDisplay results={results} />
          </div>

          {/* Mode-specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Basic Words Stats
              </h3>
              <StatsDisplay 
                results={getResultsByMode('lowercase')} 
                showTitle={false}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Punctuation Stats
              </h3>
              <StatsDisplay 
                results={getResultsByMode('punctuation')} 
                showTitle={false}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Code Stats
              </h3>
              <StatsDisplay 
                results={getResultsByMode('code')} 
                showTitle={false}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Data Entry Stats
              </h3>
              <StatsDisplay 
                results={getResultsByMode('data_entry')} 
                showTitle={false}
              />
            </div>
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Tests
              </h3>
              {results.length > 0 && (
                <button
                  onClick={clearResults}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Clear All Results
                </button>
              )}
            </div>
            
            {recentResults.length === 0 ? (
              <p className="text-gray-500 text-center">No tests completed yet</p>
            ) : (
              <div className="space-y-3">
                {recentResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-800">
                        {result.testId.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDate(result.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600 font-medium">{result.wpm} WPM</span>
                      <span className="text-green-600 font-medium">{result.accuracy}%</span>
                      <span className="text-gray-600">
                        {(result.timeElapsed / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
