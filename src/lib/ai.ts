const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
import { useStore } from './store';
import type { ProfileAnalysis, ToneOfVoice } from '../types/bluesky';

const MIN_POSTS_FOR_ANALYSIS = 20;

const DEFAULT_EMPTY_PROFILE_ANALYSIS: ProfileAnalysis = {
  summary: "This appears to be a new user who hasn't posted content or added profile information yet.",
  mainTopics: ["new to bluesky"],
  writingStyle: "Not enough content to analyze",
  commonThemes: ["getting started"],
  interests: ["exploring bluesky"],
  lastUpdated: new Date().toISOString(),
  basedOnPosts: false,
  accountType: 'personal'
};

// Enhanced tone of voice guidelines for stronger differentiation
const TONE_GUIDELINES: Record<ToneOfVoice, string> = {
  warm: `
    - Use warm, friendly language that creates a personal connection
    - Include phrases like "so glad to connect", "wonderful to meet you", "looking forward to"
    - Show genuine interest and empathy in your response
    - Keep the tone conversational and inviting
    - Use gentle, welcoming words and phrases
    - Make the follower feel valued and appreciated
  `,
  professional: `
    - Maintain a polite, business-appropriate tone throughout
    - Use more formal language while remaining approachable
    - Focus on expertise and professional interests
    - Keep responses concise and well-structured
    - Use industry-standard terminology where relevant
    - Maintain professional courtesy while showing interest
  `,
  humorous: `
    - Include a light-hearted observation or playful comment
    - Use wordplay, puns or gentle humor where appropriate
    - Keep the tone fun and engaging
    - Include a playful element in the question
    - Stay positive and upbeat throughout
    - Use casual, cheerful language
  `,
  enthusiastic: `
    - Show high energy and excitement in your language
    - Use exclamation marks appropriately to convey enthusiasm
    - Express strong interest in shared topics
    - Include words like "excited", "amazing", "fantastic", "love"
    - Show eagerness to engage in conversation
    - Convey genuine excitement about the connection
  `
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

  private static getCurrentTone(): ToneOfVoice {
    // Get current welcome settings from store
    const store = useStore.getState();
    const { toneOfVoice } = store.welcomeSettings;

    // Load settings from localStorage as a fallback
    if (!toneOfVoice) {
      try {
        const savedSettings = localStorage.getItem('welcomeSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.toneOfVoice) {
            return parsed.toneOfVoice;
          }
        }
      } catch (error) {
        console.error('Error reading tone from localStorage:', error);
      }
    }

    return toneOfVoice || 'warm';
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

    // Get current welcome settings from store
    const store = useStore.getState();
    const { toneOfVoice, customPrompt: additionalInstructions } = store.welcomeSettings;

    // Debug log to verify tone setting
    console.log('Current tone settings:', {
      storeSettings: store.welcomeSettings,
      localStorageSettings: localStorage.getItem('welcomeSettings'),
      selectedTone: toneOfVoice
    });

    const isNewUser = followerProfile.postsCount === 0;
    const isOrganization = userProfile.accountType === 'organization';

    // If a custom prompt is provided, ensure it includes the @-mention requirement
    if (customPrompt) {
      customPrompt = `${customPrompt}

      CRITICAL REQUIREMENT: The message MUST start with one of these exact greetings:
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
      }`;
    }

    const prompt = customPrompt || `
      CURRENT TONE SETTING: ${toneOfVoice}

      User Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      Account Type: ${isOrganization ? 'Organization' : 'Personal'}
      Recent posts: ${(userProfile.posts || []).slice(0, 3).map((p: any) => p.text || '').join('\n')}

      New Follower Profile:
      Handle: @${followerProfile.handle}
      Name: ${followerProfile.displayName || 'Unknown'}
      Bio: ${followerProfile.description || 'No bio'}
      Posts count: ${followerProfile.postsCount}
      Recent posts: ${(followerProfile.posts || []).slice(0, 3).map((p: any) => p.text || '').join('\n')}

      CRITICAL TONE REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:
      ${TONE_GUIDELINES[toneOfVoice]}

      IMPORTANT MESSAGE REQUIREMENTS:
      1. First sentence MUST include "@${followerProfile.handle}" and indicate this is a first meeting/introduction
      2. Message MUST end with a relevant question about a shared interest to start a conversation
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
         - Is specific to a shared interest visible in both profiles
         - Shows genuine interest in their perspective
         - Is open-ended to encourage discussion
         - Example: "I see you're also into [shared interest]. What's your take on [specific aspect]?"
         ${isOrganization ? '- Use "we" instead of "I" in questions' : ''}

      ${additionalInstructions ? `ADDITIONAL INSTRUCTIONS:
      ${additionalInstructions}` : ''}

      FINAL REMINDERS:
      - The tone of the message MUST strongly reflect the ${toneOfVoice} tone guidelines above
      - DO NOT default to professional tone unless explicitly set
      - DO NOT include any introductory text like "Here's a message:" or explanatory text
      - ONLY generate the welcome message itself
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

      // Validate that the message starts with a proper @-mention
      if (!message.includes(`@${followerProfile.handle}`)) {
        console.error('Generated message missing required @-mention, regenerating...');
        return this.generateMessage(userProfile, followerProfile, customPrompt);
      }

      return message;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error generating message:', error);
      throw new Error(`Failed to generate message: ${errorMessage}`);
    }
  }

  static async analyzeProfile(userProfile: any): Promise<ProfileAnalysis> {
    if (!userProfile) {
      console.error('Invalid profile data provided to analyzeProfile');
      return DEFAULT_EMPTY_PROFILE_ANALYSIS;
    }

    // Return default analysis for empty profiles without making API call
    if (userProfile.postsCount === 0 && (!userProfile.description || userProfile.description.trim() === '')) {
      console.log('Empty profile detected, using default analysis');
      return DEFAULT_EMPTY_PROFILE_ANALYSIS;
    }

    const hasSufficientPosts = (userProfile.posts || []).length >= MIN_POSTS_FOR_ANALYSIS;

    const prompt = `
      Analyze the following user profile${hasSufficientPosts ? ' and their posts' : ''}. First, determine if this is a personal account or an organization account. Then provide a comprehensive analysis directly addressing the user/organization, including:
      1. A brief summary of their online presence${hasSufficientPosts ? ' and communication style' : ''}
      2. Main topics they discuss
      3. ${hasSufficientPosts ? 'Writing style characteristics' : 'Apparent interests based on their bio'}
      4. ${hasSufficientPosts ? 'Common themes in their content' : 'Key themes from their profile'}
      5. Key interests and areas of expertise

      Profile:
      Name: ${userProfile.displayName || 'Unknown'}
      Bio: ${userProfile.description || 'No bio'}
      ${hasSufficientPosts ? `Recent posts: ${userProfile.posts.map((p: any) => p.text || '').join('\n')}` : ''}

      Format the response as JSON with the following structure:
      {
        "accountType": "personal" or "organization",
        "summary": "Brief overview directly addressing the user/organization",
        "mainTopics": ["topic1", "topic2", "topic3"],
        "writingStyle": "${hasSufficientPosts ? 'Description of their writing style' : 'Not enough posts to analyze'}",
        "commonThemes": ["theme1", "theme2", "theme3"],
        "interests": ["interest1", "interest2", "interest3"]
      }

      Consider these factors when determining if it's an organization:
      - Use of "we", "our", "us" in bio or posts
      - Company/brand-like name or description
      - Professional/corporate tone in communication
      - References to products, services, or company activities
      - Official company/brand identifiers

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

      // First check if the response is ok
      if (!response.ok) {
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText
        });
        return DEFAULT_EMPTY_PROFILE_ANALYSIS;
      }

      // Get the response text and log it for debugging
      const responseText = await response.text();
      console.log('Raw API Response:', responseText);

      // Check if the response text is empty or whitespace only
      if (!responseText || !responseText.trim()) {
        console.error('Empty response received from OpenRouter API');
        return DEFAULT_EMPTY_PROFILE_ANALYSIS;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse API response:', {
          error: parseError,
          responseText
        });
        return DEFAULT_EMPTY_PROFILE_ANALYSIS;
      }

      // Track token usage
      this.trackTokenUsage(data);

      let content = data.choices?.[0]?.message?.content;
      
      // If no content is found in the expected structure
      if (!content) {
        console.error('No content found in API response:', data);
        return DEFAULT_EMPTY_PROFILE_ANALYSIS;
      }

      // Try to extract JSON if it's wrapped in text
      let analysis;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }
        
        analysis = JSON.parse(content);

        // Validate the required fields are present
        if (!analysis.accountType || !analysis.summary || !Array.isArray(analysis.mainTopics)) {
          console.error('Invalid analysis structure:', analysis);
          return DEFAULT_EMPTY_PROFILE_ANALYSIS;
        }

        // If account type is detected as organization, only set professional tone if no tone is explicitly set
        if (analysis.accountType === 'organization') {
          const store = useStore.getState();
          const currentSettings = store.welcomeSettings;
          
          // Check if the tone has been explicitly set (different from default 'warm')
          const hasExplicitTone = localStorage.getItem('welcomeSettings') !== null;
          
          if (!hasExplicitTone) {
            store.updateWelcomeSettings({ toneOfVoice: 'professional' });
          }
        }

        return {
          ...analysis,
          lastUpdated: new Date().toISOString(),
          basedOnPosts: hasSufficientPosts
        };
      } catch (parseError) {
        console.error('Failed to parse analysis content:', {
          error: parseError,
          content
        });
        return DEFAULT_EMPTY_PROFILE_ANALYSIS;
      }
    } catch (error) {
      console.error('Error in analyzeProfile:', error);
      return DEFAULT_EMPTY_PROFILE_ANALYSIS;
    }
  }
}
