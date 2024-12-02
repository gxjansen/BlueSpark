import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { ContentAnalyzer } from '../lib/analysis';
import { WelcomeMessageSettings } from '../types/bluesky';
import { ApiStats } from './ApiStats';

// Function to sanitize user input
const sanitizeInput = (input: string): string => {
  // Remove any HTML tags
  const noHtml = input.replace(/<[^>]*>/g, '');
  
  // Remove any script-like content
  const noScript = noHtml.replace(/javascript:/gi, '')
                        .replace(/data:/gi, '')
                        .replace(/vbscript:/gi, '')
                        .replace(/onclick/gi, '')
                        .replace(/onerror/gi, '')
                        .replace(/onload/gi, '');
  
  // Remove special characters that could be used maliciously
  const clean = noScript.replace(/[<>{}]/g, '')
                       .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
  // Limit to 200 characters
  return clean.slice(0, 200);
};

interface ToneOption {
  value: WelcomeMessageSettings['toneOfVoice'];
  label: string;
  description: string;
}

const toneOptions: ToneOption[] = [
  {
    value: 'warm',
    label: 'Warm',
    description: 'Welcoming and sincere'
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Polite and business-like'
  },
  {
    value: 'humorous',
    label: 'Humorous',
    description: 'Light-hearted and fun'
  },
  {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Energetic and excited'
  }
];

export function UserProfile() {
  const {
    userProfile,
    profileAnalysis,
    welcomeSettings,
    isAnalyzing,
    setProfileAnalysis,
    setIsAnalyzing,
    updateWelcomeSettings
  } = useStore();

  useEffect(() => {
    if (userProfile && !profileAnalysis && !isAnalyzing) {
      analyzeProfile();
    }
  }, [userProfile, profileAnalysis, isAnalyzing]);

  const analyzeProfile = async () => {
    if (!userProfile) return;

    setIsAnalyzing(true);
    try {
      const analysis = await ContentAnalyzer.analyzeUserProfile(userProfile);
      setProfileAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze profile:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToneChange = (tone: WelcomeMessageSettings['toneOfVoice']) => {
    updateWelcomeSettings({ toneOfVoice: tone });
  };

  const handleCustomPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitized = sanitizeInput(event.target.value);
    updateWelcomeSettings({ customPrompt: sanitized });
  };

  if (!userProfile) {
    return null;
  }

  const remainingChars = 200 - (welcomeSettings.customPrompt?.length || 0);

  return (
    <div className="w-80 space-y-4">
      {/* API Stats Box */}
      <ApiStats />

      {/* User Profile Box */}
      <div className="bg-[#242c38] rounded-lg shadow-md p-4 space-y-6 border border-[#2a3441]">
        {/* User Profile Header */}
        <div className="flex items-center space-x-3">
          {userProfile.avatar ? (
            <img
              src={userProfile.avatar}
              alt={userProfile.displayName || userProfile.handle}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#2a3441] flex items-center justify-center">
              <span className="text-blue-400 text-lg">
                {(userProfile.displayName || userProfile.handle)[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-100">{userProfile.displayName}</h2>
            <p className="text-sm text-gray-400">@{userProfile.handle}</p>
          </div>
        </div>

        {/* Profile Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">Profile Analysis</h3>
            <button
              onClick={analyzeProfile}
              disabled={isAnalyzing}
              className="text-blue-400 hover:text-blue-300"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {isAnalyzing ? (
            <p className="text-sm text-gray-400">Analyzing your profile...</p>
          ) : profileAnalysis ? (
            <div className="text-sm space-y-2">
              <p className="text-gray-300">{profileAnalysis.summary}</p>
              <div className="space-y-1">
                <p className="text-gray-400">Main topics:</p>
                <div className="flex flex-wrap gap-1">
                  {profileAnalysis.mainTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[#2a3441] text-blue-400 rounded-full text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Last updated: {new Date(profileAnalysis.lastUpdated).toLocaleString()}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Welcome Message Settings Box */}
      <div className="bg-[#242c38] rounded-lg shadow-md p-4 space-y-4 border border-[#2a3441]">
        <h3 className="text-lg font-semibold text-gray-100">Welcome Message Settings</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Tone of Voice</label>
            <div className="grid grid-cols-2 gap-2">
              {toneOptions.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => handleToneChange(tone.value)}
                  className={`group relative px-3 py-2 text-sm rounded-md capitalize ${
                    welcomeSettings.toneOfVoice === tone.value
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-[#2a3441] text-gray-300 hover:bg-[#323e4e]'
                  }`}
                >
                  {tone.label}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-[#2a3441] text-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[#323e4e]">
                    {tone.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="customPrompt" className="text-sm font-medium text-gray-300">
              Additional Instructions
            </label>
            <textarea
              id="customPrompt"
              value={welcomeSettings.customPrompt}
              onChange={handleCustomPromptChange}
              maxLength={200}
              placeholder="Add any specific instructions for generating welcome messages..."
              className="w-full h-24 px-3 py-2 text-sm bg-[#2a3441] border border-[#323e4e] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-100 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 text-right">
              {remainingChars} characters remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
