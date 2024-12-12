import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { RateLimitError } from '../../lib/utils/error-handling';

export function LoginFormFields() {
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
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
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
          You can enter your handle with or without "@"
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
  );
}
