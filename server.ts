import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Setup AI Clients
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Simulated simple persistent JSON database.
const DB_FILE = path.join(process.cwd(), "database.json");

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading database", err);
  }
  return { 
    users: [], 
    projects: [], 
    packages: [], 
    creditsLedger: [], 
    outputs: [], 
    templates: [], 
    researchResults: [], 
    retentionScores: [], 
    promptLibraries: [], 
    systemAnalytics: [], 
    adminControls: [], 
    auditLogs: [] 
  };
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database", err);
  }
}

// Initial Database Seeding
const initialDb = readDB();
let hasChanges = false;

if (!initialDb.users || initialDb.users.length === 0) {
  initialDb.users = [
    {
      id: "u_default",
      email: "moninilufa31@gmail.com",
      name: "Monini Lufa",
      plan: "pro", // Free, Creator, Pro, Agency, Enterprise
      credits: 220,
      stripeCustomerId: "cus_demo_1",
      stripeSubscriptionId: "sub_demo_1",
      createdAt: new Date().toISOString()
    }
  ];
  hasChanges = true;
}

if (!initialDb.projects || initialDb.projects.length === 0) {
  initialDb.projects = [
    {
      id: "proj_demo_1",
      title: "How Cognitive Retention Hacks the Brain",
      inputType: "topic",
      input: {
        title: "Cognitive retention dynamics",
        niche: "Content Creation",
        targetPlatform: "YouTube Shorts",
        desiredLength: "34s",
        audienceType: "Aspiring Creators",
        language: "English"
      },
      createdAt: new Date().toISOString()
    }
  ];
  hasChanges = true;
}

if (!initialDb.packages || initialDb.packages.length === 0) {
  const demoPackage = generateOfflinePackage({ title: "Cognitive retention dynamics" });
  initialDb.packages = [
    {
      id: "pack_demo_1",
      projectId: "proj_demo_1",
      userId: "u_default",
      version: 1,
      active: true,
      createdAt: new Date().toISOString(),
      ...demoPackage
    }
  ];
  hasChanges = true;
}

if (!initialDb.templates || initialDb.templates.length === 0) {
  initialDb.templates = [
    { id: "temp_1", name: "Cognitive Retention Loop", description: "Standard high-energy loop structure." },
    { id: "temp_2", name: "BUT-SO Obstacle Frame", description: "Narrative pivot building empathy." }
  ];
  hasChanges = true;
}

if (!initialDb.promptLibraries || initialDb.promptLibraries.length === 0) {
  initialDb.promptLibraries = [
    { id: "pl_1", category: "veo", prompt_text: "Moody dark room, green key lighting." },
    { id: "pl_2", category: "kling", prompt_text: "Macro handshot, OLED digital counter." }
  ];
  hasChanges = true;
}

if (!initialDb.auditLogs) {
  initialDb.auditLogs = [];
}
if (!initialDb.creditsLedger) {
  initialDb.creditsLedger = [];
}
if (!initialDb.systemAnalytics) {
  initialDb.systemAnalytics = [];
}

if (hasChanges) {
  writeDB(initialDb);
}

// Helpers
function logAudit(actor: string, action: string, details: string) {
  const db = readDB();
  db.auditLogs.unshift({
    id: "audit_" + Math.random().toString(36).substr(2, 9),
    actorEmail: actor,
    action,
    details,
    createdAt: new Date().toISOString()
  });
  if (db.auditLogs.length > 200) db.auditLogs = db.auditLogs.slice(0, 200);
  writeDB(db);
}

function recordTelemetry(userId: string | null, eventType: string, durationMs: number, payload: any) {
  const db = readDB();
  db.systemAnalytics.push({
    id: "telemetry_" + Math.random().toString(36).substr(2, 9),
    userId,
    eventType,
    durationMs,
    payload,
    createdAt: new Date().toISOString()
  });
  if (db.systemAnalytics.length > 500) db.systemAnalytics = db.systemAnalytics.slice(db.systemAnalytics.length - 500);
  writeDB(db);
}

// Dynamic billing values per tier
const PLAN_LIMITS: Record<string, { credits: number; price: number }> = {
  free: { credits: 10, price: 0 },
  creator: { credits: 100, price: 19 },
  pro: { credits: 250, price: 29 },
  agency: { credits: 1000, price: 99 },
  enterprise: { credits: 10000, price: 499 }
};

// Generative fallbacks
function generateOfflineAnalysis(url: string) {
  let extractedTitle = "Dynamic Short-Form Loop Analysis";
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    if (pathname && pathname.length > 5) {
      const segments = pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && last.length > 3) {
        extractedTitle = last.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    id: "analysis_fallback_" + Math.random().toString(36).substr(2, 9),
    url: url,
    platform: "YouTube Shorts",
    title: extractedTitle,
    description: "Reverse-engineered framework for " + extractedTitle + " using localized retention metrics.",
    transcript: "Hey, stop scrolling because if you are still trying to do this, everything is about to break. BUT this one change makes your channels get massive traffic, SO you absolute must try this immediately...",
    scorecard: {
      novelty: 8,
      uncertainty: 9,
      knowledgeGap: 8,
      complexity: 7,
      personalStakes: 9,
      hookStrength: 9,
      foreshadow: 8,
      mechanism: 8,
      twist: 9,
      rewatchability: 9,
      total: 86
    },
    breakdown: {
      hook: "Immediate physical warning statements that stop negative scrolling habits within 1.2 seconds.",
      foreshadow: "Promises an exclusive hidden adjustment at the 25-second mark of the playback feed.",
      mechanism: "Utilizes a progress indicator loop built right into the main presenter focus background.",
      narrativeArc: "Uses the standard BUT (obstruction) -> SO (resolution dynamic) storytelling construct.",
      twist: "The visual clue at the end connects seamlessly back to the opening statement words.",
      visualStyle: "Fast 1.1s cut pacing accompanied by high-energy green pop outlines.",
      emotionalStakes: "Capitalizes on FOMO and anxiety about using outdated content methods.",
      platformSignals: "Vertical view format optimization, clear center focal space, trending background beat."
    },
    strengths: [
      "Outstanding rapid loop transition that makes viewers think the video is still playing.",
      "Perfect pattern interrupts integrated every 2.5 seconds to retain viewer eye focus.",
      "High emotional stakes establish instant curiosity."
    ],
    weaknesses: [
      "Text captions are occasionally obscured by platform interface overlays.",
      "Could incorporate minor sound cue variations to support multi-track retention."
    ],
    styleFingerprint: {
      editRhythm: "Ultra fast cuts / 120ms transitions",
      tone: "Urgent, suspenseful, authoritative",
      energyLevel: "Maximum"
    }
  };
}

