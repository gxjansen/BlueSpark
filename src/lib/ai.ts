const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
import { useStore } from './store';

const MIN_POSTS_FOR_ANALYSIS = 20;

const DEFAULT_EMPTY_PROFILE_ANALYSIS = {
  summary: "This appears to be a new user who hasn't posted content or added profile information yet.",
  mainTopics: ["new to bluesky"],
  writingStyle: "Not enough content to analyze",
  commonThemes: ["getting started"],
  interests: ["exploring bluesky"],
  lastUpdated: new Date().toISOString(),
  basedOnPosts: false
};

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

    const isNewUser = followerProfile.postsCount === 0;

    const prompt = customPrompt || `
      User Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Recent posts: ${(userProfile.posts || []).slice(0, 3).map((p: any) => p.text || '').join('\n')}

      New Follower Profile:
      Handle: @${followerProfile.handle}
      Name: ${followerProfile.displayName || 'Unknown'}
      Bio: ${followerProfile.description || 'No bio'}
      Posts count: ${followerProfile.postsCount}
      Recent posts: ${(followerProfile.posts || []).slice(0, 3).map((p: any) => p.text || '').join('\n')}

      Generate ONLY the welcome message itself, with no introductory text or explanations.
      IMPORTANT REQUIREMENTS:
      1. First sentence MUST include "@${followerProfile.handle}" and indicate this is a first meeting/introduction
      2. Message MUST end with a relevant question about a shared interest to start a conversation
      3. Keep it casual and authentic
      4. Message must be under 300 characters
      5. Use one of these formats for the first sentence:
         ${isNewUser ? 
           `- "Hello @${followerProfile.handle}, welcome to Bluesky!"
            - "Hi @${followerProfile.handle}! Welcome to the community!"
            - "Hey @${followerProfile.handle}, excited to be one of your first connections on Bluesky!"` 
           :
           `- "Hi @${followerProfile.handle}, thanks for following me!"
            - "Hey @${followerProfile.handle}, nice meeting you!"
            - "Hello @${followerProfile.handle}! Thanks for connecting!"`
         }
      6. End with a question that:
         - Is specific to a shared interest visible in both profiles
         - Shows genuine interest in their perspective
         - Is open-ended to encourage discussion
         - Example: "I see you're also into [shared interest]. What's your take on [specific aspect]?"

      DO NOT include any introductory text like "Here's a message:" or explanatory text.
      ONLY generate the welcome message itself.
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

      // Clean up any potential introductory text
      let message = data.choices[0].message.content.trim();
      
      // Remove common introductory phrases
      message = message.replace(/^(Here['']s a( personalized)? welcome message:?\s*)/i, '');
      message = message.replace(/^(Here['']s a message:?\s*)/i, '');
      message = message.replace(/^(Welcome message:?\s*)/i, '');
      message = message.replace(/^(Message:?\s*)/i, '');

      return message;
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

    // Return default analysis for empty profiles without making API call
    if (userProfile.postsCount === 0 && (!userProfile.description || userProfile.description.trim() === '')) {
      console.log('Empty profile detected, using default analysis');
      return DEFAULT_EMPTY_PROFILE_ANALYSIS;
    }

    const hasSufficientPosts = (userProfile.posts || []).length >= MIN_POSTS_FOR_ANALYSIS;

    const prompt = `
      Analyze the following user profile${hasSufficientPosts ? ' and their posts' : ''}. Provide a comprehensive analysis directly addressing the user, including:
      1. A brief summary of their online presence${hasSufficientPosts ? ' and communication style' : ''}
      2. Main topics they discuss
      3. ${hasSufficientPosts ? 'Writing style characteristics' : 'Apparent interests based on their bio'}
      4. ${hasSufficientPosts ? 'Common themes in their content' : 'Key themes from their profile'}
      5. Key interests and areas of expertise

      Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      ${hasSufficientPosts ? `Recent posts: ${userProfile.posts.map((p: any) => p.text || '').join('\n')}` : ''}

      Format the response as JSON with the following structure, using direct address (e.g., "You appear to be..." instead of "The user appears to be..."):
      {
        "summary": "Brief overview directly addressing the user",
        "mainTopics": ["topic1", "topic2", "topic3"],
        "writingStyle": "${hasSufficientPosts ? 'Description of their writing style' : 'Not enough posts to analyze'}",
        "commonThemes": ["theme1", "theme2", "theme3"],
        "interests": ["interest1", "interest2", "interest3"]
      }

      IMPORTANT: Response MUST be valid JSON. Do not include any explanatory text outside the JSON structure.
      ${!hasSufficientPosts ? 'Note: This analysis is based primarily on the user\'s profile bio as they have fewer than ' + MIN_POSTS_FOR_ANALYSIS + ' posts.' : ''}
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
          messages: [{ 
            role: 'user', 
            content: prompt,
            name: 'json_only'
          }],
          max_tokens: 500,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}\n${responseText}`);
      }

      const data = JSON.parse(responseText);
      
      // Track token usage
      this.trackTokenUsage(data);

      let content = data.choices[0].message.content;
      
      // Try to extract JSON if it's wrapped in text
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }
        
        const analysis = JSON.parse(content);
        return {
          ...analysis,
          lastUpdated: new Date().toISOString(),
          basedOnPosts: hasSufficientPosts
        };
      } catch (parseError) {
        console.error('Failed to parse analysis response:', parseError);
        // Return a default analysis structure
        return {
          summary: "Unable to analyze profile at this time.",
          mainTopics: [],
          writingStyle: "Not enough posts to analyze",
          commonThemes: [],
          interests: [],
          lastUpdated: new Date().toISOString(),
          basedOnPosts: false
        };
      }
    } catch (error) {
      console.error('Error analyzing profile:', error);
      throw new Error('Failed to analyze profile');
    }
  }
}
