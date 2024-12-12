import { AIService } from './ai';
import { FollowerProfile, ProfileAnalysis } from '../types/bluesky';
import { useStore } from './store';

// Import TONE_GUIDELINES from AIService
const TONE_GUIDELINES = {
  warm: 'Be welcoming, sincere, and friendly. Use a conversational tone that makes the new follower feel valued and comfortable.',
  professional: 'Maintain a polite, business-like tone while being approachable. Use clear, concise language and remain courteous.',
  humorous: 'Keep the message light-hearted and fun, incorporating subtle humor where appropriate. Stay positive and playful while remaining respectful.',
  enthusiastic: 'Show high energy and excitement about connecting. Use dynamic language and express genuine interest in getting to know the follower.'
};

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
    const isNewUser = followerProfile.postsCount === 0;
    const isOrganization = userProfile.accountType === 'organization';
    
    // Get current welcome settings from store
    const store = useStore.getState();
    const { toneOfVoice, customPrompt: additionalInstructions } = store.welcomeSettings;

    const prompt = `
      Generate a welcome message focusing on the topic: ${selectedTopic}

      User Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Account Type: ${isOrganization ? 'Organization' : 'Personal'}
      Recent posts: ${userProfile.posts.slice(0, 3).map(p => p.text).join('\n')}

      New Follower Profile:
      Handle: @${followerProfile.handle}
      Name: ${followerProfile.displayName || 'Unknown'}
      Bio: ${followerProfile.description || 'No bio'}
      Posts count: ${followerProfile.postsCount}
      Recent posts: ${followerProfile.posts.slice(0, 3).map(p => p.text).join('\n')}

      IMPORTANT REQUIREMENTS:
      1. First sentence MUST include "@${followerProfile.handle}" and indicate this is a first meeting/introduction
      2. Message MUST end with a relevant question about ${selectedTopic} to start a conversation
      3. Keep it ${isOrganization ? 'professional yet approachable' : 'casual and authentic'}
      4. Message must be under 300 characters
      5. Use one of these formats for the first sentence:
         ${isNewUser ? 
           `- "Hello @${followerProfile.handle}, welcome to Bluesky!"
            - "Hi @${followerProfile.handle}! Welcome to the community!"
            - "Hey @${followerProfile.handle}, excited to be one of your first connections on Bluesky!"` 
           :
           isOrganization ?
           `- "Hi @${followerProfile.handle}, thanks for following us!"
            - "Hello @${followerProfile.handle}! We're glad to connect!"
            - "Welcome @${followerProfile.handle}! Thanks for joining our community!"` 
           :
           `- "Hi @${followerProfile.handle}, thanks for following me!"
            - "Hey @${followerProfile.handle}, nice meeting you!"
            - "Hello @${followerProfile.handle}! Thanks for connecting!"`
         }
      6. End with a question that:
         - Is specific to ${selectedTopic}
         - Shows genuine interest in their perspective
         - Is open-ended to encourage discussion
         ${isOrganization ? '- Use "we" instead of "I" in questions' : ''}

      TONE REQUIREMENTS:
      ${TONE_GUIDELINES[toneOfVoice]}

      ${additionalInstructions ? `ADDITIONAL INSTRUCTIONS:
      ${additionalInstructions}` : ''}

      DO NOT include any introductory text like "Here's a message:" or explanatory text.
      ONLY generate the welcome message itself.
    `;

    return AIService.generateMessage(userProfile, followerProfile, prompt);
  }
}
