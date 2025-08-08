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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up your typing session...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Content */}
          {currentPage === 'test' ? <TestPage /> : <ProfilePage />}
        </div>
      </div>
    </Layout>
  );
}

export default App
