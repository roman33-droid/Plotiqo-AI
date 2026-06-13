export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team';
  projectsThisMonth: number;
  projectLimit: number;
  stripeSubscriptionId?: string;
  createdAt: string;
}

export type InputType = 'topic' | 'url';

export interface ProjectInput {
  title: string;
  niche: string;
  targetPlatform: 'TikTok' | 'YouTube Shorts' | 'Instagram Reels' | 'All';
  desiredLength: '34s' | '60s';
  audienceType: string;
  language: string;
  url?: string;
  mode?: 'reverse' | 'original' | 'niche-recreation';
  customTopic?: string;
}

export interface ViralScorecard {
  novelty: number; // 0-10
  uncertainty: number; // 0-10
  knowledgeGap: number; // 0-10
  complexity: number; // 0-10
  personalStakes: number; // 0-10
  hookStrength: number; // 0-10
  foreshadow: number; // 0-10
  mechanism: number; // 0-10
  twist: number; // 0-10
  rewatchability: number; // 0-10
  total: number; // Sum / 100
}

export interface HookVariation {
  category: 'Action' | 'Power Word' | 'Curiosity Gap' | 'Emotional' | 'Challenge';
  hooks: string[]; // Length 2
}

export interface ScriptBeat {
  timeframe: string;
  label: string;
  text: string;
  visualCue?: string;
}

export interface Shot {
  number: number;
  angle: string;
  subject: string;
  action: string;
  duration: string;
}

export interface VideoPrompt {
  sceneNo: number;
  shotName: string;
  durationSeconds: number;
  visualPrompt: string;
  cameraMovement: string;
  lighting: string;
  moodAndEnergy: string;
  styleReference: string;
  negativePrompt: string;
}

export interface AudioDirection {
  genre: string;
  energyArc: string;
  bpmRange: string;
  keyMoment: string;
}

export interface ProductionPackage {
  // 1 & 2
  viralConcept: string;
  scorecard: ViralScorecard;
  weakestDimensionNote: string;
  
  // 3 & 4
  hooks: HookVariation[];
  bestHook: {
    hook: string;
    reason: string;
  };

  // 5, 6, 7 & 8
  foreshadow: string;
  mechanism: string;
  script: ScriptBeat[];
  shotList: Shot[];

  // 9, 10
  visualDirections: {
    aspectRatio: string;
    safeZone: string;
    colorPalette: string;
    fontStyle: string;
    motionStyle: string;
  };
  retentionTriggers: {
    timestamp: string;
    type: 'Pattern interrupt' | 'Open loop' | 'Emotional spike' | 'Reframe';
    detail: string;
  }[];

  // 11, 12, 13, 14, 15
  twistEnding: {
    description: string;
    spokenWords: string;
  };
  easterEgg: string;
  rewatchTrigger: string;
  editingInstructions: {
    cutRate: string;
    musicArc: string;
    bpmRange: string;
    textOverlays: string;
    soundEffects: string;
    colorGrade: string;
    transitions: string;
    captionStyle: string;
  };
  thumbnailFirstFrame: {
    subjectPosition: string;
    background: string;
    textOverlay: string;
    colorTreatment: string;
  };

  // 16, 17, 18, 19
  platformAdaptations: {
    platform: 'TikTok' | 'YouTube Shorts' | 'Instagram Reels';
    adaptation: string;
  }[];
  caption: {
    hookSentence: string;
    hashtags: string[];
    cta: string;
  };
  titleVariations: string[]; // 5
  whyItWillGoViral: string[]; // 3-5 bullets
  
  // AI Video Module Section
  masterStylePrompt: string;
  sceneVideoPrompts: VideoPrompt[];
  audioDirections: AudioDirection;
}

export interface VideoAnalysis {
  id: string;
  url: string;
  platform: string;
  title: string;
  description: string;
  transcript: string;
  scorecard: ViralScorecard;
  breakdown: {
    hook: string;
    foreshadow: string;
    mechanism: string;
    narrativeArc: string;
    twist: string;
    visualStyle: string;
    emotionalStakes: string;
    platformSignals: string;
  };
  strengths: string[];
  weaknesses: string[];
  styleFingerprint: {
    editRhythm: string;
    tone: string;
    energyLevel: string;
  };
}

export interface Project {
  id: string;
  title: string;
  input: ProjectInput;
  inputType: InputType;
  analysis?: VideoAnalysis;
  productionPackage?: ProductionPackage;
  createdAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalProjects: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  recentLogs: {
    id: string;
    userEmail: string;
    action: string;
    timestamp: string;
    details: string;
  }[];
}
