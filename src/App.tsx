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
    <div className="min-h-screen bg-[#1a2028] flex flex-col">
      <div className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <img 
                src="/logo-white.svg" 
                alt="BlueSpark Logo" 
                className="w-10 h-10 mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-100">BlueSpark</h1>
            </div>
            <button
              onClick={() => useStore.getState().logout()}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100"
            >
              Log out
            </button>
          </div>
          
          <div className="flex gap-6">
            {/* Left Column - User Profile & Settings */}
            <div className="flex-none">
              <UserProfile />
            </div>

            {/* Right Column - Follower List */}
            <div className="flex-1">
              <FollowerList />
            </div>
          </div>
        </div>
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
