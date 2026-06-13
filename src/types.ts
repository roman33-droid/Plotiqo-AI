export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'creator' | 'pro' | 'agency' | 'enterprise' | 'team';
  projectsThisMonth: number;
  projectLimit: number;
  credits?: number;
  stripeSubscriptionId?: string;
  createdAt: string;
}

export type InputType = 'topic' | 'product' | 'url' | 'video_url' | 'pdf' | 'idea';

export interface ProjectInput {
  title: string;
  productDescription?: string;
  url?: string;
  pdfName?: string;
  pdfText?: string;
  ideaText?: string;
  niche: string;
  targetPlatform: 'TikTok' | 'YouTube Shorts' | 'Instagram Reels' | 'All';
  desiredLength: '34s' | '60s';
  audienceType: string;
  language: string;
  mode?: 'reverse' | 'original' | 'niche-recreation';
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
  total: number; // Sum out of 100
  viralityProbability?: number; // percentage, e.g. 95
  retentionProbability?: number; // percentage, e.g. 88
}

export interface ResearchEngineData {
  hiddenFacts: string[];
  surprisingStatistics: string[];
  contrarianViewpoints: string[];
  controversies: string[];
  mechanisms: string[];
  emotionalTriggers: string[];
}

export interface NarrativeArchitectureData {
  coreNarrative: string;
  decisiveHook: string;
  hookVariations: { category: string; hooks: string[] }[];
  foreshadowPromise: string;
  runtimeTracker: string; // e.g. progress bar
  openLoops: string[];
}

export interface InteractiveScreenplayBeat {
  timeframe: string; // "0-3s Hook", "3-8s Foreshadow", "8-12s Obstacle", "12-18s Adaptation", "18-25s Climax", "25-30s Payoff", "30-34s Twist"
  label: string;
  voiceover: string;
  visualDirection: string;
  psychologyAnchor: string;
}

export interface Shot {
  number: number;
  angle: string;
  subject: string;
  action: string;
  duration: string;
}

export interface ProductionBlueprintData {
  cameraAngles: string[];
  shotList: Shot[];
  lightingDesign: string;
  colorGrade: string;
  motionDirections: string;
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
  musicArc: string;
  sfxCues: string[];
}

export interface ScenePrompt {
  sceneNo: number;
  shotName: string;
  durationSeconds: number;
  veoPrompt: string;
  klingPrompt: string;
  runwayPrompt: string;
  soraPrompt: string;
  negativePrompt: string;
}

export interface AIVideoPromptData {
  masterStyle: string;
  veo: string;
  kling: string;
  runway: string;
  sora: string;
  scenePrompts: ScenePrompt[];
}

export interface PlatformOptimizationData {
  tiktokStrategy: string;
  instagramStrategy: string;
  youtubeShortsStrategy: string;
  facebookReelsStrategy: string;
  captionSet: {
    hookSentence: string;
    hashtags: string[];
    cta: string;
  };
}

export interface ProductionPackage {
  title: string;
  viralConcept: string;
  whyItWillGoViral: string[];
  
  // Step 1: Research Engine
  research: ResearchEngineData;

  // Step 2: Retention Engineering Engine
  scorecard: ViralScorecard;
  weakestDimensionNote: string;

  // Step 3: Narrative Architecture
  narrative: NarrativeArchitectureData;

  // Step 4: Interactive Screenplay
  screenplay: InteractiveScreenplayBeat[];

  // Step 5: Production Blueprint
  productionBlueprint: ProductionBlueprintData;

  // Step 6: AI Video Prompt Generator
  aiVideoPrompts: AIVideoPromptData;

  // Step 7: Platform Optimization
  platformOptimization: PlatformOptimizationData;

  // Active fields directly matching generation output
  bestHook: {
    hook: string;
    reason: string;
  };
  foreshadow: string;
  mechanism: string;
  script: {
    timeframe: string;
    label: string;
    text: string;
  }[];
  shotList: Shot[];
  hooks: {
    category: string;
    hooks: string[];
  }[];
  visualDirections: {
    aspectRatio: string;
    safeZone: string;
    colorPalette: string;
    fontStyle: string;
    motionStyle: string;
  };
  retentionTriggers: {
    timestamp: string;
    type: string;
    detail: string;
  }[];
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
  masterStylePrompt: string;
  sceneVideoPrompts: {
    sceneNo: number;
    shotName: string;
    durationSeconds: number;
    visualPrompt: string;
    cameraMovement: string;
    lighting: string;
    moodAndEnergy: string;
    styleReference: string;
    negativePrompt: string;
  }[];
  audioDirections: {
    genre: string;
    energyArc: string;
    bpmRange: string;
    keyMoment: string;
  };
  titleVariations: string[];
  platformAdaptations: {
    platform: string;
    adaptation: string;
  }[];
  caption: {
    hookSentence: string;
    hashtags: string[];
    cta: string;
  };

  // Extra metadata for legacy compatibility (if needed)
  twistEnding?: {
    description: string;
    spokenWords: string;
  };
  easterEgg?: string;
  rewatchTrigger?: string;
  thumbnailFirstFrame?: {
    subjectPosition: string;
    background: string;
    textOverlay: string;
    colorTreatment: string;
  };
  thumbnailPsychology?: {
    ctrAnalysis: string;
    attentionTrigger: string;
    headline: string;
    layout: string;
  };
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
  research?: ResearchEngineData; // Step 1 analysis back-feed
}

export interface Project {
  id: string;
  title: string;
  inputType: InputType;
  input: ProjectInput;
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