function generateOfflinePackage(input: any) {
  const title = input.title || input.ideaText || "Cognitive Retention Dynamics";
  const niche = input.niche || "Content Creation";
  const targetPlatform = input.targetPlatform || "YouTube Shorts";
  const desiredLength = input.desiredLength || "34s";
  const audienceType = input.audienceType || "Aspiring Creators";
  const language = input.language || "English";

  const cleanTitle = title.replace(/["]/g, '\\"');

  return {
    title: title,
    viralConcept: `Our cognitive retention engineering shows that video sequences about "${cleanTitle}" trigger an immediate novelty response. By establishing a progress mechanism, we hold the ${audienceType} through a high-tension narrative curve optimized for ${targetPlatform}.`,
    whyItWillGoViral: [
      "Curiosity Loop: The open loop created in the first 3 seconds forces total viewer alignment.",
      "High Stakes: Emotional investment is triggered by the presenter's personal risk and contrarian framing.",
      "Seamless Loop: The twist ending ties directly back into the opening word for a repeat viewing score multiplier."
    ],
    research: {
      hiddenFacts: [
        `Algorithm tests reveal that topics referencing "${cleanTitle}" receive a 41% higher 3-second completion rate when introduced with a physical hazard warning.`,
        `Elite creator networks intentionally suppress standard search results for "${cleanTitle}" to limit competitor replication.`
      ],
      surprisingStatistics: [
        `94.2% of mobile scrollers skip traditional instructional videos about "${cleanTitle}" within 1.8 seconds.`,
        `Implementing a real-time progress tracker increases the average retention duration by 12.4 seconds.`
      ],
      contrarianViewpoints: [
        `Everything you have been told about "${cleanTitle}" is a fabricated simplicity designed to keep your metrics average.`,
        `Do not try to make positive or encouraging content about "${cleanTitle}". Negative stakes hold 3x higher eye-focus.`
      ],
      controversies: [
        `A secret debate is growing in the content community over whether artificial retention mechanisms about "${cleanTitle}" are manipulating human attention spans.`,
        `Major platform updates are secretly testing shadow-bans for creators who use too high a novelty rating.`
      ],
      mechanisms: [
        `The 'Progress Loop' mechanism: Binding viewer anticipation to a visual count that never stops ticking up.`,
        `The 'Double-bind' question: Tautological speech framing that requires watching the full video to answer.`
      ],
      emotionalTriggers: [
        `Fear of Missing Out (FOMO): Implying that everyone else already knows this vital adjustment.`,
        `Cognitive dissonance: Presenting a highly logical scenario that opposes common sense.`
      ]
    },
    scorecard: {
      novelty: 9,
      uncertainty: 8,
      knowledgeGap: 9,
      complexity: 7,
      personalStakes: 9,
      hookStrength: 10,
      foreshadow: 9,
      mechanism: 8,
      twist: 9,
      rewatchability: 9,
      total: 89,
      viralityProbability: 94,
      retentionProbability: 89
    },
    weakestDimensionNote: "The physical mechanism feedback loop can be emphasized in the middle segments to hold retention past the 8-second mark.",
    narrative: {
      coreNarrative: `The presenter discovers a hidden paradox regarding "${cleanTitle}" that threatens to ruin average creators, but uncovers a hidden adaptation that completely reverses the outcome.`,
      decisiveHook: `Most content about "${cleanTitle}" is a complete lie, but this one secret is actually terrifying...`,
      hookVariations: [
        {
          category: "Action",
          hooks: [
            `Stop doing this with "${cleanTitle}" immediately...`,
            `I watched "${cleanTitle}" for 48 hours straight so you don't have to...`
          ]
        },
        {
          category: "Power Word",
          hooks: [
            `This toxic "${cleanTitle}" habit is killing your traffic list...`,
            `Unlocking the forbidden truth about "${cleanTitle}"...`
          ]
        },
        {
          category: "Curiosity Gap",
          hooks: [
            `They don't want you to know the actual truth about "${cleanTitle}"...`,
            `This is the exact moment everything changed for "${cleanTitle}"...`
          ]
        },
        {
          category: "Emotional",
          hooks: [
            `I risked everything to test this secret of "${cleanTitle}"...`,
            `This 3-second mistake is costing you thousands on "${cleanTitle}"...`
          ]
        },
        {
          category: "Challenge",
          hooks: [
            `Can you spot the hidden glitch in "${cleanTitle}" before the end?`,
            `I bet you can't solve this "${cleanTitle}" puzzle in 30 seconds...`
          ]
        }
      ],
      foreshadowPromise: `At second 25, we will demonstrate the actual physical proof of this "${cleanTitle}" flaw.`,
      runtimeTracker: "A real-time percentage progress bar at the bottom starting at 0% and ticking up to 100% on beat.",
      openLoops: [
        `The identity of the source who leaked this "${cleanTitle}" formula.`,
        `The exact software required to replicate this outcome.`
      ]
    },
    screenplay: [
      {
        timeframe: "0-3s Hook",
        label: "Decisive Hook",
        voiceover: `Most content about "${cleanTitle}" is a complete lie, but this one secret is actually terrifying...`,
        visualDirection: "Extreme close-up of presenter whispering intently into a studio mic with dark high-contrast lighting.",
        psychologyAnchor: "Cognitive Curiosity Gap"
      },
      {
        timeframe: "3-8s Foreshadow",
        label: "Foreshadow Promise",
        voiceover: `I am about to show you the physical evidence, but look closely at what happens right here at second 25.`,
        visualDirection: "Presenter shows a physical locked device reflecting a glowing green count mechanism.",
        psychologyAnchor: "Pattern Interruption & Anticipation Lock"
      },
      {
        timeframe: "8-12s Obstacle",
        label: "The 'BUT' Statement",
        voiceover: `I wanted to prove this live on camera, BUT traditional platform guidelines stopped me immediately.`,
        visualDirection: "Abrupt hard cut to warning logo flashing on-screen. Screen hue shifts to crimson red.",
        psychologyAnchor: "Obstacle / Frustration Trigger"
      },
      {
        timeframe: "12-18s Adaptation",
        label: "The 'SO' Action",
        voiceover: `SO, I spent 24 hours custom coding a private model just to bypass their entire filter.`,
        visualDirection: "Presenter is shown typing furiously at a terminal in a dark studio. Green lines reflecting in glasses.",
        psychologyAnchor: "Resolution and Agency Activation"
      },
      {
        timeframe: "18-25s Climax",
        label: "The Narrative Pivot",
        voiceover: `When the indicator turns emerald, that is when you realize everything we knew was completely wrong.`,
        visualDirection: "The terminal screen flashes. Slow camera push-in on presenter's wide-open eyes.",
        psychologyAnchor: "Peak Cognitive Dissonance"
      },
      {
        timeframe: "25-30s Payoff",
        label: "Mechanism Payoff",
        voiceover: `Look at the counter - it is hitting full capacity right now and revealing the true metric.`,
        visualDirection: "Close-up of the device ticking to 100% with a crisp sub-frequency drop and clear text overlay.",
        psychologyAnchor: "Curiosity Resolution"
      },
      {
        timeframe: "30-34s Twist",
        label: "Seamless Loop Back",
        voiceover: `And that is exactly why...`,
        visualDirection: "The video ends abruptly mid-vocal, which perfectly connects back to the opening statement of 'most content...' for infinite loop credit.",
        psychologyAnchor: "Rewatch Multiplier"
      }
    ],
    productionBlueprint: {
      cameraAngles: [
        "Extreme Close Up (Presenter lips & eyes for high intensity)",
        "POV Focal Shot (Hands interacting with physical device)",
        "Over the Shoulder (Dynamic computer screen reflections)",
        "Wide Angle Studio (To frame dramatic lighting shifts)"
      ],
      shotList: [
        {
          number: 1,
          angle: "Extreme Close Up",
          subject: "Presenter face",
          action: "Whispering intently into a high-grade dynamic microphone",
          duration: "3s"
        },
        {
          number: 2,
          angle: "POV Shot",
          subject: "Hands holding device",
          action: "Fumbles with a locked chest with a countdown blinking bright red",
          duration: "5s"
        },
        {
          number: 3,
          angle: "Medium Over-the-Shoulder",
          subject: "Blinking screen with safe zone guidelines",
          action: "Code typing across the viewport",
          duration: "4s"
        },
        {
          number: 4,
          angle: "Wide Angle High Shot",
          subject: "Studio room",
          action: "Room illumination switches from warm amber to deep emerald neon in one cut",
          duration: "6s"
        },
        {
          number: 5,
          angle: "Close Up macro lens",
          subject: "Open chest item",
          action: "Reveals a secret message with neon glowing outline",
          duration: "7s"
        },
        {
          number: 6,
          angle: "Extreme POV Close Up",
          subject: "Screen meter feedback",
          action: "Reaches peak 100% and triggers visual flash",
          duration: "5s"
        },
        {
          number: 7,
          angle: "Medium Shot",
          subject: "Presenter smile",
          action: "Points straight at the screen as the background dims",
          duration: "4s"
        }
      ],
      lightingDesign: "Primary high-intensity keylight at 45 degrees. Cyberpunk-inspired backdrop utilizing a dual color-shift scheme.",
      colorGrade: "Deep obsidian matte black levels with heavily saturated neon-green pop accents.",
      motionDirections: "Dynamic active hand-held camera emulation with rapid whip-pans.",
      editingInstructions: {
        cutRate: "8 rapid cuts per 10 seconds",
        musicArc: "Cinematic industrial dark-synth pausing at the twist",
        bpmRange: "124 BPM",
        textOverlays: "Dynamic word-by-word active pop captions in yellow",
        soundEffects: "Heavy drum hits, whip pan whooshes",
        colorGrade: "Deep obsidian shadows with emerald details",
        transitions: "Whip pans, zoom cuts, glitch overlays",
        captionStyle: "Word-by-word centered pop with emoji"
      },
      musicArc: "Starts with subtle low hum, builds into industrial EDM track",
      sfxCues: [
        "0.1s - Intense low sub-bass boom.",
        "3.0s - Mechanical latch unlock.",
        "8.0s - Tension vinyl scratch."
      ]
    },
    aiVideoPrompts: {
      masterStyle: "Cinematic vertical video, hyperrealistic 4K quality, intense color depth, shallow depth of field, high-energy pacing.",
      veo: `[Veo-v2-optimized] Professional vertical video of a content creator, side-lit with emerald neon green. 4k.`,
      kling: `[Kling-v1.5] Hyperrealistic 8k vertical count scene, hand holding digital countdown.`,
      runway: `[Runway-Gen3] Presenter whispering directly into Top-Grade dynamic mic, volumetric green dust beams.`,
      sora: `[Sora-optimized] Cinematic 4K vertical workshop space shifting ambient tones.`,
      scenePrompts: [
        {
          sceneNo: 1,
          shotName: "THE COGNITIVE HOOK",
          durationSeconds: 3,
          veoPrompt: "[Veo Prompt] Macro close-up shot of a presenter surprised, emerald backlight.",
          klingPrompt: "[Kling Prompt] Surprised presenter speaking into high-end mic.",
          runwayPrompt: "[Runway Prompt] High-contrast vertical close up of eye reflection.",
          soraPrompt: "[Sora Prompt] Professional recording room, extreme tension.",
          negativePrompt: "low res, blurry, watermarked, drawing"
        }
      ]
    },
    platformOptimization: {
      tiktokStrategy: "Land hook in first 1.1 seconds. Trigger trending synth background beat. Anchor question in comments.",
      instagramStrategy: "Clean thumbnail cover, key science facts highlighted in caption details.",
      youtubeShortsStrategy: "First frame acts as thumbnail cover. Subscription pop at second 30.",
      facebookReelsStrategy: "Optimized for audio-muted viewers with robust center screen captions.",
      captionSet: {
        hookSentence: `They lied to us about "${cleanTitle}"...`,
        hashtags: ["shorts", "creatorlife", "scienceofattention", "retentionrate"],
        cta: "Comment what you saw at second 25 below! 👇"
      }
    },
    
    // Flattened parameters for quick UI bindings
    bestHook: {
      hook: `Most content about "${cleanTitle}" is a complete lie, but this one secret is actually terrifying...`,
      reason: "Capitalizes on profound cognitive curiosity gap under 2 seconds."
    },
    foreshadow: `At second 25, we will demonstrate the actual physical proof of this "${cleanTitle}" flaw.`,
    mechanism: "A progress percentage bar at the bottom ticking to 100%.",
    script: [
      { timeframe: "0-3s", label: "HOOK", text: `Most content about "${cleanTitle}" is a complete lie, but this one secret is actually terrifying...` },
      { timeframe: "3-8s", label: "FORESHADOW", text: `I am about to show you the physical evidence, but look closely at what happens right here at second 25.` },
      { timeframe: "8-12s", label: "OBSTACLE", text: `I wanted to prove this live on camera, BUT traditional platform guidelines stopped me immediately.` },
      { timeframe: "12-18s", label: "ADAPTATION", text: `SO, I spent 24 hours custom coding a private model just to bypass their entire filter.` },
      { timeframe: "18-25s", label: "CLIMAX", text: `When the indicator turns emerald, that is when you realize everything we knew was completely wrong.` },
      { timeframe: "25-30s", label: "PAYOFF", text: `Look at the counter - it is hitting full capacity right now and revealing the true metric.` },
      { timeframe: "30-34s", label: "TWIST", text: `And that is exactly why...` }
    ],
    shotList: [
      { number: 1, angle: "Extreme Close Up", subject: "Presenter face", action: "Whispering intently", duration: "3s" },
      { number: 2, angle: "POV Shot", subject: "Device", action: "LED countdown ticking", duration: "5s" }
    ],
    hooks: [
      { category: "Action", hooks: [`Stop doing this with "${cleanTitle}"...`, `I watched "${cleanTitle}" for 48 hours...`] }
    ],
    visualDirections: {
      aspectRatio: "9:16 vertical",
      safeZone: "Keep essential texts in middle 60%",
      colorPalette: "Warm neon highlights + obsidian matte",
      fontStyle: "Slab serif bold, popping neon captions",
      motionStyle: "Rapid camera shake & zoom-punches"
    },
    retentionTriggers: [
      { timestamp: "3s", type: "Pattern interrupt", detail: "Chime sound effect & screen invert" },
      { timestamp: "12s", type: "Open loop", detail: "Shocked expression discovery" }
    ],
    editingInstructions: {
      cutRate: "8 cuts / 10s",
      musicArc: "Cinematic dark-synth theme",
      bpmRange: "124 BPM",
      textOverlays: "Word-by-word active pop captions",
      soundEffects: "Sub-bass hits, custom swooshes",
      colorGrade: "Deep obsidian shadows",
      transitions: "Whip pans, zoom cuts",
      captionStyle: "Centered active text pop"
    },
    masterStylePrompt: "Cinematic vertical video, hyperrealistic 4K, obsidian shadows, side emerald glow.",
    sceneVideoPrompts: [
      {
        sceneNo: 1,
        shotName: "THE COGNITIVE HOOK",
        durationSeconds: 3,
        visualPrompt: "Close-up of presenter surprising camera, glowing digital element.",
        cameraMovement: "Slow push zoom",
        lighting: "Cinematic neon glow",
        moodAndEnergy: "Suspenseful, high energy",
        styleReference: "Hyperrealistic vlog",
        negativePrompt: "drawing, cartoon, watermarked, frame"
      }
    ],
    audioDirections: {
      genre: "Suspenseful industrial electronic synth",
      energyArc: "Calm start, fast rising tension, dramatic halt at loop transition",
      bpmRange: "115-125 BPM",
      keyMoment: "Vocal pause & sub-bass drop at 25 seconds"
    },
    titleVariations: [
      `${cleanTitle}: The Dark Truth`,
      `Stop scrolling if you do ${cleanTitle}`,
      `Why 99% fail at ${cleanTitle}`
    ],
    platformAdaptations: [
      { platform: "TikTok", adaptation: "Hook in 1.1s. Trend sound. Stitch bait." },
      { platform: "YouTube Shorts", adaptation: "Thumbnail cover first frame. Sub CTA at 30s." }
    ],
    caption: {
      hookSentence: `They lied to us about "${cleanTitle}"...`,
      hashtags: ["viraltips", "shortscreator", "neuromarketing"],
      cta: "Comment your thoughts below! 👇"
    },
    thumbnailPsychology: {
      ctrAnalysis: `Predictive CTR of 8.2% - 11.4%. The curiosity gap forces high click priority in grid environments.`,
      attentionTrigger: `A high-contrast focus on a facial expression of sheer panic or intensive shock offset by a neon-green graphic glowing outline.`,
      headline: `The Forbidden ${title.toUpperCase()} Trick`,
      layout: `Subject occupies left 40% with high-tension expression (gasp or zoom gaze), bright yellow display font on the right (3-4 words max), neon red highlighting around critical visual cues.`
    }
  };
}


// =========================================================================
// API ENDPOINTS
// =========================================================================

// --- 1. Authentic Authentication simulator (Google OAuth & Email Login) ---
app.post("/api/auth/register", (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readDB();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email is already registered." });
  }

  const newUser = {
    id: "u_" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    name: name || email.split("@")[0],
    plan: "free",
    credits: 10, // Initial limit for Free tier
    stripeCustomerId: "cus_" + Math.random().toString(36).substr(2, 9),
    stripeSubscriptionId: null,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  logAudit(newUser.email, "User Registration", `Account created successfully. Plan: free, Initial Credits: 10`);
  recordTelemetry(newUser.id, "auth", 24, { action: "register", email });

  res.json({ success: true, user: newUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    // Automatically create account for testing convenience or throw error
    // For AIS preview, we auto-create so users do not get stuck, but log it elegantly.
    const newUser = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name: email.split("@")[0],
      plan: "pro", // Default to Pro for instant preview pleasure
      credits: 220,
      stripeCustomerId: "cus_" + Math.random().toString(36).substr(2, 9),
      stripeSubscriptionId: "sub_demo_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    logAudit(email, "System Auto-Registration", `Auto-created account for mock credentials.`);
    recordTelemetry(newUser.id, "auth", 18, { action: "login_autocreate", email });
    return res.json({ success: true, user: newUser });
  }

  logAudit(user.email, "User Login", `Authenticated via Email Login successfully.`);
  recordTelemetry(user.id, "auth", 15, { action: "login", email });

  res.json({ success: true, user });
});

app.post("/api/auth/google", (req, res) => {
  const { email, name, tokenId } = req.body;
  const targetEmail = email || "google_creator@gmail.com";
  const targetName = name || "Google Creator";

  const db = readDB();
  let user = db.users.find((u: any) => u.email.toLowerCase() === targetEmail.toLowerCase());

  if (!user) {
    user = {
      id: "u_g_" + Math.random().toString(36).substr(2, 9),
      email: targetEmail.toLowerCase(),
      name: targetName,
      plan: "pro", // Google OAuth starts on premium Pro tier
      credits: 250,
      stripeCustomerId: "cus_google_" + Math.random().toString(36).substr(2, 9),
      stripeSubscriptionId: "sub_google_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
    logAudit(targetEmail, "Google OAuth Sign Up", `Account created via Google Federation.`);
  } else {
    logAudit(targetEmail, "Google OAuth Login", `Signed in using Google credentials.`);
  }

  recordTelemetry(user.id, "auth", 42, { action: "google_oauth", email: targetEmail });
  res.json({ success: true, user });
});

// Single active profile fetching
app.get("/api/user", (req, res) => {
  const db = readDB();
  const user = db.users[0] || {
    id: "u_default",
    email: "moninilufa31@gmail.com",
    name: "Monini Lufa",
    plan: "pro",
    credits: 220,
    stripeSubscriptionId: "sub_demo_1",
    createdAt: new Date().toISOString()
  };
  res.json(user);
});

// Account plan updating
app.post("/api/user/update-plan", (req, res) => {
  const { plan } = req.body;
  const db = readDB();
  
  const user = db.users[0] || { id: "u_default", email: "moninilufa31@gmail.com", name: "Monini Lufa", plan: "free", credits: 10 };
  
  user.plan = plan;
  // Increase/Reset credits appropriately per Stripe guidelines
  const limit = PLAN_LIMITS[plan] || { credits: 10 };
  user.credits = limit.credits;

  // Sync back to users array
  const uIdx = db.users.findIndex((u: any) => u.id === user.id);
  if (uIdx !== -1) {
    db.users[uIdx] = user;
  } else {
    db.users.unshift(user);
  }

  writeDB(db);

  logAudit(user.email, "Plan Adjusted", `Billing tier changed to [${plan.toUpperCase()}]. Balance provisioned with ${limit.credits} XP credits.`);
  recordTelemetry(user.id, "billing", 20, { plan, creditsGranted: limit.credits });

  res.json({ success: true, plan, credits: user.credits });
});


// --- 2. Projects & Version History CRUD ---
app.get("/api/projects", (req, res) => {
  const db = readDB();
  // Filter or return projects with active package models
  const projects = db.projects || [];
  
  // Attach active package to project structure for client compatibility
  const projectsWithPackages = projects.map((p: any) => {
    const activePackage = db.packages.find((pk: any) => pk.projectId === p.id && pk.active === true);
    return {
      ...p,
      productionPackage: activePackage || null
    };
  });

  res.json(projectsWithPackages);
});

app.post("/api/projects", (req, res) => {
  const { title, inputType, input, analysis, productionPackage } = req.body;
  const db = readDB();

  // Deduct credits if generation took place
  const user = db.users[0];
  if (user && user.credits < 5) {
    return res.status(402).json({ error: "Insufficient credits balance. Please purchase more." });
  }

  if (user) {
    user.credits = Math.max(0, user.credits - 5);
    db.creditsLedger.push({
      id: "ledger_" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: -5,
      action: "Project Created",
      details: `Project "${title || input?.title}" creation cost`,
      createdAt: new Date().toISOString()
    });
  }

  const projId = "proj_" + Math.random().toString(36).substr(2, 9);
  const newProj = {
    id: projId,
    title: title || input?.title || "Untitled Viral Short",
    inputType,
    input,
    createdAt: new Date().toISOString()
  };

  db.projects.unshift(newProj);

  // If a production package has been formulated, save version 1
  if (productionPackage) {
    db.packages.push({
      id: "pack_" + Math.random().toString(36).substr(2, 9),
      projectId: projId,
      userId: user?.id || "u_default",
      version: 1,
      active: true,
      createdAt: new Date().toISOString(),
      ...productionPackage
    });
  }

  writeDB(db);

  logAudit(user?.email || "anonymous", "Project Saved", `Added new project: ${newProj.title}`);
  recordTelemetry(user?.id || null, "project", 55, { projectId: projId });

  // Return project unified structure
  res.json({
    ...newProj,
    productionPackage: productionPackage || null
  });
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.projects = db.projects.filter((p: any) => p.id !== id);
  db.packages = db.packages.filter((pk: any) => pk.projectId !== id);
  writeDB(db);

  logAudit("moninilufa31@gmail.com", "Project Purged", `Deleted project and package versions for ${id}`);
  res.json({ success: true });
});

app.post("/api/projects/duplicate/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const targetProject = db.projects.find((p: any) => p.id === id);
  if (!targetProject) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Cost: 2 credits
  const user = db.users[0];
  if (user) {
    if (user.credits < 2) {
      return res.status(402).json({ error: "Insufficient credits to duplicate blueprint." });
    }
    user.credits -= 2;
    db.creditsLedger.push({
      id: "ledger_" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: -2,
      action: "Project Duplicated",
      details: `Duplication of project "${targetProject.title}"`,
      createdAt: new Date().toISOString()
    });
  }

  const newProjId = "proj_" + Math.random().toString(36).substr(2, 9);
  const clonedProject = {
    ...targetProject,
    id: newProjId,
    title: `${targetProject.title} (Copy)`,
    createdAt: new Date().toISOString()
  };

  db.projects.unshift(clonedProject);

  // Duplicate packages belonging to this project
  const originalPackages = db.packages.filter((pk: any) => pk.projectId === id);
  originalPackages.forEach((pk: any) => {
    db.packages.push({
      ...pk,
      id: "pack_" + Math.random().toString(36).substr(2, 9),
      projectId: newProjId,
      createdAt: new Date().toISOString()
    });
  });

  writeDB(db);

  logAudit(user?.email || "anonymous", "Project Cloned", `Cloned blueprint of "${targetProject.title}"`);
  
  // Attach active
  const activePack = db.packages.find((pk: any) => pk.projectId === newProjId && pk.active === true);
  res.json({
    ...clonedProject,
    productionPackage: activePack || null
  });
});

// --- Version History restoring API endpoints ---
app.get("/api/projects/:id/versions", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const versions = db.packages.filter((pk: any) => pk.projectId === id)
    .sort((a: any, b: any) => b.version - a.version); // newest first
  res.json(versions);
});

app.post("/api/projects/:id/versions/:verNum/restore", (req, res) => {
  const { id, verNum } = req.params;
  const db = readDB();
  const ver = parseInt(verNum, 10);

  const matched = db.packages.find((pk: any) => pk.projectId === id && pk.version === ver);
  if (!matched) {
    return res.status(404).json({ error: "Package version not found." });
  }

  // Deactivate others, set target active
  db.packages.forEach((pk: any) => {
    if (pk.projectId === id) {
      pk.active = (pk.version === ver);
    }
  });

  writeDB(db);

  logAudit("moninilufa31@gmail.com", "Version Restored", `Restored project ${id} to Package Version ${ver}`);
  res.json({ success: true, activePackage: matched });
});


// --- 3. URL Analyze & AI Package Generation with Credit limits ---
app.post("/api/analyze-video", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const db = readDB();
  const user = db.users[0];

  // Consume credits: URL analyses consume 5 credits
  if (user) {
    if (user.credits < 5) {
      return res.status(402).json({ error: "Insufficient credits. Required: 5 XP." });
    }
    user.credits -= 5;
    db.creditsLedger.push({
      id: "ledger_" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: -5,
      action: "Video Analyzed",
      details: `Analyzed url: ${url}`,
      createdAt: new Date().toISOString()
    });
    writeDB(db);
  }

  const startTime = Date.now();
  logAudit(user?.email || "anonymous", "Video URL Submitted", `Analyzing URL: ${url}`);

  if (!ai) {
    console.warn("Using offline premium analytics engine.");
    const fallbackAnalysis = generateOfflineAnalysis(url);
    recordTelemetry(user?.id || null, "analyze", Date.now() - startTime, { url, provider: "offline" });
    return res.json(fallbackAnalysis);
  }

  try {
    const prompt = `
      You are the world's absolute best high-performance short-form video engineer, utilizing state-of-the-art Cognitive Retention Dynamics and advanced behavioral psychology.
      Analyze the following short-form video URL and return a highly detailed viral analysis breakdown report.
      URL: "${url}"
      
      Generate a valid, minified JSON object matching this TypeScript structure:
      {
        "id": "analysis_id",
        "url": "${url}",
        "platform": "YouTube Shorts",
        "title": "Extracted Title",
        "description": "Smart simulation of description",
        "transcript": "Captioned speech transcription simulation representing the high retention hook and story flow.",
        "scorecard": {
          "novelty": 8,
          "uncertainty": 7,
          "knowledgeGap": 9,
          "complexity": 6,
          "personalStakes": 8,
          "hookStrength": 9,
          "foreshadow": 8,
          "mechanism": 7,
          "twist": 9,
          "rewatchability": 8,
          "total": 81
        },
        "breakdown": {
          "hook": "Description of the hook used in first 3 seconds",
          "foreshadow": "The promised reward explicitly or implicitly given in seconds 3-8",
          "mechanism": "The visible progress tracker that keeps viewers oriented",
          "narrativeArc": "BUT -> SO progression structure explanation",
          "twist": "The unexpected climax right before the loop",
          "visualStyle": "Pacing description, overlays, formatting",
          "emotionalStakes": "What made the viewer emotionally invested",
          "platformSignals": "Aspect ratio, caption vibe"
        },
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "weaknesses": ["Improvement point 1", "Improvement point 2"],
        "styleFingerprint": {
          "editRhythm": "Fast / Rapid / High Retention cuts",
          "tone": "Suspenseful / Energetic / Mindblowing",
          "energyLevel": "High"
        }
      }

      Only output valid parseable JSON. Do not write markdown blocks or annotations. Return the JSON object directly.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const analysisObj = JSON.parse(text);
    recordTelemetry(user?.id || null, "analyze", Date.now() - startTime, { url, provider: "gemini" });
    res.json(analysisObj);
  } catch (error: any) {
    console.error("Live analysis generation failure. Using offline fallback:", error);
    const fallbackAnalysis = generateOfflineAnalysis(url);
    res.json(fallbackAnalysis);
  }
});

app.post("/api/generate-package", async (req, res) => {
  const { input, projectId } = req.body;
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  const db = readDB();
  const user = db.users[0];

  // Consume credits: Full generation packages consume 15 credits
  if (user) {
    if (user.credits < 15) {
      return res.status(402).json({ error: "Insufficient credits. Required: 15 XP." });
    }
    user.credits -= 15;
    db.creditsLedger.push({
      id: "ledger_" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: -15,
      action: "Package Generated",
      details: `Generated viral script for "${input.title}"`,
      createdAt: new Date().toISOString()
    });
    writeDB(db);
  }

  const startTime = Date.now();
  logAudit(user?.email || "anonymous", "Production Package Requested", `Generating package: ${input.title}`);

  let selectedProject = db.projects.find((p: any) => p.id === projectId);

  // Helper function to insert packages into db with correct versions
  const savePackageVersion = (pkgPayload: any) => {
    if (projectId) {
      const versions = db.packages.filter((pk: any) => pk.projectId === projectId);
      const nextVer = versions.length + 1;
      
      // Set others active = false
      db.packages.forEach((pk: any) => {
        if (pk.projectId === projectId) pk.active = false;
      });

      db.packages.push({
        id: "pack_" + Math.random().toString(36).substr(2, 9),
        projectId: projectId,
        userId: user?.id || "u_default",
        version: nextVer,
        active: true,
        createdAt: new Date().toISOString(),
        ...pkgPayload
      });
      writeDB(db);
    }
  };

  if (!ai) {
    console.warn("Using offline premium template generator engine.");
    const fallbackPackage = generateOfflinePackage(input);
    savePackageVersion(fallbackPackage);
    recordTelemetry(user?.id || null, "generate-package", Date.now() - startTime, { topic: input.title, provider: "offline" });
    return res.json(fallbackPackage);
  }

  try {
    const prompt = `
      You are the world's absolute best high-performance short-form content producer. You use live Cognitive Retention Dynamics and advanced behavioral neuroscience to engineer 100% viral short videos.
      
      Generate a complete 19-part production package + AI Video Prompt Generation schema for:
      Topic: "${input.title}"
      Niche: "${input.niche}"
      Target Platform: "${input.targetPlatform}"
      Video Length: "${input.desiredLength}"
      Audience Type: "${input.audienceType}"
      Language: "${input.language}"

      You MUST apply the "Personal Stakes Formula" (I want [X] BUT [obstacle] SO [action]) and ensure "BUT" -> "SO" storytelling. Keep the script reading at a 5th grade level or simpler.

      Make sure to calculate a realistic scorecard out of 100, where each of the 10 dimensions weighs up to 10 points:
      - Novelty
      - Uncertainty
      - Knowledge Gap
      - Complexity
      - Personal Stakes
      - Hook Strength
      - Foreshadow
      - Mechanism
      - Twist
      - Rewatchability
      
      Ensure the total is ABOVE 80 to avoid a scorecard rebuild trigger. Aim for high 85-95.
      
      Output a valid parseable JSON document conforming to the following fields:
      {
        "viralConcept": "One short paragraph detailing the emotional hook, stakes and viral psychological triggers",
        "scorecard": {
          "novelty": 9,
          "uncertainty": 8,
          "knowledgeGap": 9,
          "complexity": 8,
          "personalStakes": 9,
          "hookStrength": 10,
          "foreshadow": 9,
          "mechanism": 8,
          "twist": 9,
          "rewatchability": 9,
          "total": 88
        },
        "weakestDimensionNote": "The progress tracker can be augmented slightly for better retention.",
        "hooks": [
          { "category": "Action", "hooks": ["Action Hook 1", "Action Hook 2"] },
          { "category": "Power Word", "hooks": ["Power Word Hook 1", "Power Word Hook 2"] },
          { "category": "Curiosity Gap", "hooks": ["Curiosity Hook 1", "Curiosity Hook 2"] },
          { "category": "Emotional", "hooks": ["Emotional Hook 1", "Emotional Hook 2"] },
          { "category": "Challenge", "hooks": ["Challenge Hook 1", "Challenge Hook 2"] }
        ],
        "bestHook": {
          "hook": "The single recommended premium hook starting under 3 seconds",
          "reason": "1 sentence explain why is best hook"
        },
        "foreshadow": "The promised outcome promised in seconds 3-8",
        "mechanism": "The visible tracker (e.g. standard countdown timer, cash spent meter, life counter)",
        "script": [
          { "timeframe": "0-3s", "label": "HOOK", "text": "Hook voiceover lines, 5th grade vocabulary." },
          { "timeframe": "3-8s", "label": "FORESHADOW", "text": "Foreshadowing line promising the payoff." },
          { "timeframe": "8-12s", "label": "STORY BEAT 1", "text": "Action line introduces conflict with BUT statement." },
          { "timeframe": "12-18s", "label": "STORY BEAT 2", "text": "Action line responding with SO." },
          { "timeframe": "18-25s", "label": "STORY BEAT 3 / PEAK EMOTION", "text": "Climax vocal delivery line." },
          { "timeframe": "25-30s", "label": "MECHANISM PAYOFF", "text": "The reveal of the final progress tracker pay off." },
          { "timeframe": "30-34s", "label": "TWIST + ENDING", "text": "A sudden loop/twist line completing the narrative arc and prompting repeat." }
        ],
        "shotList": [
          { "number": 1, "angle": "Extreme Close Up", "subject": "Main presenter", "action": "Looking anxious, holding device", "duration": "3s" },
          { "number": 2, "angle": "Medium POV Shot", "subject": "Device", "action": "Timer count counting down rapidly", "duration": "5s" }
        ],
        "visualDirections": {
          "aspectRatio": "9:16 vertical",
          "safeZone": "Keep all essential texts and actions in the middle 60% vertical viewport",
          "colorPalette": "High contrast warm neon accents mixed with obsidian background matte",
          "fontStyle": "Slab sans serif bold, dynamic pops of neon yellow",
          "motionStyle": "Rapid handheld shake with subtle zoom-punches"
        },
        "retentionTriggers": [
          { "timestamp": "3s", "type": "Pattern interrupt", "detail": "Sound effect of glass shattering or sudden background color invert" },
          { "timestamp": "12s", "type": "Open loop", "detail": "Presenter looks shocked at what is inside the package" },
          { "timestamp": "20s", "type": "Emotional spike", "detail": "Tears or extreme hype with musical drop" },
          { "timestamp": "28s", "type": "Reframe", "detail": "Unexpected perspective on what the challenge was actually about" }
        ],
        "twistEnding": {
          "description": "Describe the surprise ending cleanly",
          "spokenWords": "The exact twist words that seamlessly match back to the start of the video for a perfect rewatch loop"
        },
        "easterEgg": "One hidden detail visible only to rewatchers",
        "rewatchTrigger": "Detailed element compelling immediate second viewing",
        "editingInstructions": {
          "cutRate": "7 cuts per 10 seconds",
          "musicArc": "Intense lo-fi synth building to high-energy beat drop, complete silence at peak twist climax",
          "bpmRange": "120 BPM",
          "textOverlays": "Display word-by-word pop captions, max 3 words per frame in bright white/yellow outlines",
          "soundEffects": "Whoosh transitions, sub bass drops, click accents",
          "colorGrade": "Highly saturated cinematic grading to stand out on mobile screens",
          "transitions": "Whip pans, zoom punches, hard cuts",
          "captionStyle": "Word-by-word pop overlays with emoji accents"
        },
        "thumbnailFirstFrame": {
          "subjectPosition": "Subject occupies left 40% with high-tension expression or open mouth",
          "background": "Highly saturated background with contrasting red/yellow frame highlights",
          "textOverlay": "Max 4 words curiosity gap text",
          "colorTreatment": "Glow outline on the subject to stand out"
        },
        "platformAdaptations": [
          { "platform": "TikTok", "adaptation": "Hook must land within 1.5 seconds. Recommend utilizing trending auditory track. End with stitch bait." },
          { "platform": "YouTube Shorts", "adaptation": "First frame must act as thumbnail. Add subscribe CTA at second 30." },
          { "platform": "Instagram Reels", "adaptation": "Include a shareable/saveable infographic frame. Highlight audio credit." }
        ],
        "caption": {
          "hookSentence": "The exact high-tension hook word statement.",
          "hashtags": ["viralshorts", "contentcreation", "retentionengineering", "viraldynamics"],
          "cta": "Comment your score below if you noticed the easter egg!"
        },
        "titleVariations": [
          "Title 1", "Title 2", "Title 3", "Title 4", "Title 5"
        ],
        "whyItWillGoViral": [
          "Curiosity Loop: The open loop created in the first 3 seconds forces engagement.",
          "High Stakes: Emotional investment is triggered by the presenter's personal risk.",
          "Seamless Loop: The twist ending ties directly back into the opening word for a rewatch score multiplier."
        ],
        "masterStylePrompt": "Cinematic vertical video, hyperrealistic 4K quality, intense color depth, shallow depth of field, high-energy pacing, vivid color grading, realistic vlog-style camera movement.",
        "sceneVideoPrompts": [
          {
            "sceneNo": 1,
            "shotName": "HOOK Scene",
            "durationSeconds": 3,
            "visualPrompt": "A dynamic 4K close-up of a content creator looking astonished and displaying a glowing countdown timer, hyper-detailed skin textures, depth of field.",
            "cameraMovement": "Slow push-in transition",
            "lighting": "Golden Hour dramatic lighting",
            "moodAndEnergy": "Excited and urgent tension",
            "styleReference": "Cinematic vlog quality",
            "negativePrompt": "no 3D anime, cartoon, text watermark, slow shutter lag"
          }
        ],
        "audioDirections": {
          "genre": "Suspenseful upbeat electronic synth with deep lo-fi sub bass",
          "energyArc": "Calm, rising tension through middle story, and explosive drop at the twisted climax",
          "bpmRange": "115-125 BPM",
          "keyMoment": "Vocal pause and bass drops exactly at 25 seconds for the maximum emotional spike"
        }
      }

      Strictly ensure you return valid JSON representing ALL 19 components and the AI Video Prompts.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedPackage = JSON.parse(response.text || "{}");

    // Normalizations
    const normalized = {
      title: parsedPackage.title || input.title || "Untitled Package",
      viralConcept: parsedPackage.viralConcept || `Deep psychological viral blueprint regarding "${input.title}".`,
      whyItWillGoViral: parsedPackage.whyItWillGoViral || [
        "Curiosity Loop holds initial retention",
        "Seamless loop maintains second-cycle metrics"
      ],
      scorecard: {
        novelty: parsedPackage.scorecard?.novelty || 8,
        uncertainty: parsedPackage.scorecard?.uncertainty || 8,
        knowledgeGap: parsedPackage.scorecard?.knowledgeGap || 8,
        complexity: parsedPackage.scorecard?.complexity || 8,
        personalStakes: parsedPackage.scorecard?.personalStakes || 8,
        hookStrength: parsedPackage.scorecard?.hookStrength || 8,
        foreshadow: parsedPackage.scorecard?.foreshadow || 8,
        mechanism: parsedPackage.scorecard?.mechanism || 8,
        twist: parsedPackage.scorecard?.twist || 8,
        rewatchability: parsedPackage.scorecard?.rewatchability || 8,
        total: parsedPackage.scorecard?.total || 80,
        viralityProbability: parsedPackage.scorecard?.viralityProbability || Math.min(99, Math.round((parsedPackage.scorecard?.total || 80) * 1.05)),
        retentionProbability: parsedPackage.scorecard?.retentionProbability || Math.min(98, Math.round((parsedPackage.scorecard?.total || 80) * 0.98))
      },
      weakestDimensionNote: parsedPackage.weakestDimensionNote || "The visual stimulus frequency can be increased slightly in the first 8 seconds.",
      
      research: parsedPackage.research || {
        hiddenFacts: parsedPackage.hiddenFacts || [
          `Secret platform metrics show high interest in topics relating to "${input.title}".`
        ],
        surprisingStatistics: parsedPackage.surprisingStatistics || [
          "92% of scrollers make swipe decisions in the first 1.5 seconds."
        ],
        contrarianViewpoints: parsedPackage.contrarianViewpoints || [
          "Simplicity is skipped; high-intensity visual obstacles demand explanation."
        ],
        controversies: [
          "Platform algorithms prioritize high pattern interrupts over gentle instruction."
        ],
        mechanisms: [
          "The 'Countdown Loom': Displaying a live tick-counter at secondary display depth."
        ],
        emotionalTriggers: [
          "Curiosity tension when answers are delayed past the 25s threshold."
        ]
      },
      narrative: parsedPackage.narrative || {
        coreNarrative: parsedPackage.viralConcept || `A high-tension journey exploring the hidden paradoxes of "${input.title}".`,
        decisiveHook: parsedPackage.bestHook?.hook || parsedPackage.hooks?.[0]?.hooks?.[0] || `They lied to us about "${input.title}"...`,
        hookVariations: parsedPackage.hooks || [
          { category: "Curiosity", hooks: [`The actual reality of "${input.title}" is terrifying...`] }
        ],
        foreshadowPromise: parsedPackage.foreshadow || "I will demonstrate the physical proof at second 25.",
        runtimeTracker: parsedPackage.mechanism || "A progress bar running 0-100% horizontally.",
        openLoops: parsedPackage.whyItWillGoViral || ["The true source of this metric."]
      },
      screenplay: (parsedPackage.screenplay || parsedPackage.script || []).map((s: any) => ({
        timeframe: s.timeframe || "0-3s Hook",
        label: s.label || "NARRATIVE ACCENT",
        voiceover: s.voiceover || s.text || "Voiceover placeholder text.",
        visualDirection: s.visualDirection || s.action || "Dynamic camera shot matching voice pacing.",
        psychologyAnchor: s.psychologyAnchor || "Pattern Intention Offset"
      })),
      productionBlueprint: parsedPackage.productionBlueprint || {
        cameraAngles: parsedPackage.visualDirections?.cameraAngles || [
          "Extreme Close Up (Presenter face & mic)"
        ],
        shotList: (parsedPackage.shotList || []).map((shot: any) => ({
          number: shot.number || 1,
          angle: shot.angle || "Medium shot",
          subject: shot.subject || "Presenter",
          action: shot.action || "Demonstrates active mystery",
          duration: shot.duration || "4s"
        })),
        lightingDesign: "Primary high-contrast spotlight side key with custom color transitions.",
        colorGrade: "Obsidian dark matte, deep colors, optimized for dynamic mobile displays.",
        motionDirections: parsedPackage.visualDirections?.motionStyle || "Rapid zoom punches.",
        editingInstructions: parsedPackage.editingInstructions || {
          cutRate: "8 cuts per 10s",
          musicArc: "Industrial dark synth rising",
          bpmRange: "124 BPM",
          textOverlays: "Active POP word captions",
          soundEffects: "Sub-bass hits, transition whooshes",
          colorGrade: "Obsidian dark matte",
          transitions: "Whip pans",
          captionStyle: "Centered active pop"
        },
        musicArc: parsedPackage.audioDirections?.musicArc || "Low hum rising",
        sfxCues: parsedPackage.audioDirections?.soundEffects || ["Whoosh on each timeline cut"]
      },
      aiVideoPrompts: parsedPackage.aiVideoPrompts || {
        masterStyle: parsedPackage.masterStylePrompt || "Cinematic 4K vertical footage, moody studio lighting, glowing green keytones, photorealistic.",
        veo: `[Veo-v2-optimized] Professional vertical video of a creator in a dark studio. Side-lit with emerald neon green. 4k.`,
        kling: `[Kling-v1.5] Hyperrealistic 8k cinematic vertical scene of a hand holding a feedback count device.`,
        runway: `[Runway-Gen3] Vertical masterpiece of an elite presenter whispering into studio mic.`,
        sora: `[Sora-optimized] Cinematic 4K vertical footage workspace.`,
        scenePrompts: (parsedPackage.sceneVideoPrompts || []).map((s: any) => ({
          sceneNo: s.sceneNo || 1,
          shotName: s.shotName || "Scene",
          durationSeconds: s.durationSeconds || 4,
          veoPrompt: s.visualPrompt ? `[Veo] ${s.visualPrompt}` : "Veo prompt",
          klingPrompt: s.visualPrompt ? `[Kling] ${s.visualPrompt}` : "Kling prompt",
          runwayPrompt: s.visualPrompt ? `[Runway] ${s.visualPrompt}` : "Runway prompt",
          soraPrompt: s.visualPrompt ? `[Sora] ${s.visualPrompt}` : "Sora prompt",
          negativePrompt: s.negativePrompt || "low resolution, blurry"
        }))
      },
      platformOptimization: parsedPackage.platformOptimization || {
        tiktokStrategy: parsedPackage.platformAdaptations?.find((p: any) => p.platform === "TikTok")?.adaptation || "Land hook in first 1.1s. Trend sound.",
        instagramStrategy: parsedPackage.platformAdaptations?.find((p: any) => p.platform === "Instagram Reels")?.adaptation || "Highlight infographic elements.",
        youtubeShortsStrategy: parsedPackage.platformAdaptations?.find((p: any) => p.platform === "YouTube Shorts")?.adaptation || "CTA at second 30.",
        facebookReelsStrategy: "Optimize for silent viewers.",
        captionSet: {
          hookSentence: parsedPackage.caption?.hookSentence || `They lied to us about "${input.title}"...`,
          hashtags: parsedPackage.caption?.hashtags || ["shorts", "creators"],
          cta: parsedPackage.caption?.cta || "Comment below! 👇"
        }
      },
      
      // Mapped directly to types.ts flat UI values
      bestHook: parsedPackage.bestHook || {
        hook: parsedPackage.bestHook?.hook || `Most content about "${input.title}" is a complete lie...`,
        reason: "Profounds curiosity instantly."
      },
      foreshadow: parsedPackage.foreshadow || "I will demonstrate the physical proof at second 25.",
      mechanism: parsedPackage.mechanism || "A progress percentage countdown bar.",
      script: (parsedPackage.screenplay || parsedPackage.script || []).map((s: any) => ({
        timeframe: s.timeframe || "0-3s",
        label: s.label || "HOOK",
        text: s.text || s.voiceover || `They lied to you about "${input.title}"...`
      })),
      shotList: (parsedPackage.shotList || []).map((s: any) => ({
        number: s.number || 1,
        angle: s.angle || "Extreme MCU",
        subject: s.subject || "Presenter",
        action: s.action || "Active gaze into zoom lens.",
        duration: s.duration || "3s"
      })),
      hooks: parsedPackage.hooks || [
        { category: "Action", hooks: [`Stop scrolling if you do ${input.title}...`] }
      ],
      visualDirections: parsedPackage.visualDirections || {
        aspectRatio: "9:16 vertical",
        safeZone: "Keep texts in middle 60%",
        colorPalette: "Neon pops + obsidian",
        fontStyle: "Modern display block, vibrant captions",
        motionStyle: "Active handheld dynamic shakes"
      },
      retentionTriggers: parsedPackage.retentionTriggers || [
        { timestamp: "3s", type: "Pattern interrupt", detail: "Sound effect & background inverts" }
      ],
      editingInstructions: parsedPackage.editingInstructions || {
        cutRate: "8 cuts / 10s",
        musicArc: "Cinematic industrial dark-synth theme",
        bpmRange: "124 BPM",
        textOverlays: "Dynamic popped bold headings",
        soundEffects: "Sub-bass hits, custom swooshes",
        colorGrade: "Carbon matte high OLED saturation",
        transitions: "Whip pans, digital zoom zooms",
        captionStyle: "Centered active text pop"
      },
      masterStylePrompt: parsedPackage.masterStylePrompt || "Moody vertical visual style.",
      sceneVideoPrompts: (parsedPackage.sceneVideoPrompts || []).map((s: any, i: number) => ({
        sceneNo: s.sceneNo || (i + 1),
        shotName: s.shotName || "Scene",
        durationSeconds: s.durationSeconds || 4,
        visualPrompt: s.visualPrompt || s.veoPrompt || "Surprised content creator.",
        cameraMovement: s.cameraMovement || "Slow push",
        lighting: s.lighting || "Neon glow",
        moodAndEnergy: s.moodAndEnergy || "Tense and urgent",
        styleReference: s.styleReference || "Vlog style",
        negativePrompt: s.negativePrompt || "cartoon, low contrast"
      })),
      audioDirections: parsedPackage.audioDirections || {
        genre: "Upbeat energetic synth theme",
        energyArc: "Tense rising soundscapes with climax",
        bpmRange: "120 BPM",
        keyMoment: "Sub-bass drops at second 25"
      },
      titleVariations: parsedPackage.titleVariations || [
        `${input.title} Secrets Out`
      ],
      platformAdaptations: parsedPackage.platformAdaptations || [
        { platform: "TikTok", adaptation: "Hook in 1s." }
      ],
      caption: parsedPackage.caption || {
        hookSentence: `They lied to us about "${input.title}"...`,
        hashtags: ["viralshorts"],
        cta: "Comment your thoughts below! 👇"
      },
      thumbnailPsychology: parsedPackage.thumbnailPsychology || {
        ctrAnalysis: parsedPackage.thumbnailFirstFrame?.ctrAnalysis || "Predictive CTR of 8.9% - 12.3% within target video feeds.",
        attentionTrigger: parsedPackage.thumbnailFirstFrame?.attentionTrigger || "High tension shock facial expression with saturated green aura overlay.",
        headline: parsedPackage.thumbnailFirstFrame?.textOverlay || `The Dark secret of ${input.title}`,
        layout: parsedPackage.thumbnailFirstFrame?.subjectPosition || "Face on the left 45% of the frame, high-impact yellow block headline on the right side."
      }
    };

    savePackageVersion(normalized);
    recordTelemetry(user?.id || null, "generate-package", Date.now() - startTime, { topic: input.title, provider: "gemini" });
    res.json(normalized);
  } catch (error: any) {
    console.error("Live package generation failure. Using offline fallback:", error);
    const fallbackPackage = generateOfflinePackage(input);
    savePackageVersion(fallbackPackage);
    res.json(fallbackPackage);
  }
});


// --- 4. Multi-Format Export Engine ---
app.get("/api/projects/:id/export/:format", (req, res) => {
  const { id, format } = req.params;
  const db = readDB();
  const user = db.users[0];

  const proj = db.projects.find((p: any) => p.id === id);
  if (!proj) {
    return res.status(404).json({ error: "Project not found" });
  }

  const activePackage = db.packages.find((pk: any) => pk.projectId === id && pk.active === true);
  if (!activePackage) {
    return res.status(400).json({ error: "No active package available for download." });
  }

  const pack = activePackage;
  let responseText = "";
  let fileType = "text/plain";
  let ext = "txt";

  if (format === 'json') {
    responseText = JSON.stringify({ project: proj, package: pack }, null, 2);
    fileType = "application/json";
    ext = "json";
  } else if (format === 'md') {
    responseText = `# PRODUCTION SPECIFICATION: ${proj.title.toUpperCase()}\n\n`;
    responseText += `## CONCEPT BLUUPRINT\n${pack.viralConcept}\n\n`;
    responseText += `## RETENTION SCORECARD: ${pack.scorecard.total}/100\n`;
    responseText += `- Novelty: ${pack.scorecard.novelty}/10\n`;
    responseText += `- Uncertainty: ${pack.scorecard.uncertainty}/10\n`;
    responseText += `- Knowledge Gap: ${pack.scorecard.knowledgeGap}/10\n`;
    responseText += `- Hook Strength: ${pack.scorecard.hookStrength}/10\n`;
    responseText += `- Rewatchability: ${pack.scorecard.rewatchability}/10\n\n`;
    responseText += `## BEST HOOK OPTIMIZATION\n"${pack.bestHook.hook}"\nReason: ${pack.bestHook.reason}\n\n`;
    responseText += `## THE FORESHADOW PROMISE\n"${pack.foreshadow}"\n\n`;
    responseText += `## FULL PRODUCTION SCREENPLAY\n`;
    pack.script.forEach((s: any) => {
      responseText += `[${s.timeframe}] **${s.label}**: ${s.text}\n`;
    });
    fileType = "text/markdown";
    ext = "md";
  } else if (format === 'pdf') {
    // Elegant Print-ready high-fidelity HTML layout served for print-to-pdf pipelines
    // Keeps dependencies light and extremely reliable.
    responseText = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PLOTIQO PRODUCTION BRIEF: ${proj.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; background: #ffffff; line-height: 1.6; }
          .header { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: 800; color: #065f46; margin: 0; }
          .meta { font-size: 11px; font-weight: bold; color: #6b7280; font-family: monospace; text-transform: uppercase; margin-top: 5px; }
          .badge { display: inline-block; padding: 4px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-weight: bold; font-size: 11px; border-radius: 4px; margin-top: 15px; }
          h2 { font-size: 18px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.5px; }
          .script-line { margin-bottom: 12px; font-size: 13px; }
          .script-time { font-family: monospace; font-weight: bold; color: #10b981; margin-right: 10px; }
          .score-card { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 15px; margin-top: 15px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .score-item { font-size: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
          .prompts { background: #f9fafb; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${proj.title}</div>
          <div class="meta">Viral Script Specification Brief &bull; Synced from Plotiqo DB</div>
          <div class="badge">Score: ${pack.scorecard.total}/100 Grade: VIP</div>
        </div>

        <h2>Viral Narrative Concept</h2>
        <p>${pack.viralConcept}</p>

        <h2>Scorecard Diagnostics</h2>
        <div class="score-card">
          <div class="score-item">Novelty: <strong>${pack.scorecard.novelty}/10</strong></div>
          <div class="score-item">Uncertainty: <strong>${pack.scorecard.uncertainty}/10</strong></div>
          <div class="score-item">Knowledge Gap: <strong>${pack.scorecard.knowledgeGap}/10</strong></div>
          <div class="score-item">Hook Strength: <strong>${pack.scorecard.hookStrength}/10</strong></div>
          <div class="score-item">Rewatchability: <strong>${pack.scorecard.rewatchability}/10</strong></div>
          <div class="score-item">Overall Score: <strong>${pack.scorecard.total}/100</strong></div>
        </div>

        <h2>Dual Timeline Screenplay</h2>
        <div style="margin-top: 15px;">
        ${pack.script.map((s: any) => `
          <div class="script-line">
            <span class="script-time">[${s.timeframe}]</span>
            <strong>${s.label}:</strong> ${s.text}
          </div>
        `).join('')}
        </div>

        <h2>AI Video Generation Prompts</h2>
        <div class="prompts">
          <strong>Master Prompt:</strong> ${pack.masterStylePrompt || "A vertical cinematography master template."}
          <br/><br/>
          <strong>Veo Tool:</strong> ${pack.aiVideoPrompts?.veo || ""}
          <br/>
          <strong>Kling Tool:</strong> ${pack.aiVideoPrompts?.kling || ""}
        </div>
      </body>
      </html>
    `;
    fileType = "text/html"; // Direct display printed visual HTML layout for immediate printing to PDF!
    ext = "html";
  } else {
    // standard txt format
    responseText = `PLOTIQO VIRAL SCRIPT SPEC BRIEF: ${proj.title.toUpperCase()}\n`;
    responseText += `===========================================================\n\n`;
    responseText += `SCORECARD: ${pack.scorecard.total}/100\n\n`;
    responseText += `SCRIPT VOICE OVER BEATS:\n`;
    pack.script.forEach((s: any) => {
      responseText += `[${s.timeframe}] ${s.label}: ${s.text}\n`;
    });
    fileType = "text/plain";
    ext = "txt";
  }

  logAudit("moninilufa31@gmail.com", "Export Triggered", `Exported blueprint in [${format.toUpperCase()}] format.`);
  recordTelemetry(user?.id || null, "export", 10, { format });

  res.setHeader("Content-Disposition", `attachment; filename=${proj.title.replace(/\s+/g, '_')}_package.${ext}`);
  res.setHeader("Content-Type", fileType);
  res.send(responseText);
});


// --- 5. Advanced Administrator Panels & Metrics ---
app.get("/api/admin/users", (req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.post("/api/admin/users/:id/credits", (req, res) => {
  const { id } = req.params;
  const { credits } = req.body;
  const db = readDB();

  const target = db.users.find((u: any) => u.id === id);
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }

  const oldCredits = target.credits;
  target.credits = parseInt(credits, 10);
  writeDB(db);

  logAudit("admin@plotiqo.com", "Manual Credit top-up", `Adjusted user ${target.email} credits from ${oldCredits} to ${target.credits}`);
  res.json({ success: true, user: target });
});

app.post("/api/admin/users/:id/plan", (req, res) => {
  const { id } = req.params;
  const { plan } = req.body;
  const db = readDB();

  const target = db.users.find((u: any) => u.id === id);
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }

  const oldPlan = target.plan;
  target.plan = plan;
  target.credits = PLAN_LIMITS[plan]?.credits || 10;
  writeDB(db);

  logAudit("admin@plotiqo.com", "Admin Plan Overdrive", `Shifted plan for ${target.email} from ${oldPlan} to ${plan}`);
  res.json({ success: true, user: target });
});

app.get("/api/admin/analytics", (req, res) => {
  const db = readDB();
  const usersCount = db.users.length;
  const projectsCount = db.projects.length;
  
  // Advanced MRR Engine: Aggregates stripe billing tiers dynamically
  let mrr = 0;
  let keys = 0;
  db.users.forEach((u: any) => {
    const limits = PLAN_LIMITS[u.plan] || { price: 0 };
    mrr += limits.price;
    if (u.plan !== 'free') keys++;
  });

  res.json({
    totalUsers: usersCount,
    totalProjects: projectsCount,
    activeSubscriptions: keys,
    monthlyRevenue: mrr,
    recentLogs: db.auditLogs || []
  });
});


// --- 6. Stripe Simulation checkout endpoints ---
app.post("/api/stripe/checkout", (req, res) => {
  const { planEmail, desiredPlan } = req.body;
  const dEmail = planEmail || "moninilufa31@gmail.com";
  const dPlan = desiredPlan || "pro";

  const db = readDB();
  const target = db.users.find((u: any) => u.email.toLowerCase() === dEmail.toLowerCase());
  
  if (!target) {
    return res.status(404).json({ error: "User session email matching failed." });
  }

  // Set checkout plan
  target.plan = dPlan;
  target.credits = PLAN_LIMITS[dPlan]?.credits || 10;
  target.stripeSubscriptionId = "sub_stripe_" + Math.random().toString(36).substr(2, 9);
  writeDB(db);

  logAudit(target.email, "Stripe Checkout Initiated", `Purchased subscription plan [${dPlan.toUpperCase()}] via Simulated Credit Terminal.`);
  recordTelemetry(target.id, "stripe", 65, { checkoutPlan: dPlan });

  res.json({ success: true, user: target });
});


// --- Start Server via Compliant Vite Middleware setup ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express fully started on port ${PORT}`);
  });
}

startServer();
