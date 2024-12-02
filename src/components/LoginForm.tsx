import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/bluesky';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const setCredentials = useStore((state) => state.setCredentials);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const service = BlueSkyService.getInstance();
      await service.login(identifier, password);
      setCredentials({ identifier, password });
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-8">
        <LogIn className="w-8 h-8 text-blue-500" />
        <h2 className="ml-2 text-2xl font-bold text-gray-800">BlueSpark Login</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            BlueSky Handle
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="@handle.bsky.social"
              required
            />
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            App Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Your App Password"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}