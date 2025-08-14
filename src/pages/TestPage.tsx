import React, { useState } from 'react';
import { TypingTestEngine } from '../components/TypingTestEngine';
import { ModeSelector } from '../components/ModeSelector';
import { StatsDisplay } from '../components/StatsDisplay';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Pet } from '../components/Pet';
import type { TypingTest, TypingResult, TypingMode } from '../types';
import { loadTestById, loadModes, getRandomTestBySubcategory, getSubcategoriesForMode } from '../utils/testLoader';
import { useTypingResults } from '../hooks/useTypingResults';
import { PetManager } from '../utils/petManager';
import { config } from '../config/environment';

export const TestPage: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<TypingTest | null>(null);
  const [testResult, setTestResult] = useState<TypingResult | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [modes] = useState<TypingMode[]>(loadModes());
  const { results, addResult, syncStatus } = useTypingResults();
  const [petKey, setPetKey] = useState(0); // Force pet re-render

  // Initialize with first subcategory of lowercase mode
  React.useEffect(() => {
    if (modes.length > 0) {
      const lowercaseMode = modes.find(mode => mode.id === 'lowercase');
      if (lowercaseMode && lowercaseMode.subcategories.length > 0) {
        setSelectedMode('lowercase');
        setSelectedSubcategory(lowercaseMode.subcategories[0].id);
      } else if (modes[0] && modes[0].subcategories.length > 0) {
        // Fallback to first available mode if lowercase doesn't exist
        setSelectedMode(modes[0].id);
        setSelectedSubcategory(modes[0].subcategories[0].id);
      }
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

  const startPetTrainingTest = () => {
    // Create a special pet training test with bonus rewards
    const petTrainingTest: TypingTest = {
      id: 'pet-training-special',
      category: 'pet-training',
      subcategory: 'special',
      content: 'This is a special pet training session! Complete this test to give your pet extra love and care. Your pet will be very happy and gain bonus experience from this training. Keep typing to help your pet grow stronger and happier!',
      difficulty: 'beginner',
      language: 'en'
    };
    
    setCurrentTest(petTrainingTest);
    setTestResult(null);
    setIsTestActive(true);
  };

  const handleModeSelect = (modeId: string, subcategoryId: string) => {
    setSelectedMode(modeId);
    setSelectedSubcategory(subcategoryId);
  };

  const handleTestComplete = async (result: TypingResult) => {
    setTestResult(result);
    setIsTestActive(false);
    
    try {
      await addResult(result);
      
      // Update pet with test result
      const petManager = PetManager.getInstance();
      petManager.updatePetFromTestResult(result);
      
      // If this was a pet training test, give bonus rewards
      if (result.testId === 'pet-training-special') {
        // Give bonus experience and happiness for pet training
        const bonusResult: TypingResult = {
          ...result,
          wpm: Math.max(result.wpm, 50), // Minimum 50 WPM bonus
          accuracy: Math.max(result.accuracy, 90), // Minimum 90% accuracy bonus
          testId: 'pet-training-bonus',
          hash: 'pet-training-bonus-' + Date.now()
        };
        petManager.updatePetFromTestResult(bonusResult);
      }
      
      // Force pet re-render to show updated stats
      setPetKey(prev => prev + 1);
    } catch (error) {
      console.error('📝 TestPage: addResult failed:', error);
    }
  };

  const handlePetInteraction = (action: 'feed' | 'play') => {
    // Force pet re-render after interaction
    setPetKey(prev => prev + 1);
  };

  const resetTest = () => {
    setCurrentTest(null);
    setTestResult(null);
    setIsTestActive(false);
    
    // Reset to default mode safely
    if (modes.length > 0) {
      const lowercaseMode = modes.find(mode => mode.id === 'lowercase');
      if (lowercaseMode && lowercaseMode.subcategories.length > 0) {
        setSelectedMode('lowercase');
        setSelectedSubcategory(lowercaseMode.subcategories[0].id);
      } else if (modes[0] && modes[0].subcategories.length > 0) {
        // Fallback to first available mode if lowercase doesn't exist
        setSelectedMode(modes[0].id);
        setSelectedSubcategory(modes[0].subcategories[0].id);
      }
    }
  };

  // Get current mode and subcategory info for display
  const currentMode = modes.find(mode => mode.id === selectedMode);
  const currentSubcategory = currentMode?.subcategories.find(sub => sub.id === selectedSubcategory);

  if (!currentTest && !testResult) {
    return (
      <div className="flex-1 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Typing Practice
          </h1>
          <p className="text-gray-600">
            Choose a mode and subcategory to start improving your typing skills
          </p>
        </div>
        
        {/* Pet and Stats Container */}
        <div className="mb-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Pet Display */}
            <div className="flex justify-center">
              <Pet key={petKey} onPetInteraction={handlePetInteraction} />
            </div>
            
            {/* Stats Display */}
            <div className="flex justify-center">
              <StatsDisplay results={results} />
            </div>
          </div>
          
          {/* Developer Info Row - Only show in development */}
          {config.isDevelopment ? (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  🛠️ Developer Information
                </h4>
                <p className="text-xs text-yellow-700 mb-3">
                  Pet sprites are using fallback rendering. Custom sprites can be added by placing PNG files in the sprites directory.
                </p>
              </div>
            </div>
          ) : (
            /* Production: Show subtle info about pet customization */
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  🐾 Your pet is ready for adventure! Complete typing tests to help it grow and evolve.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {!selectedMode || !selectedSubcategory || modes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading typing modes...</p>
            </div>
          </div>
        ) : (
          <ModeSelector
            selectedMode={selectedMode}
            selectedSubcategory={selectedSubcategory}
            onModeSelect={handleModeSelect}
            modes={modes}
          />
        )}

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
              <p className="text-blue-600 text-sm">
                Difficulty: {currentSubcategory.difficulty}
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="mb-4">
            <label className="flex items-center justify-center space-x-2">
              <input
                type="checkbox"
                checked={showKeyboard}
                onChange={(e) => setShowKeyboard(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Virtual Keyboard</span>
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={startTest}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Typing Test
            </button>
            
            <button
              onClick={startPetTrainingTest}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              🐾 Pet Training Test
            </button>
          </div>
          
          {/* Pet Training Info */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-purple-700">
              <strong>🐾 Pet Training Test:</strong> Special test that gives your pet bonus experience and happiness!
            </p>
          </div>
          
          {/* Sync Status */}
          {syncStatus && (
            <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{syncStatus}</p>
            </div>
          )}
          

        </div>
      </div>
    );
  }

  if (testResult) {
    return (
      <div className="flex-1 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {testResult.testId === 'pet-training-special' ? '🐾 Pet Training Complete!' : 'Test Complete!'}
            </h2>
            
            {testResult.testId === 'pet-training-special' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <p className="text-purple-700 text-center font-medium">
                  🎉 Your pet gained bonus experience and happiness from this special training session!
                </p>
              </div>
            )}
            
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

          {/* Pet Display */}
          <div className="flex justify-center">
            <Pet key={petKey} onPetInteraction={handlePetInteraction} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto">
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
