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
}

export interface Post {
  text: string;
  createdAt: string;
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

export interface WelcomeMessageSettings {
  toneOfVoice: ToneOfVoice;
  customPrompt: string;
}
