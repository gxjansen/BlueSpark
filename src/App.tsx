import React from 'react';
import { useStore } from './lib/store';
import { LoginForm } from './components/LoginForm';
import { FollowerList } from './components/FollowerList';
import { UserProfile } from './components/UserProfile';

function App() {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <img 
            src="/logo.svg" 
            alt="BlueSpark Logo" 
            className="w-10 h-10 mr-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">BlueSpark</h1>
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
  );
}

export default App;
