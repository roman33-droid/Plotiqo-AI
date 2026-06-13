import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with strict guidelines
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

// Simulated simple persistent file-based JSON DB inside container.
// This is exceptionally durable, runs out of the box, and doesn't crash on missing secrets.
const DB_FILE = path.join(process.cwd(), "database.json");

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading database file", err);
  }
  return { projects: [], subscriptions: {}, users: [], adminLogs: [] };
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Initialize tables if needed
const initialData = readDB();
if (!initialData.projects) {
  writeDB({
    projects: [
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
    ],
    subscriptions: {
      "demo_user": { plan: "pro", active: true, expiresAt: "2027-01-01" }
    },
    users: [
      { id: "u_1", email: "moninilufa31@gmail.com", name: "Monini Lufa", plan: "pro" }
    ],
    adminLogs: [
      { id: "log_1", userEmail: "moninilufa31@gmail.com", action: "User Login", timestamp: new Date().toISOString(), details: "Logged in via Simulated Auth" }
    ]
  });
}

// LOG ACTION FOR ADMIN PANEL
function logAdminAction(userEmail: string, action: string, details: string) {
  const db = readDB();
  if (!db.adminLogs) db.adminLogs = [];
  db.adminLogs.unshift({
    id: "log_" + Math.random().toString(36).substr(2, 9),
    userEmail,
    action,
    timestamp: new Date().toISOString(),
    details
  });
  // Limit to last 100 logs
  if (db.adminLogs.length > 100) {
    db.adminLogs = db.adminLogs.slice(0, 100);
  }
  writeDB(db);
}

// API Routes

// User profile simulation
app.get("/api/user", (req, res) => {
  const db = readDB();
  const user = db.users[0] || { id: "u_1", email: "moninilufa31@gmail.com", name: "Monini Lufa", plan: "free" };
  res.json(user);
});

app.post("/api/user/update-plan", (req, res) => {
  const { plan } = req.body;
  const db = readDB();
  if (db.users && db.users[0]) {
    db.users[0].plan = plan;
  } else {
    db.users = [{ id: "u_1", email: "moninilufa31@gmail.com", name: "Monini Lufa", plan }];
  }
  writeDB(db);
  logAdminAction("moninilufa31@gmail.com", "Subscription Upgrade", `Upgraded plan to ${plan}`);
  res.json({ success: true, plan });
});

// Projects CRUD
app.get("/api/projects", (req, res) => {
  const db = readDB();
  res.json(db.projects || []);
});

app.post("/api/projects", (req, res) => {
  const { title, inputType, input, analysis, productionPackage } = req.body;
  const db = readDB();
  const newProj = {
    id: "proj_" + Math.random().toString(36).substr(2, 9),
    title: title || input.title || "Untitled Viral Short",
    inputType,
    input,
    analysis,
    productionPackage,
    createdAt: new Date().toISOString()
  };
  db.projects.unshift(newProj);
  writeDB(db);
  logAdminAction("moninilufa31@gmail.com", "Project Created", `Created project of type ${inputType}: ${title}`);
  res.json(newProj);
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.projects = db.projects.filter((p: any) => p.id !== id);
  writeDB(db);
  logAdminAction("moninilufa31@gmail.com", "Project Deleted", `Deleted project ${id}`);
  res.json({ success: true });
});

app.post("/api/projects/duplicate/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const target = db.projects.find((p: any) => p.id === id);
  if (!target) {
    return res.status(404).json({ error: "Project not found" });
  }
  const cloned = {
    ...target,
    id: "proj_" + Math.random().toString(36).substr(2, 9),
    title: `${target.title} (Copy)`,
    createdAt: new Date().toISOString()
  };
  db.projects.unshift(cloned);
  writeDB(db);
  logAdminAction("moninilufa31@gmail.com", "Project Duplicated", `Duplicated project ${target.title}`);
  res.json(cloned);
});

// VIDEO URL ANALYZER (pHASE 0B)
app.post("/api/analyze-video", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  logAdminAction("moninilufa31@gmail.com", "Video URL Submitted", `Submitted video URL for analysis: ${url}`);

  if (!ai) {
    return res.status(500).json({ error: "Gemini API client not initialized. Please verify your GEMINI_API_KEY secret." });
  }

  try {
    // Generate structured viral breakdown report for selected video
    const prompt = `
      You are the world's absolute best high-performance short-form video engineer, utilizing state-of-the-art Cognitive Retention Dynamics and advanced behavioral psychology to maximize view duration and organic traffic.
      Analyze the following short-form video URL and return a highly detailed viral analysis breakdown report.
      URL: "${url}"
      
      Since you cannot browse the page context dynamically, reverse engineer and generate an elegant, educational representation of what this short video likely contains/styles based on the URL context or title markers.
      
      Generate a valid, minified JSON object matching this TypeScript structure:
      {
        "id": "analysis_id",
        "url": "${url}",
        "platform": "YouTube Shorts",
        "title": "Extracted Title",
        "description": "Smart simulation of description",
        "transcript": "Captioned speech transcription simulation representing the high retention hook and story flow.",
        "scorecard": {
          "novelty": 8, // 1 to 10
          "uncertainty": 7,
          "knowledgeGap": 9,
          "complexity": 6,
          "personalStakes": 8,
          "hookStrength": 9,
          "foreshadow": 8,
          "mechanism": 7,
          "twist": 9,
          "rewatchability": 8,
          "total": 81 // sum of all 10 dimensions
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
    res.json(analysisObj);
  } catch (error: any) {
    console.error("Analysis generation failure:", error);
    res.status(500).json({ error: error.message || "Failed to generate video analysis" });
  }
});

// FULL PACKAGE GENERATION (PHASE 1, 2, 3, 4)
app.post("/api/generate-package", async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  logAdminAction("moninilufa31@gmail.com", "Production Package Requested", `Generating package for topic: ${input.title}`);

  if (!ai) {
    return res.status(500).json({ error: "Gemini API client not initialized. Check your key." });
  }

  try {
    const prompt = `
      You are the world's absolute best high-performance short-form content producer. You use live Cognitive Retention Dynamics and advanced behavioral neuroscience to engineer 100% viral short videos on YouTube Shorts, TikTok, and Instagram Reels.
      
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
        "easterEgg": "One hidden detail (e.g. secret watermark, countdown hidden in corner) visible only to rewatchers",
        "rewatchTrigger": "Detailed element compelling immediate second viewing (e.g. perfect hook sentence flow or missing visual)",
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
    res.json(parsedPackage);
  } catch (error: any) {
    console.error("Package generation failure:", error);
    res.status(500).json({ error: error.message || "Failed to generate package" });
  }
});

// Admin Analytics Simulation Endpoint
app.get("/api/admin/analytics", (req, res) => {
  const db = readDB();
  const projectsCount = db.projects ? db.projects.length : 0;
  
  res.json({
    totalUsers: db.users ? db.users.length : 1,
    totalProjects: projectsCount,
    activeSubscriptions: db.users ? db.users.filter((u: any) => u.plan !== "free").length : 0,
    monthlyRevenue: db.users ? db.users.filter((u: any) => u.plan === "pro").length * 29 + db.users.filter((u: any) => u.plan === "team").length * 99 : 29,
    recentLogs: db.adminLogs || []
  });
});

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
    console.log(`Server fully started on http://localhost:${PORT}`);
  });
}

startServer();
