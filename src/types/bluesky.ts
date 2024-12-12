export interface BlueSkyCredentials {
  identifier: string;
  password: string;
}

export interface FollowerProfile {
  did: string;
  handle: string;
  displayName: string;
  description: string;
  avatar?: string;
  posts: Post[];
  followersCount: number;
  followsCount: number;
  postsCount: number;
  joinedAt: string;
  lastPostedAt?: string;
  accountType?: 'personal' | 'organization';
}

export interface Post {
  text: string;
  createdAt: string;
  reason?: {
    $type: string;  // Will be 'app.bsky.feed.defs#reasonRepost' for reposts
  };
}

export interface UserProfile extends FollowerProfile {
  accountType: 'personal' | 'organization';
}

export interface ProfileAnalysis {
  summary: string;
  mainTopics: string[];
  writingStyle: string;
  commonThemes: string[];
  interests: string[];
  lastUpdated: string;
  basedOnPosts: boolean;
  accountType: 'personal' | 'organization';
}

export interface MessageState {
  [followerHandle: string]: {
    message?: string;
    isGenerating?: boolean;
    error?: string | null;
  };
}

export type ToneOfVoice = 'warm' | 'professional' | 'humorous' | 'enthusiastic';

export type EmojiLevel = 'off' | 'low' | 'high';

export interface WelcomeMessageSettings {
  toneOfVoice: ToneOfVoice;
  customPrompt: string;
  emojiLevel: EmojiLevel;
}
