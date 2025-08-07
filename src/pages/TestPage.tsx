import React, { useState } from 'react';
import { TypingTestEngine } from '../components/TypingTestEngine';
import { ModeSelector } from '../components/ModeSelector';
import { Layout } from '../components/Layout';
import { StatsDisplay } from '../components/StatsDisplay';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { TypingTest, TypingResult, TypingMode } from '../types';
import { loadTestById, loadModes, getRandomTestByCategory } from '../utils/testLoader';
import { useTypingResults } from '../hooks/useTypingResults';

export const TestPage: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<TypingTest | null>(null);
  const [testResult, setTestResult] = useState<TypingResult | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('lowercase');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [modes] = useState<TypingMode[]>(loadModes());
  const { results, addResult } = useTypingResults();

  const startTest = () => {
    // Load a random test from the selected category
    const test = getRandomTestByCategory(selectedMode);
    if (test) {
      setCurrentTest(test);
      setTestResult(null);
      setIsTestActive(true);
    }
  };

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
  };

  const handleTestComplete = (result: TypingResult) => {
    setTestResult(result);
    setIsTestActive(false);
    addResult(result);
  };

  const resetTest = () => {
    setCurrentTest(null);
    setTestResult(null);
    setIsTestActive(false);
    setSelectedMode('lowercase'); // Reset to default mode
  };

  if (!currentTest && !testResult) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Typing Practice
          </h1>
          <p className="text-gray-600">
            Choose a mode and start improving your typing skills
          </p>
        </div>
        
        <div className="mb-8">
          <StatsDisplay results={results} />
        </div>
        
        <ModeSelector
          selectedMode={selectedMode}
          onModeSelect={handleModeSelect}
          modes={modes}
        />
        
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showKeyboard}
                onChange={(e) => setShowKeyboard(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Virtual Keyboard</span>
            </label>
          </div>
          
          <button
            onClick={startTest}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Start Typing Test
          </button>
        </div>
      </div>
    );
  }

  if (testResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Test Complete!
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-gray-600">WPM:</span>
              <span className="font-semibold text-xl">{testResult.wpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-semibold text-xl">{testResult.accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Errors:</span>
              <span className="font-semibold text-xl">{testResult.errors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold text-xl">
                {(testResult.timeElapsed / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={resetTest}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              New Test
            </button>
            <button
              onClick={() => {
                setTestResult(null);
                setIsTestActive(true);
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {currentTest && (
        <ErrorBoundary>
          <TypingTestEngine
            test={currentTest}
            onComplete={handleTestComplete}
            showKeyboard={showKeyboard}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
