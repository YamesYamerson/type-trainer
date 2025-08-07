import { useState } from 'react'
import { TestPage } from './pages/TestPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginForm } from './components/LoginForm'
import { Layout } from './components/Layout'
import { useUser } from './hooks/useUser'

function App() {
  const { user, isLoading, login } = useUser();
  const [currentPage, setCurrentPage] = useState<'test' | 'profile'>('test');

  if (isLoading) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <LoginForm onLogin={login} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage('test')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentPage === 'test'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Practice
                </button>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentPage === 'profile'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Profile
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          {currentPage === 'test' ? <TestPage /> : <ProfilePage />}
        </div>
      </div>
    </Layout>
  );
}

export default App
