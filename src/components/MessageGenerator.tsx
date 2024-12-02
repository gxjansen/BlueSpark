import React, { useState } from 'react';
import { RefreshCw, Send, Edit2, Tag } from 'lucide-react';
import { useStore } from '../lib/store';
import { AIService } from '../lib/ai';
import { BlueSkyService } from '../lib/bluesky';
import { ContentAnalyzer } from '../lib/analysis';
import toast from 'react-hot-toast';

interface MessageGeneratorProps {
  followerHandle: string;
}

export function MessageGenerator({ followerHandle }: MessageGeneratorProps) {
  const {
    userProfile,
    followers,
    messages,
    profileAnalysis,
    setMessage,
    setGenerating,
    setError
  } = useStore();
  
  const messageState = messages[followerHandle] || { message: '', isGenerating: false, error: null };
  const [editedMessage, setEditedMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [commonTopics, setCommonTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isInitialGeneration, setIsInitialGeneration] = useState(true);

  const loadCommonTopics = async () => {
    if (userProfile && followers) {
      const followerProfile = followers.find(f => f.handle === followerHandle);
      if (followerProfile) {
        setIsLoadingTopics(true);
        try {
          const topics = await ContentAnalyzer.findCommonTopics(
            userProfile,
            followerProfile,
            profileAnalysis || undefined
          );
          setCommonTopics(topics);
        } catch (error) {
          console.error('Failed to load common topics:', error);
        } finally {
          setIsLoadingTopics(false);
        }
      }
    }
  };

  const generateMessage = async (topic?: string) => {
    setGenerating(followerHandle, true);
    setError(followerHandle, null);
    setIsEditing(false);

    try {
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const followerProfile = followers.find(f => f.handle === followerHandle);
      if (!followerProfile) {
        throw new Error('Follower profile not found');
      }

      let message;
      if (topic) {
        message = await ContentAnalyzer.generateTopicBasedMessage(
          userProfile,
          followerProfile,
          topic
        );
      } else {
        if (isInitialGeneration) {
          setIsLoadingTopics(true);
          setIsInitialGeneration(false);
        }

        message = await AIService.generateMessage(userProfile, followerProfile);
        
        if (isInitialGeneration) {
          await loadCommonTopics();
        }
      }

      if (!message) {
        throw new Error('No message was generated');
      }
      setMessage(followerHandle, message);
      setEditedMessage(message);
      setIsEditing(true);
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
    const messageToPost = isEditing ? editedMessage : messageState.message;
    if (!messageToPost.trim()) {
      toast.error('No message to post');
      return;
    }

    try {
      const bluesky = BlueSkyService.getInstance();
      if (!bluesky.isAuthenticated()) {
        throw new Error('Not authenticated. Please log in again.');
      }

      await bluesky.createPost(messageToPost);
      toast.success('Message posted successfully!');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post message';
      console.error('Post error:', error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="mt-4">
      {/* Common Topics */}
      {commonTopics.length > 0 && !isLoadingTopics && (
        <div className="mb-3">
          <div className="flex items-center mb-2">
            <Tag className="w-4 h-4 mr-1 text-blue-400" />
            <span className="text-sm text-gray-300">Click any of these shared interests to refine the message:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  generateMessage(topic);
                }}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedTopic === topic
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-[#2a3441] text-gray-300 hover:bg-[#323e4e]'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoadingTopics && (
        <div className="mb-3 text-sm text-gray-400 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Finding common topics...
        </div>
      )}

      {(messageState.message || isEditing) && (
        <div className="bg-[#2a3441] p-4 rounded-lg shadow-sm space-y-3 border border-[#323e4e]">
          {isEditing ? (
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full p-2 bg-[#323e4e] border border-[#3b4758] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] text-gray-100"
              placeholder="Edit your welcome message..."
            />
          ) : (
            <p className="text-gray-300">{messageState.message}</p>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => generateMessage(selectedTopic || undefined)}
              className="flex items-center px-3 py-1 text-sm text-gray-300 hover:text-gray-100"
              disabled={messageState.isGenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${messageState.isGenerating ? 'animate-spin' : ''}`} />
              {messageState.isGenerating ? 'Generating...' : 'Regenerate'}
            </button>
            {!isEditing && (
              <button
                onClick={() => {
                  setEditedMessage(messageState.message);
                  setIsEditing(true);
                }}
                className="flex items-center px-3 py-1 text-sm text-gray-300 hover:text-gray-100"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
            <button
              onClick={postMessage}
              className="flex items-center px-3 py-1 text-sm text-blue-400 hover:text-blue-300"
              disabled={messageState.isGenerating}
            >
              <Send className="w-4 h-4 mr-1" />
              Post
            </button>
          </div>
        </div>
      )}
      
      {!messageState.message && !messageState.isGenerating && !isEditing && !isLoadingTopics && (
        <button
          onClick={() => generateMessage()}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Generate welcome message
        </button>
      )}

      {messageState.error && (
        <div className="text-sm text-red-400 mt-2">
          Error: {messageState.error}
        </div>
      )}
    </div>
  );
}
