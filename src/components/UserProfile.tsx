import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { ContentAnalyzer } from '../lib/analysis';
import { WelcomeMessageSettings } from '../types/bluesky';

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
    updateWelcomeSettings({ customPrompt: event.target.value });
  };

  if (!userProfile) {
    return null;
  }

  return (
    <div className="w-80 space-y-4">
      {/* User Profile Box */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
        {/* User Profile Header */}
        <div className="flex items-center space-x-3">
          {userProfile.avatar ? (
            <img
              src={userProfile.avatar}
              alt={userProfile.displayName || userProfile.handle}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-lg">
                {(userProfile.displayName || userProfile.handle)[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-semibold">{userProfile.displayName}</h2>
            <p className="text-sm text-gray-600">@{userProfile.handle}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Profile Analysis</h3>
          <button
            onClick={analyzeProfile}
            disabled={isAnalyzing}
            className="text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {isAnalyzing ? (
          <p className="text-sm text-gray-600">Analyzing your profile...</p>
        ) : profileAnalysis ? (
          <div className="text-sm space-y-2">
            <p className="text-gray-700">{profileAnalysis.summary}</p>
            <div className="space-y-1">
              <p className="text-gray-600">Main topics:</p>
              <div className="flex flex-wrap gap-1">
                {profileAnalysis.mainTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
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

      {/* Welcome Message Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Welcome Message Settings</h3>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Tone of Voice</label>
          <div className="grid grid-cols-2 gap-2">
            {(['friendly', 'professional', 'casual', 'enthusiastic'] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => handleToneChange(tone)}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  welcomeSettings.toneOfVoice === tone
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="customPrompt" className="text-sm text-gray-600">
            Additional Instructions
          </label>
          <textarea
            id="customPrompt"
            value={welcomeSettings.customPrompt}
            onChange={handleCustomPromptChange}
            placeholder="Add any specific instructions for generating welcome messages..."
            className="w-full h-24 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
