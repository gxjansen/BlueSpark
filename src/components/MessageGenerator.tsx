import React, { useState } from 'react';
import { RefreshCw, Send, Edit2, Tag, MessageCircle } from 'lucide-react';
import { useStore } from '../lib/store';
import { AIService } from '../lib/ai';
import { BlueSkyService } from '../lib/services/bluesky-facade';
import { ContentAnalyzer } from '../lib/analysis';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { TopicTagList } from './shared/TopicTag';
import { ErrorState } from './shared/ErrorState';
import toast from 'react-hot-toast';

const MAX_CHARS = 300;

interface MessageGeneratorProps {
  followerHandle: string;
}

export function MessageGenerator({ followerHandle }: MessageGeneratorProps) {
  const {
    userProfile,
    followers,
    messages,
    profileAnalysis,
    isAuthenticated,
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
  const [isPosted, setIsPosted] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setEditedMessage(text);
    }
  };

  const currentMessage = isEditing ? editedMessage : messageState.message || '';
  const remainingChars = MAX_CHARS - currentMessage.length;

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
    if (!isAuthenticated) {
      toast.error('Please log in to generate messages');
      return;
    }

    setGenerating(followerHandle, true);
    setError(followerHandle, null);
    setIsEditing(false);
    setPostError(null);

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
    if (!isAuthenticated) {
      toast.error('Please log in to post messages');
      return;
    }

    const messageToPost = isEditing ? editedMessage : messageState.message;
    if (!messageToPost?.trim()) {
      toast.error('No message to post');
      return;
    }

    // Reset any previous errors
    setPostError(null);

    try {
      const bluesky = BlueSkyService.getInstance();
      await bluesky.createPost(messageToPost);
      setIsPosted(true);
      toast.success('Welcome message posted successfully!');
    } catch (error) {
      console.error('Post error:', error);
      
      // Handle specific BlueSky errors
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Check for DID validation error
        if (errorMessage.includes('Record/facets') && errorMessage.includes('did must be a valid did')) {
          setPostError('Unable to post message: The message contains an invalid user mention. Please try editing the message to fix any @mentions.');
        } else {
          setPostError('Unable to post message to BlueSky. Please try again or edit the message.');
        }
      } else {
        setPostError('An unexpected error occurred while posting. Please try again.');
      }
    }
  };

  if (isPosted) {
    return (
      <div className="mt-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <p className="text-sm text-green-400">Welcome message posted successfully! 🎉</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Common Topics */}
      {commonTopics.length > 0 && !isLoadingTopics && (
        <div className="mb-3">
          <div className="flex items-center mb-2">
            <Tag className="w-4 h-4 mr-1 text-blue-400" />
            <span className="text-sm text-gray-300">
              Click any of these shared interests to refine the message:
            </span>
          </div>
          <TopicTagList
            topics={commonTopics}
            selectedTopic={selectedTopic}
            onTopicClick={(topic) => {
              setSelectedTopic(topic);
              generateMessage(topic);
            }}
          />
        </div>
      )}

      {isLoadingTopics && (
        <div className="mb-3 text-sm text-gray-400 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Finding common topics...
        </div>
      )}

      {postError && (
        <div className="mb-4">
          <ErrorState message={postError} />
        </div>
      )}

      {(messageState.message || isEditing) && (
        <Card className="space-y-6">
          <div className="space-y-2">
            {isEditing ? (
              <>
                <textarea
                  value={editedMessage}
                  onChange={handleMessageChange}
                  maxLength={MAX_CHARS}
                  className="w-full p-2 bg-[#323e4e] border border-[#3b4758] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] text-gray-100"
                  placeholder="Edit your welcome message..."
                />
                <div className="text-right">
                  <span className={`text-xs ${remainingChars < 50 ? 'text-amber-400' : 'text-gray-500'}`}>
                    {remainingChars} characters remaining
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-300">{messageState.message}</p>
                <div className="text-right">
                  <span className={`text-xs ${remainingChars < 50 ? 'text-amber-400' : 'text-gray-500'}`}>
                    {remainingChars} characters remaining
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => generateMessage(selectedTopic || undefined)}
              isLoading={messageState.isGenerating}
            >
              {messageState.isGenerating ? 'Generating...' : 'Regenerate'}
            </Button>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEditedMessage(messageState.message || '');
                  setIsEditing(true);
                }}
              >
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={Send}
              onClick={postMessage}
              disabled={messageState.isGenerating}
              className="text-blue-400 hover:text-blue-300"
            >
              Post
            </Button>
          </div>
        </Card>
      )}
      
      {!messageState.message && !messageState.isGenerating && !isEditing && !isLoadingTopics && (
        <Button
          variant="secondary"
          size="sm"
          icon={MessageCircle}
          onClick={() => generateMessage()}
          className="text-blue-400 hover:text-blue-300"
        >
          Generate welcome message
        </Button>
      )}

      {messageState.error && (
        <div className="mt-4">
          <ErrorState message={messageState.error} />
        </div>
      )}
    </div>
  );
}
