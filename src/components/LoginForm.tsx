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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter your username and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sanitize the identifier by removing any @ symbol from the start
      const sanitizedIdentifier = identifier.replace(/^@/, '');
      await login(sanitizedIdentifier, password);
    } catch (error) {
      if (error instanceof RateLimitError) {
        setError(error.message);
      } else {
        const message = error instanceof Error ? error.message : 'Failed to login';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center mb-4">
            <img 
              src="/logo-blue.svg" 
              alt="BlueSpark Logo" 
              className="w-12 h-12 mr-4"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-100">BlueSpark</h1>
              <span className="font-['Caveat'] text-blue-400 -rotate-6 text-2xl">Beta</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm italic text-center">
            "Starting a conversation can be hard.<br/> So I created BlueSpark to help break the ice!"
          </p>
        </div>

        <div className="mb-8 space-y-4 text-gray-300">
          <p>
          Welcome each new follower with a personal icebreaking message. By finding what you have in common, it helps you start discussions that both of you will enjoy – turning simple follows into real connections on BlueSky.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="mr-2">1️⃣</span>
              <span>Login with your BlueSky credentials and automatically detect new followers.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2️⃣</span>
              <span>Use AI to scan profiles & latest messages to find common interests and topics.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3️⃣</span>
              <span>Generate a personalized message, customize it and post it!</span>
            </li>
          </ul>
          <p>It's that simple!</p><p>And no worries, we <strong>never post anything automatically</strong>, only when you click the "Post" button.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-[#2a3441] border border-[#3b4758] rounded-md text-gray-100 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="username.bsky.social"
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-400">
              You can enter your handle with or without "@" (e.g., "username.bsky.social" or "@username.bsky.social")
            </p>
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
              className="mt-1 block w-full px-3 py-2 bg-[#2a3441] border border-[#3b4758] rounded-md text-gray-100 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-400">
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

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white
              bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
