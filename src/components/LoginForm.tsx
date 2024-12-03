import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Card } from './shared/Card';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { RateLimitError } from '../lib/utils/error-handling';
import { SocialProof } from './SocialProof';

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
    <div className="space-y-6">
      <Card className="w-[95%] md:w-auto p-4 md:p-6">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl mx-auto">
          {/* Left Column - Logo and Login Form */}
          <div className="flex flex-col">
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div className="flex items-center mb-4">
                <img 
                  src="/logo-blue.svg" 
                  alt="BlueSpark Logo" 
                  className="w-10 h-10 md:w-12 md:h-12 mr-3 md:mr-4"
                />
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-100">BlueSpark</h1>
                  <span className="font-['Caveat'] text-blue-400 -rotate-6 text-xl md:text-2xl">Beta</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm italic text-center">
                "Starting a conversation can be hard.<br/>
                So I created BlueSpark to help break the ice!"
              </p>
            </div>

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
          </div>

          {/* Right Column - Features and Description */}
          <div className="space-y-5 md:space-y-6 text-gray-300 md:border-l md:border-[#3b4758] md:pl-8 pt-6 md:pt-0 border-t border-[#3b4758] md:border-t-0">
            <p className="text-sm md:text-base">
              Welcome each new follower with a personal icebreaking message. By finding what you have in common, it helps you start discussions that both of you will enjoy – turning simple follows into real connections on BlueSky.
            </p>
            <div className="space-y-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-100">How it works</h2>
              <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
                <li className="flex items-start">
                  <span className="mr-3 text-xl">1️⃣</span>
                  <span>Login with your BlueSky credentials and automatically detect new followers.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">2️⃣</span>
                  <span>Use AI to scan profiles & latest messages to find common interests and topics.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">3️⃣</span>
                  <span>Generate a personalized message, customize it and post it!</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-[#3b4758] text-sm md:text-base">
              <p className="text-gray-300">It's that simple!</p>
              <p className="mt-2">And no worries, we <strong>never post anything automatically</strong>, only when you click the "Post" button.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Social Proof Section */}
      <SocialProof />
    </div>
  );
}
