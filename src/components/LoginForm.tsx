import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/bluesky';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setCredentials } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const bluesky = BlueSkyService.getInstance();
      await bluesky.login(identifier, password);
      setCredentials({ identifier, password });
      toast.success('Logged in successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#242c38] rounded-lg shadow-md p-8 border border-[#2a3441]">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.svg" alt="BlueSpark Logo" className="w-12 h-12" />
          <h1 className="ml-4 text-2xl font-bold text-gray-100">BlueSpark</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-1">
              BlueSky Handle or Email
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a3441] border border-[#323e4e] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-100 placeholder-gray-500"
              placeholder="e.g., you.bsky.social"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              App Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a3441] border border-[#323e4e] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-100 placeholder-gray-500"
              placeholder="Your BlueSky app password"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              Create an app password at{' '}
              <a
                href="https://bsky.app/settings/app-passwords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                bsky.app/settings/app-passwords
              </a>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#242c38] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
