import React, { useEffect } from 'react';
import { useStore } from './lib/store';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { FollowerList } from './components/FollowerList';
import { UserProfile } from './components/UserProfile';
import { Loader } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isAutoLogging } = useStore();
  const { autoLogin, credentials } = useAuth();

  // Attempt auto-login on mount if we have stored credentials
  useEffect(() => {
    if (credentials) {
      autoLogin(credentials);
    }
  }, [autoLogin, credentials]);

  // Show loading state during auto-login
  if (isAutoLogging) {
    return (
      <div className="min-h-screen bg-[#1a2028] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Resuming session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a2028] flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <LoginForm />
        </div>
        <footer className="p-4 text-center text-sm text-gray-400">
          Made by{' '}
          <a 
            href="https://bsky.app/profile/gui.do" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Guido X Jansen
          </a>
          {' | '}
          <a 
            href="https://www.gui.do/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            gui.do
          </a>
          {' | '}
          <a 
            href="https://github.com/gxjansen/BlueSpark/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Feedback & Issues
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2028]">
      {/* Header */}
      <header className="bg-[#242c38] border-b border-[#2a3441] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo-blue.svg" 
              alt="BlueSpark Logo" 
              className="w-8 h-8 mr-3"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-100">BlueSpark</h1>
              <span className="font-['Caveat'] text-blue-400 -rotate-6 text-lg">Beta</span>
            </div>
          </div>
          <button
            onClick={() => useStore.getState().logout()}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-gray-100 bg-[#2a3441] rounded-md"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <UserProfile />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <FollowerList />
          </div>
        </div>
      </div>
    </div>
  );
}
