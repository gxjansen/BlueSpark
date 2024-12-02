import React, { useEffect } from 'react';
import { useStore } from './lib/store';
import { LoginForm } from './components/LoginForm';
import { FollowerList } from './components/FollowerList';
import { UserProfile } from './components/UserProfile';
import { BlueSkyService } from './lib/bluesky';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function App() {
  const { 
    isAuthenticated, 
    credentials, 
    isAutoLogging,
    setCredentials, 
    setAutoLogging,
    logout 
  } = useStore();

  // Attempt automatic login if we have stored credentials
  useEffect(() => {
    async function autoLogin() {
      if (credentials && !isAuthenticated && !isAutoLogging) {
        setAutoLogging(true);
        try {
          const service = BlueSkyService.getInstance();
          await service.resumeSession(credentials);
          setCredentials(credentials); // Re-set to trigger state update
        } catch (error) {
          console.error('Auto-login failed:', error);
          toast.error('Stored login expired. Please log in again.');
          logout(); // Clear invalid credentials
        } finally {
          setAutoLogging(false);
        }
      }
    }

    autoLogin();
  }, [credentials, isAuthenticated, isAutoLogging, setCredentials, setAutoLogging, logout]);

  // Show loading state during auto-login
  if (isAutoLogging) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Resuming session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <LoginForm />
        </div>
        <footer className="p-4 text-center text-sm text-gray-500">
          Made by{' '}
          <a 
            href="https://bsky.app/profile/gui.do" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Guido X Jansen
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="BlueSpark Logo" 
                className="w-10 h-10 mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">BlueSpark</h1>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
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

      <footer className="p-4 text-center text-sm text-gray-500">
        Made by{' '}
        <a 
          href="https://bsky.app/profile/gui.do" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          Guido X Jansen
        </a>
      </footer>
    </div>
  );
}

export default App;
