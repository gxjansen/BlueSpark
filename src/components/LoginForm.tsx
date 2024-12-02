import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Card } from './shared/Card';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { RateLimitError } from '../lib/utils/error-handling';

export function LoginForm() {
  const login = useStore((state) => state.login);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter your username and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password);
    } catch (error) {
      if (error instanceof RateLimitError) {
        toast.error(error.message, {
          duration: 5000, // Show longer for rate limit errors
          icon: '⏳'
        });
      } else {
        const message = error instanceof Error ? error.message : 'Failed to login';
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2028] border-[#2a3441]">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-center mb-10">
          <img 
            src="/logo-white.svg" 
            alt="BlueSpark Logo" 
            className="w-16 h-16 mr-4"
          />
          <h1 className="text-4xl font-bold text-gray-100">BlueSpark</h1>
        </div>

        <div className="mb-10 space-y-6 text-gray-300">
          <p className="text-xl text-center font-medium">
            Welcome to BlueSpark!
          </p>
          <p className="text-lg text-center text-gray-400">
            A tool to help you engage with your new Bluesky followers:
          </p>
          <ul className="space-y-4 max-w-sm mx-auto">
            <li className="flex items-center">
              <span className="text-2xl mr-4">👋</span>
              <span className="text-lg">Automatically detect new followers</span>
            </li>
            <li className="flex items-center">
              <span className="text-2xl mr-4">💬</span>
              <span className="text-lg">Generate personalized welcome messages</span>
            </li>
            <li className="flex items-center">
              <span className="text-2xl mr-4">🎯</span>
              <span className="text-lg">Include shared interests in conversations</span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#242c38] p-6 rounded-lg border border-[#2a3441]">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300">
              Username or Email
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-2 block w-full px-4 py-3 bg-[#2a3441] border border-[#3b4758] rounded-md text-gray-100 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="username.bsky.social"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              App Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full px-4 py-3 bg-[#2a3441] border border-[#3b4758] rounded-md text-gray-100 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              disabled={isLoading}
            />
            <p className="mt-3 text-sm text-gray-400">
              Create an app password at{' '}
              <a
                href="https://bsky.app/settings/app-passwords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                bsky.app/settings/app-passwords
              </a>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white
              bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 mt-8"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Logging in...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>
      </div>
    </Card>
  );
}
