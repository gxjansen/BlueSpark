export interface BlueSkyCredentials {
  identifier: string;
  password: string;
}

export interface FollowerProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  posts: Post[];
  followersCount: number;
  followsCount: number;
  postsCount: number;
  joinedAt: string;
  lastPostedAt?: string;
  recentInteraction?: RecentInteraction;
}

export interface Post {
  text: string;
  createdAt: string;
}

export interface ConversationStarter {
  followerHandle: string;
  suggestedPost: string;
  commonInterests: string[];
}

export interface MessageState {
  [key: string]: {
    message: string;
    isGenerating: boolean;
    error: string | null;
  };
}

export interface WelcomeMessageSettings {
  toneOfVoice: 'friendly' | 'professional' | 'casual' | 'enthusiastic';
  customPrompt: string;
}

export interface ProfileAnalysis {
  mainTopics: string[];
  writingStyle: string;
  commonThemes: string[];
  interests: string[];
  summary: string;
  lastUpdated: string;
}

export interface RecentInteraction {
  hasInteracted: boolean;
  lastInteractionDate?: string;
}

// BlueSky API Types
export interface PostRecord {
  text: string;
  createdAt: string;
  facets?: PostFacet[];
}

export interface PostFacet {
  index: { start: number; end: number };
  features: PostFeature[];
}

export interface PostFeature {
  $type: string;
  did?: string;
}

export interface PostReplyRef {
  parent: {
    author: {
      did: string;
    };
  };
}

export interface FeedViewPost {
  post: {
    record: PostRecord;
    author: {
      did: string;
    };
    indexedAt: string;
  };
  reply?: PostReplyRef;
}
