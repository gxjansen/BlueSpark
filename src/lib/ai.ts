const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
import { useStore } from './store';

export class AIService {
  private static apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  private static model = import.meta.env.VITE_OPENROUTER_MODEL;

  private static trackTokenUsage(response: any) {
    if (response?.usage?.total_tokens) {
      const store = useStore.getState();
      store.addOpenRouterTokens(response.usage.total_tokens);
    }
  }

  static async generateMessage(
    userProfile: any, 
    followerProfile: any, 
    customPrompt?: string
  ): Promise<string> {
    // Validate input data
    if (!userProfile || !followerProfile) {
      console.error('Missing profile data:', { userProfile, followerProfile });
      throw new Error('Invalid profile data');
    }

    const prompt = customPrompt || `
      User Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Recent posts: ${(userProfile.posts || []).slice(0, 3).map((p: any) => p.text || '').join('\n')}

      New Follower Profile:
      Name: ${followerProfile.displayName || 'Unknown'}
      Bio: ${followerProfile.description || 'No bio'}
      Recent posts: ${(followerProfile.posts || []).slice(0, 3).map((p: any) => p.text || '').join('\n')}

      Generate a friendly, personalized welcome message and conversation starter based on shared interests or complementary topics. 
      Keep it casual and authentic, under 300 characters.
    `;

    try {
      // Log API request for debugging
      console.log('Sending request to OpenRouter:', {
        model: this.model,
        prompt: prompt.trim()
      });

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: this.model || 'anthropic/claude-3.5-haiku-20241022',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7
        }),
      });

      // Log the full response for debugging
      const responseText = await response.text();
      console.log('OpenRouter Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}\n${responseText}`);
      }

      // Parse the response text as JSON
      const data = JSON.parse(responseText);
      
      // Track token usage
      this.trackTokenUsage(data);

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid API response format:', data);
        throw new Error('Invalid API response format');
      }

      return data.choices[0].message.content;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error generating message:', error);
      throw new Error(`Failed to generate message: ${errorMessage}`);
    }
  }

  static async analyzeProfile(userProfile: any): Promise<any> {
    if (!userProfile) {
      throw new Error('Invalid profile data');
    }

    const prompt = `
      Analyze the following user profile and their last 200 posts. Provide a comprehensive analysis directly addressing the user, including:
      1. A brief summary of their online presence and communication style
      2. Main topics they discuss
      3. Writing style characteristics
      4. Common themes in their content
      5. Key interests and areas of expertise

      Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Recent posts: ${(userProfile.posts || []).map((p: any) => p.text || '').join('\n')}

      Format the response as JSON with the following structure, using direct address (e.g., "You appear to be..." instead of "The user appears to be..."):
      {
        "summary": "Brief overview directly addressing the user",
        "mainTopics": ["topic1", "topic2", "topic3"],
        "writingStyle": "Description of their writing style",
        "commonThemes": ["theme1", "theme2", "theme3"],
        "interests": ["interest1", "interest2", "interest3"]
      }
    `;

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
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}\n${responseText}`);
      }

      const data = JSON.parse(responseText);
      
      // Track token usage
      this.trackTokenUsage(data);

      const analysis = JSON.parse(data.choices[0].message.content);
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
