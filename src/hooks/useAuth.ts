import { useCallback } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/services/bluesky-facade';
import { BlueSkyCredentials } from '../types/bluesky';
import toast from 'react-hot-toast';

export function useAuth() {
  const { 
    credentials,
    isAuthenticated,
    isAutoLogging,
    setCredentials,
    setAutoLogging,
    logout,
    resetPosts,
    resetApiStats
  } = useStore();

  const handleLogin = useCallback(async (identifier: string, password: string) => {
    try {
      const bluesky = BlueSkyService.getInstance();
      await bluesky.login(identifier, password);
      setCredentials({ identifier, password });
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      toast.error(message);
      return false;
    }
  }, [setCredentials]);

  const handleAutoLogin = useCallback(async (storedCredentials: BlueSkyCredentials) => {
    if (!storedCredentials || isAuthenticated || isAutoLogging) return false;

    setAutoLogging(true);
    try {
      const bluesky = BlueSkyService.getInstance();
      await bluesky.resumeSession(storedCredentials);
      setCredentials(storedCredentials);
      return true;
    } catch (error) {
      console.error('Auto-login failed:', error);
      toast.error('Stored login expired. Please log in again.');
      handleLogout();
      return false;
    } finally {
      setAutoLogging(false);
    }
  }, [isAuthenticated, isAutoLogging, setAutoLogging, setCredentials]);

  const handleLogout = useCallback(() => {
    logout();
    resetPosts();
    resetApiStats();
  }, [logout, resetPosts, resetApiStats]);

  return {
    credentials,
    isAuthenticated,
    isAutoLogging,
    login: handleLogin,
    autoLogin: handleAutoLogin,
    logout: handleLogout
  };
}
