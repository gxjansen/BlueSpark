const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

import { FollowerProfile, ProfileAnalysis, WelcomeMessageSettings } from '../types/bluesky';

export class AIService {
  private static apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  private static model = import.meta.env.VITE_OPENROUTER_MODEL;

  private static async makeRequest(messages: { role: string; content: string }[]) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: this.model || 'anthropic/claude-3.5-haiku-20241022',
          messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          stream: false
        }),
      });

      const responseText = await response.text();
      console.log('OpenRouter Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });

      if (!response.ok) {
        const errorBody = responseText ? JSON.parse(responseText) : {};
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText}\n${
            errorBody.error?.message || responseText
          }`
        );
      }

      const data = JSON.parse(responseText);
      
      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid API response format:', data);
        throw new Error('Invalid API response format');
      }

      return data.choices[0].message.content;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error making request:', error);
      throw new Error(`Request failed: ${errorMessage}`);
    }
  }

  static async generateMessage(
    userProfile: FollowerProfile,
    followerProfile: FollowerProfile,
    settings?: WelcomeMessageSettings
  ): Promise<string> {
    if (!userProfile || !followerProfile) {
      throw new Error('Invalid profile data');
    }

    const toneInstruction = settings?.toneOfVoice
      ? `Use a ${settings.toneOfVoice} tone.`
      : 'Use a friendly tone.';

    const customPrompt = settings?.customPrompt
      ? `Additional instructions: ${settings.customPrompt}`
      : '';

    const prompt = `
      User Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Recent posts: ${(userProfile.posts || []).slice(0, 3).map((p) => p.text || '').join('\n')}

      New Follower Profile:
      Name: ${followerProfile.displayName || 'Unknown'}
      Bio: ${followerProfile.description || 'No bio'}
      Recent posts: ${(followerProfile.posts || []).slice(0, 3).map((p) => p.text || '').join('\n')}

      Generate a friendly, personalized welcome message and conversation starter based on shared interests or complementary topics. 
      ${toneInstruction}
      Keep it casual and authentic, under 300 characters.
      ${customPrompt}
    `;

    return this.makeRequest([{ role: 'user', content: prompt.trim() }]);
  }

  static async analyzeProfile(userProfile: FollowerProfile): Promise<ProfileAnalysis> {
    if (!userProfile) {
      throw new Error('Invalid profile data');
    }

    const prompt = `
      Analyze the following user profile and their last 200 posts. Provide a comprehensive analysis including:
      1. A brief summary of their online presence and communication style
      2. Main topics they discuss
      3. Writing style characteristics
      4. Common themes in their content
      5. Key interests and areas of expertise

      Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Recent posts: ${(userProfile.posts || []).map((p) => p.text || '').join('\n')}

      Format the response as JSON with the following structure:
      {
        "summary": "Brief overview of their presence",
        "mainTopics": ["topic1", "topic2", "topic3"],
        "writingStyle": "Description of their writing style",
        "commonThemes": ["theme1", "theme2", "theme3"],
        "interests": ["interest1", "interest2", "interest3"]
      }
    `;

    const response = await this.makeRequest([{ role: 'user', content: prompt.trim() }]);
    
    try {
      const analysis = JSON.parse(response) as Omit<ProfileAnalysis, 'lastUpdated'>;
      return {
        ...analysis,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      throw new Error('Failed to parse profile analysis');
    }
  }
}
