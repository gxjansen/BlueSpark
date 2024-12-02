import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/bluesky';
import { MessageCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const setCredentials = useStore((state) => state.setCredentials);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Remove @ if present at the start of the handle
      const cleanHandle = identifier.startsWith('@') ? identifier.slice(1) : identifier;
      
      const service = BlueSkyService.getInstance();
      await service.login(cleanHandle, password);
      setCredentials({ identifier: cleanHandle, password });
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="w-full max-w-2xl p-8">
      {/* Tool Introduction */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to BlueSpark</h1>
        <p className="text-lg text-gray-600 mb-6">
          Create personalized welcome messages for your new BlueSky followers using AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Why Use BlueSpark?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <MessageCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">AI-Powered Messages</h3>
                <p className="text-gray-600 text-sm">
                  Generate engaging welcome messages based on shared interests and conversation topics
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MessageCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">Personalized Engagement</h3>
                <p className="text-gray-600 text-sm">
                  Start meaningful conversations with new followers by highlighting common interests
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">Build Better Connections</h3>
                <p className="text-gray-600 text-sm">
                  Create authentic relationships by engaging with followers in a personal way
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BlueSky Handle
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="handle.bsky.social"
                  required
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Your handle with or without @ (e.g. handle.bsky.social)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Your App Password"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
