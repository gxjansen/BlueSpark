import { AIService } from './ai';
import { FollowerProfile, ProfileAnalysis } from '../types/bluesky';

export class ContentAnalyzer {
  static async analyzeUserProfile(profile: FollowerProfile) {
    return AIService.analyzeProfile(profile);
  }

  static async findCommonTopics(
    userProfile: FollowerProfile,
    followerProfile: FollowerProfile,
    userAnalysis: ProfileAnalysis | null | undefined
  ): Promise<string[]> {
    try {
      // Get or use existing analysis for main user
      const userTopics = userAnalysis?.mainTopics || 
        (await this.analyzeUserProfile(userProfile)).mainTopics;

      // Get analysis for follower
      const followerAnalysis = await this.analyzeUserProfile(followerProfile);
      const followerTopics = followerAnalysis.mainTopics;

      // Convert to lowercase for case-insensitive comparison
      const normalizedUserTopics = new Set(
        userTopics.map((topic: string) => topic.toLowerCase())
      );
      const normalizedFollowerTopics = new Set(
        followerTopics.map((topic: string) => topic.toLowerCase())
      );

      // Find intersection
      const commonTopics = userTopics.filter((topic: string) => 
        normalizedFollowerTopics.has(topic.toLowerCase())
      );

      // If no direct matches, include some topics from both users
      if (commonTopics.length === 0) {
        const combinedTopics = [
          ...userTopics.slice(0, 3),
          ...followerTopics.slice(0, 3)
        ];
        return Array.from(new Set(combinedTopics));
      }

      return commonTopics;
    } catch (error) {
      console.error('Error finding common topics:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  static async generateTopicBasedMessage(
    userProfile: FollowerProfile,
    followerProfile: FollowerProfile,
    selectedTopic: string
  ) {
    const prompt = `
      Generate a welcome message focusing on the topic: ${selectedTopic}

      User Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Recent posts: ${userProfile.posts.slice(0, 3).map(p => p.text).join('\n')}

      New Follower Profile:
      Name: ${followerProfile.displayName || 'Unknown'}
      Bio: ${followerProfile.description || 'No bio'}
      Recent posts: ${followerProfile.posts.slice(0, 3).map(p => p.text).join('\n')}

      Generate a friendly, personalized welcome message focusing on the shared interest in ${selectedTopic}.
      Keep it casual and authentic, under 300 characters.
    `;

    return AIService.generateMessage(userProfile, followerProfile, prompt);
  }
}
