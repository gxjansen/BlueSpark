import React from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { useStore } from '../lib/store';
import { AIService } from '../lib/ai';
import { BlueSkyService } from '../lib/bluesky';
import toast from 'react-hot-toast';

interface MessageGeneratorProps {
  followerHandle: string;
}

export function MessageGenerator({ followerHandle }: MessageGeneratorProps) {
  const {
    userProfile,
    followers,
    messages,
    welcomeSettings,
    setMessage,
    setGenerating,
    setError
  } = useStore();
  const messageState = messages[followerHandle] || { message: '', isGenerating: false, error: null };

  const generateMessage = async () => {
    setGenerating(followerHandle, true);
    setError(followerHandle, null);

    try {
      // Verify we have the required data
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const followerProfile = followers.find(f => f.handle === followerHandle);
      if (!followerProfile) {
        throw new Error('Follower profile not found');
      }

      // Log data being sent to AI service for debugging
      console.log('Generating message for:', {
        userProfile: {
          handle: userProfile.handle,
          displayName: userProfile.displayName,
          description: userProfile.description,
          postCount: userProfile.posts?.length
        },
        followerProfile: {
          handle: followerProfile.handle,
          displayName: followerProfile.displayName,
          description: followerProfile.description,
          postCount: followerProfile.posts?.length
        },
        welcomeSettings
      });

      const message = await AIService.generateMessage(userProfile, followerProfile, welcomeSettings);
      if (!message) {
        throw new Error('No message was generated');
      }
      setMessage(followerHandle, message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Message generation error:', error);
      setError(followerHandle, errorMessage);
      toast.error(errorMessage);
    } finally {
      setGenerating(followerHandle, false);
    }
  };

  const postMessage = async () => {
    if (!messageState.message) {
      toast.error('No message to post');
      return;
    }

    try {
      const bluesky = BlueSkyService.getInstance();
      if (!bluesky.isAuthenticated()) {
        throw new Error('Not authenticated. Please log in again.');
      }

      await bluesky.createPost(messageState.message);
      toast.success('Message posted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post message';
      console.error('Post error:', error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="mt-4">
      {messageState.message && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-800">{messageState.message}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={generateMessage}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              disabled={messageState.isGenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${messageState.isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
            <button
              onClick={postMessage}
              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              disabled={messageState.isGenerating}
            >
              <Send className="w-4 h-4 mr-1" />
              Post
            </button>
          </div>
        </div>
      )}
      
      {!messageState.message && !messageState.isGenerating && (
        <button
          onClick={generateMessage}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Generate welcome message
        </button>
      )}

      {messageState.isGenerating && (
        <div className="text-sm text-gray-600 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Generating message...
        </div>
      )}

      {messageState.error && (
        <div className="text-sm text-red-600 mt-2">
          Error: {messageState.error}
        </div>
      )}
    </div>
  );
}
