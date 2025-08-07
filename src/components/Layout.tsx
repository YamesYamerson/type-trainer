import React from 'react';
import { useUser } from '../hooks/useUser';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-100">
      {showHeader && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Typing Trainer
                </h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Beta
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="hidden md:flex items-center space-x-4">
                  <span>Keyboard-first typing practice</span>
                  <span>•</span>
                  <span>Multiple modes</span>
                  <span>•</span>
                  <span>Real-time feedback</span>
                </div>
                
                {user && (
                  <div className="flex items-center space-x-2">
                    <span>•</span>
                    <span className="text-blue-600 font-medium">
                      Welcome, {user.name}!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>Built with React, TypeScript, and Tailwind CSS</p>
            <p className="mt-1">Follows the master protocol for solo developers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
