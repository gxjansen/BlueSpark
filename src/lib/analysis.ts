import { FollowerProfile, ProfileAnalysis } from '../types/bluesky';
import { AIService } from './ai';

export class ContentAnalyzer {
  static async generateConversationStarter(
    userProfile: FollowerProfile,
    followerProfile: FollowerProfile
  ): Promise<string> {
    return AIService.generateMessage(userProfile, followerProfile);
  }

  static async analyzeUserProfile(userProfile: FollowerProfile): Promise<ProfileAnalysis> {
    try {
      const analysis = await AIService.analyzeProfile(userProfile);
      return {
        ...analysis,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing profile:', error);
      throw new Error('Failed to analyze profile');
    }
  }
}
