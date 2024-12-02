import React, { useEffect } from 'react';
import { useStore } from './lib/store';
import { LoginForm } from './components/LoginForm';
import { FollowerList } from './components/FollowerList';
import { UserProfile } from './components/UserProfile';
import { BlueSkyService } from './lib/services/bluesky-facade';
import { Loader } from 'lucide-react';
import { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';
import toast from 'react-hot-toast';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostRecord = AppBskyFeedPost.Record;

function App() {
  const { 
    isAuthenticated, 
    credentials, 
    isAutoLogging,
    setCredentials, 
    setAutoLogging,
    logout,
    setUserProfile
  } = useStore();

  // Attempt automatic login if we have stored credentials
  useEffect(() => {
    async function autoLogin() {
      if (credentials && !isAuthenticated && !isAutoLogging) {
        setAutoLogging(true);
        try {
          const bluesky = BlueSkyService.getInstance();
          const session = await bluesky.resumeSession(credentials);
          setCredentials(credentials); // Re-set to trigger state update
          
          // Load user profile after successful login
          const profile = await bluesky.getProfile(credentials.identifier);
          const posts = await bluesky.getUserPosts(profile.did);
          
          setUserProfile({
            did: profile.did,
            handle: profile.handle,
            displayName: profile.displayName || profile.handle,
            description: profile.description || '',
            avatar: profile.avatar,
            posts: posts.map((post: FeedViewPost) => ({
              text: (post.post.record as PostRecord).text,
              createdAt: (post.post.record as PostRecord).createdAt
            })),
            followersCount: profile.followersCount || 0,
            followsCount: profile.followsCount || 0,
            postsCount: profile.postsCount || 0,
            joinedAt: posts[0] ? (posts[0].post.record as PostRecord).createdAt : new Date().toISOString(),
            lastPostedAt: posts[0] ? (posts[0].post.record as PostRecord).createdAt : undefined
          });
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
  }, [credentials, isAuthenticated, isAutoLogging, setCredentials, setAutoLogging, logout, setUserProfile]);

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
                src="/logo.svg" 
                alt="BlueSpark Logo" 
                className="w-10 h-10 mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-100">BlueSpark</h1>
            </div>
            <button
              onClick={logout}
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

export default App;
