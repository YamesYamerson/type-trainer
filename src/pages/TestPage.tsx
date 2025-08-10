import React, { useState } from 'react';
import { TypingTestEngine } from '../components/TypingTestEngine';
import { ModeSelector } from '../components/ModeSelector';
import { StatsDisplay } from '../components/StatsDisplay';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { TypingTest, TypingResult, TypingMode } from '../types';
import { loadTestById, loadModes, getRandomTestBySubcategory, getSubcategoriesForMode } from '../utils/testLoader';
import { useTypingResults } from '../hooks/useTypingResults';

export const TestPage: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<TypingTest | null>(null);
  const [testResult, setTestResult] = useState<TypingResult | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('lowercase');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('random_words');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [modes] = useState<TypingMode[]>(loadModes());
  const { results, addResult, syncStatus, syncPendingData } = useTypingResults();

  // Initialize with first subcategory of lowercase mode
  React.useEffect(() => {
    const lowercaseMode = modes.find(mode => mode.id === 'lowercase');
    if (lowercaseMode && lowercaseMode.subcategories.length > 0) {
      setSelectedSubcategory(lowercaseMode.subcategories[0].id);
    }
  }, [modes]);

  const startTest = () => {
    // Load a random test from the selected category and subcategory
    const test = getRandomTestBySubcategory(selectedMode, selectedSubcategory);
    if (test) {
      setCurrentTest(test);
      setTestResult(null);
      setIsTestActive(true);
    }
  };

  const handleModeSelect = (modeId: string, subcategoryId: string) => {
    setSelectedMode(modeId);
    setSelectedSubcategory(subcategoryId);
  };

  const handleTestComplete = async (result: TypingResult) => {
    console.log('📝 TestPage: handleTestComplete called with result:', result);
    console.log('📝 TestPage: Current state - isTestActive:', isTestActive, 'testResult:', testResult);
    
    setTestResult(result);
    setIsTestActive(false);
    
    console.log('📝 TestPage: State updated, about to call addResult...');
    try {
      await addResult(result);
      console.log('📝 TestPage: addResult completed successfully');
    } catch (error) {
      console.error('📝 TestPage: addResult failed:', error);
    }
  };

  const resetTest = () => {
    setCurrentTest(null);
    setTestResult(null);
    setIsTestActive(false);
    setSelectedMode('lowercase'); // Reset to default mode
    const lowercaseMode = modes.find(mode => mode.id === 'lowercase');
    if (lowercaseMode && lowercaseMode.subcategories.length > 0) {
      setSelectedSubcategory(lowercaseMode.subcategories[0].id);
    }
  };

  // Get current mode and subcategory info for display
  const currentMode = modes.find(mode => mode.id === selectedMode);
  const currentSubcategory = currentMode?.subcategories.find(sub => sub.id === selectedSubcategory);

  if (!currentTest && !testResult) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Typing Practice
          </h1>
          <p className="text-gray-600">
            Choose a mode and subcategory to start improving your typing skills
          </p>
        </div>
        
        <div className="mb-8">
          <StatsDisplay results={results} />
        </div>
        
        <ModeSelector
          selectedMode={selectedMode}
          selectedSubcategory={selectedSubcategory}
          onModeSelect={handleModeSelect}
          modes={modes}
        />

        {/* Selected Mode & Subcategory Display */}
        {currentMode && currentSubcategory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Selected: {currentMode.name} - {currentSubcategory.name}
              </h3>
              <p className="text-blue-600 text-sm mb-3">
                {currentSubcategory.description}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentSubcategory.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  currentSubcategory.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentSubcategory.difficulty} level
                </span>
                <span className="text-blue-600 text-sm">
                  {getSubcategoriesForMode(selectedMode).length} subcategories available
                </span>
              </div>
            </div>
          </div>
        )}
        
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
          
          {/* Sync Status */}
          {syncStatus && (
            <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{syncStatus}</p>
            </div>
          )}
          
          {syncPendingData && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You have {syncPendingData} test results waiting to sync
              </p>
            </div>
          )}
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
