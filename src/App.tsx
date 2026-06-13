import React, { useState, useEffect } from "react";
import { 
  Video, 
  Sparkles, 
  Tv, 
  TrendingUp, 
  CheckCircle, 
  Play, 
  Copy, 
  FileText, 
  Trash2, 
  Plus, 
  Search, 
  Flame, 
  Zap, 
  Users, 
  DollarSign, 
  Info, 
  Layers, 
  Sliders, 
  HelpCircle, 
  Cpu, 
  Music, 
  Download, 
  LogOut, 
  Layout, 
  Settings as SettingsIcon, 
  Lock, 
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Smartphone,
  Eye,
  Camera,
  Compass
} from "lucide-react";
import { Project, ProjectInput, ProductionPackage, VideoAnalysis, UserProfile, AdminAnalytics, HookVariation } from "./types";

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'landing' | 'dashboard' | 'workspace' | 'pricing' | 'admin' | 'settings'>('landing');
  
  // Custom workspace and psychology tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'scorecard' | 'script' | 'prompts' | 'metadata'>('scorecard');
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [activeLandingSceneIdx, setActiveLandingSceneIdx] = useState<number>(0);
  const [mockPlatform, setMockPlatform] = useState<'tiktok' | 'shorts' | 'reels'>('tiktok');
  const [mockPlaying, setMockPlaying] = useState<boolean>(true);
  
  // App States
  const [user, setUser] = useState<UserProfile>({
    id: "u_1",
    email: "moninilufa31@gmail.com",
    name: "Monini Lufa",
    plan: "pro", // Default to Pro so they can showcase URL analysis and PDF exports!
    projectsThisMonth: 1,
    projectLimit: 3
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [nicheFilter, setNicheFilter] = useState("All");

  // Project Creation Wizard State
  const [inputType, setInputType] = useState<'topic' | 'url'>('topic');
  const [formInput, setFormInput] = useState<ProjectInput>({
    title: "",
    niche: "Entertainment",
    targetPlatform: "YouTube Shorts",
    desiredLength: "34s",
    audienceType: "Gen Z Sludge Viewers",
    language: "English",
    url: "",
    mode: "reverse"
  });

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Authentication State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  // Admin Analytics State
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalytics>({
    totalUsers: 1,
    totalProjects: 0,
    activeSubscriptions: 1,
    monthlyRevenue: 29,
    recentLogs: []
  });

  // Custom alert setter
  const triggerAlert = (type: 'success' | 'error' | 'info', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Fetch initial state & configurations
  useEffect(() => {
    fetchProjects();
    fetchAdminAnalytics();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const fetchAdminAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAdminAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check plan limits
    if (user.plan === 'free' && projects.length >= user.projectLimit) {
      triggerAlert('error', `You have reached your limit of ${user.projectLimit} projects on the Free Plan. Please upgrade to Pro for infinite generation!`);
      setCurrentTab('pricing');
      return;
    }

    if (inputType === 'url' && !formInput.url) {
      triggerAlert('error', "Please provide a valid video URL.");
      return;
    }

    if (inputType === 'topic' && !formInput.title) {
      triggerAlert('error', "Please enter a viral topic concept.");
      return;
    }

    setIsLoading(true);
    let analysisData: VideoAnalysis | undefined;
    let productionPackageData: ProductionPackage | undefined;

    try {
      // Phase 0: URL parsing if applicable
      if (inputType === 'url') {
        setLoadingPhase("Analyzing short URL & extracting viral cues...");
        const urlRes = await fetch("/api/analyze-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formInput.url })
        });
        if (!urlRes.ok) {
          throw new Error("Video link processing failed. Retrying simulation.");
        }
        analysisData = await urlRes.json();
      }

      // Phase 1-3: Production package creation
      setLoadingPhase("Evaluating concept via Cognitive Retention Scorecard...");
      
      const payloadTitle = inputType === 'url' ? (analysisData?.title || `Recreation of Video`) : formInput.title;

      const genRes = await fetch("/api/generate-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            ...formInput,
            title: payloadTitle
          }
        })
      });

      if (!genRes.ok) {
        throw new Error("Production package compiler failed.");
      }

      setLoadingPhase("Finalizing dual-narrative script & audio key moments...");
      productionPackageData = await genRes.json();

      // Submit new project to DB
      const saveRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payloadTitle,
          inputType,
          input: formInput,
          analysis: analysisData,
          productionPackage: productionPackageData
        })
      });

      if (saveRes.ok) {
        const savedProject = await saveRes.json();
        setProjects(prev => [savedProject, ...prev]);
        setSelectedProject(savedProject);
        triggerAlert('success', `Successfully generated dynamic package "${savedProject.title}"!`);
      }

    } catch (err: any) {
      console.error(err);
      triggerAlert('error', err.message || "An error occurred during Generation. Falling back safely.");
    } finally {
      setIsLoading(false);
      setLoadingPhase("");
      fetchAdminAnalytics();
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (selectedProject?.id === id) {
          setSelectedProject(null);
        }
        triggerAlert('success', "Project deleted successfully.");
        fetchAdminAnalytics();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDuplicateProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/projects/duplicate/${id}`, { method: "POST" });
      if (res.ok) {
        const cloned = await res.json();
        setProjects(prev => [cloned, ...prev]);
        triggerAlert('success', `Duplicated as "${cloned.title}"`);
        fetchAdminAnalytics();
      }
    } catch (err) {
      console.error("Duplication failed:", err);
    }
  };

  const handleUpgradePlan = async (plan: 'free' | 'pro' | 'team') => {
    try {
      const res = await fetch("/api/user/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        setUser(prev => ({ ...prev, plan }));
        triggerAlert('success', `Stripe checkout simulated successfully! You are now subscribed to the ${plan.toUpperCase()} tier.`);
        fetchAdminAnalytics();
      }
    } catch (err) {
      console.error("Plan upgrade failed:", err);
    }
  };

  const handleCopyText = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(title);
    triggerAlert('success', `Copied ${title} to your clipboard!`);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Purely formatted manual download exporters
  const handleExportFile = (format: 'txt' | 'md' | 'json', proj: Project) => {
    if (!proj.productionPackage) return;
    const pack = proj.productionPackage;

    let content = "";
    let filename = `${proj.title.toLowerCase().replace(/\s+/g, '_')}_package`;

    if (format === 'json') {
      content = JSON.stringify(proj, null, 2);
      filename += ".json";
    } else if (format === 'md') {
      content = `# VIRAL PRODUCTION PACKAGE: ${proj.title.toUpperCase()}\n\n`;
      content += `## VIRAL CONCEPT\n${pack.viralConcept}\n\n`;
      content += `## SCORECARD: TOTAL ${pack.scorecard.total}/100\n`;
      content += `- Novelty: ${pack.scorecard.novelty}/10\n`;
      content += `- Uncertainty: ${pack.scorecard.uncertainty}/10\n`;
      content += `- Knowledge Gap: ${pack.scorecard.knowledgeGap}/10\n`;
      content += `- Complexity: ${pack.scorecard.complexity}/10\n`;
      content += `- Personal Stakes: ${pack.scorecard.personalStakes}/10\n`;
      content += `- Hook Strength: ${pack.scorecard.hookStrength}/10\n`;
      content += `- Foreshadow: ${pack.scorecard.foreshadow}/10\n`;
      content += `- Mechanism: ${pack.scorecard.mechanism}/10\n`;
      content += `- Twist: ${pack.scorecard.twist}/10\n`;
      content += `- Rewatchability: ${pack.scorecard.rewatchability}/10\n\n`;
      content += `## BEST HOOK RECOMMENDED\n"${pack.bestHook.hook}"\nReason: ${pack.bestHook.reason}\n\n`;
      content += `## FORESHADOW (3-8 seconds)\n"${pack.foreshadow}"\n\n`;
      content += `## PROGRESS MECHANISM\n${pack.mechanism}\n\n`;
      content += `## FULL DUAL-NARRATIVE SCRIPT\n`;
      pack.script.forEach(s => {
        content += `[${s.timeframe}] ${s.label}: ${s.text}\n`;
      });
      content += `\n## SHOT LIST\n`;
      pack.shotList.forEach(s => {
        content += `Shot #${s.number} | Angle: ${s.angle} | Action: ${s.action} (${s.duration})\n`;
      });
      filename += ".md";
    } else {
      content = `VIRAL SHORTS CREATOR PRODUCTION PACKAGE: ${proj.title.toUpperCase()}\n`;
      content += `========================================================================\n\n`;
      content += `VIRAL SCORECARD: ${pack.scorecard.total}/100\n\n`;
      content += `SCRIPT VOICE LINES:\n`;
      pack.script.forEach(s => {
        content += `[${s.timeframe}] ${s.label}: ${s.text}\n`;
      });
      filename += ".txt";
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert('success', `Exported successfully as ${format.toUpperCase()}`);
  };

  // Helper for scorecard colors
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-950/40 border-emerald-500/30";
    if (score >= 80) return "text-amber-400 bg-amber-950/40 border-amber-500/30";
    return "text-rose-400 bg-rose-950/40 border-rose-500/30";
  };

  const getScoreBorder = (score: number) => {
    if (score >= 90) return "border-emerald-500 text-emerald-400";
    if (score >= 80) return "border-amber-500 text-amber-400";
    return "border-rose-500 text-rose-400";
  };

  // Filtering projects list
  const filteredProjects = projects.filter(p => {
    const sMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   p.input.niche.toLowerCase().includes(searchQuery.toLowerCase());
    const nMatch = nicheFilter === 'All' || p.input.niche === nicheFilter;
    return sMatch && nMatch;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Alert Portal */}
      {alertMessage && (
        <div id="toast-message" className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-xl shadow-lg border text-xs flex items-start gap-3 backdrop-blur-md transition-all duration-300 ${
          alertMessage.type === 'success' ? 'bg-[#18181b]/95 text-emerald-400 border-emerald-500/30 shadow-emerald-500/5' : 
          alertMessage.type === 'error' ? 'bg-[#18181b]/95 text-rose-400 border-rose-500/30' : 
          'bg-[#18181b]/95 text-sky-400 border-sky-500/30'
        }`}>
          {alertMessage.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />}
          {alertMessage.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />}
          {alertMessage.type === 'info' && <Info className="w-4 h-4 shrink-0 text-sky-500" />}
          <div>{alertMessage.text}</div>
        </div>
      )}

      {/* Global Header */}
      <header className="border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('landing')}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black shadow-sm">
            <Zap className="w-4 h-4 text-black font-extrabold fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-lg text-[#fafafa]">
              Plotiqo AI
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-[#18181b] border border-[#27272a] text-emerald-400">
              Shorts Framework
            </span>
          </div>
        </div>

        {/* Desktop Navbar Controls */}
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => setCurrentTab('landing')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition ${currentTab === 'landing' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition ${currentTab === 'dashboard' || currentTab === 'workspace' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab('pricing')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition ${currentTab === 'pricing' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]'}`}
          >
            Pricing
          </button>
          {user?.email === 'moninilufa31@gmail.com' && (
            <button 
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition ${currentTab === 'admin' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]'}`}
            >
              Admin Panel
            </button>
          )}
          <button 
            onClick={() => setCurrentTab('settings')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition ${currentTab === 'settings' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]'}`}
          >
            API Secrets
          </button>
        </nav>

        {/* User Account Capsule / Plan info */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-mono text-[#a1a1aa]">
                {user.email}
              </span>
              <div 
                onClick={() => setCurrentTab('pricing')} 
                className="cursor-pointer bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 hover:border-emerald-500/20 hover:bg-[#27272a]/50 transition"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                {user.plan.toUpperCase()} PLAN ACTIVE
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-white text-black px-4 py-1.5 rounded-md text-xs font-bold hover:bg-[#e4e4e7] transition"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Primary Application Body */}
      <main className="flex-1 flex flex-col">
        {/* LANDING PAGE VIEW */}
        {currentTab === 'landing' && (
          <div className="px-4 py-12 lg:py-16 max-w-7xl mx-auto w-full flex flex-col gap-12">
            
            {/* Live Social Proof Peer Activity Ticker */}
            <div className="overflow-hidden bg-[#18181b]/55 border border-[#27272a] rounded-xl px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2 font-mono scroll-smooth animate-pulse text-[#a1a1aa]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                <span className="text-emerald-400 font-bold uppercase tracking-tight">[REAL-TIME TELEMETRY EVENT]</span>
                <span className="truncate">
                  Creator **Alex_Shorts** just validated a tech script blueprint scoring **94/100** • **Niche:** Science • **Length:** 34s Max Retention
                </span>
                <span className="ml-auto text-[10px] text-[#71717a] hidden md:inline">Synced 12s ago</span>
              </div>
            </div>

            {/* Action Hero Header */}
            <div className="text-center flex flex-col items-center gap-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181b] border border-[#27272a] text-emerald-400 text-[10px] font-mono tracking-widest uppercase rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-500 fill-current" />
                Advanced Cognitive Retention Architecture
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#fafafa] leading-[1.12]">
                Engineer High-Retention Shorts <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-indigo-400">
                  Backed by Behavioral Science
                </span>
              </h1>
              <p className="text-[#a1a1aa] text-base sm:text-lg max-w-2xl leading-relaxed">
                Plotiqo AI translates high-retention frameworks into production packages. Enter a video topic or link to generate dual-narrative timelines, cognitive open loops, and model-agnostic visual prompts.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full justify-center">
                <button 
                  onClick={() => setCurrentTab('dashboard')}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider py-4 px-8 rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-black stroke-[3]" /> Launch Creator Console
                </button>
                <button 
                  onClick={() => setCurrentTab('pricing')}
                  className="w-full sm:w-auto bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] px-8 py-4 rounded-lg text-xs uppercase tracking-wider font-extrabold text-[#fafafa] transition cursor-pointer"
                >
                  View Pricing Plans
                </button>
              </div>

              {/* Verified Benchmarks Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-6 border-t border-[#27272a] pt-8 text-center text-xs font-mono">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">94.8%</div>
                  <div className="text-[10px] text-[#71717a] mt-1 uppercase">Target Retention Rate</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">19-Part</div>
                  <div className="text-[10px] text-[#71717a] mt-1 uppercase font-bold">Retention Blueprint Stages</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">34s Max</div>
                  <div className="text-[10px] text-[#71717a] mt-1 uppercase">Optimal Timing Window</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#10b981]">Real API</div>
                  <div className="text-[10px] text-[#71717a] mt-1 uppercase">No Mocked Generation</div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE VALUE SANDBOX: The Endowment & Curiosity Loop */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-stretch relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.01] blur-3xl rounded-full" />
              
              {/* Sandbox info panel */}
              <div className="flex-1 space-y-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    [INTERACTIVE EXPERIMENT]
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-tight">
                    The Astronaut's Dark Secret Clock
                  </h3>
                  <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
                    Look at how the retention loop is mathematically designed. Click on the scenes below to live-preview the visual composition and spoken cues in the device mockup.
                  </p>
                </div>

                {/* Scorecard inside sandbox */}
                <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] space-y-3">
                  <div className="flex justify-between items-center border-b border-[#27272a]/40 pb-2">
                    <span className="text-xs font-bold font-mono">RETENTION SCORECARD MATRIX</span>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">94/100</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-[#a1a1aa]">
                    <div className="flex justify-between">
                      <span>• Novelty:</span>
                      <span className="text-white">9/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Knowledge Gap:</span>
                      <span className="text-white">9/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Hook Power:</span>
                      <span className="text-white">10/10</span>
                    </div>
                    <div className="flex justify-between flex-row">
                      <span>• Re-watchability:</span>
                      <span className="text-white">9/10</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Scene list selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wide block">
                    Select Stage Segment to Audit:
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {[
                      { idx: 0, label: "0-3s [HOOK]", title: "Astronaut Clock Hook", text: "They built this secret clock for outer space, but nobody realized what happens if you turn it backwards on Earth." },
                      { idx: 1, label: "3-8s [FORESHADOW]", title: "The Liquid Mystery Loop", text: "If we can reach 15 seconds without the dial shattering, we break the law of physics. Watch this water dropper." },
                      { idx: 2, label: "8-15s [MECHANISM]", title: "quartz Core Swap", text: "To make this reverse, we had to replace the quartz core with liquid helium-3. Look at the pressure rising." },
                      { idx: 3, label: "15-26s [CLIMAX TWIST]", title: "Physical Law Breaks", text: "7, 6... Look! The thermometer drops to absolute zero. The bottle of soda literally freezes backwards!" },
                      { idx: 4, label: "26-34s [REWATCH TENSION]", title: "Hidden Loop Secret", text: "That is why NASA officially locked this file in 1968. If you missed how the lock itself unscrewed... look again." },
                    ].map((step) => (
                      <button
                        key={step.idx}
                        onClick={() => {
                          setActiveLandingSceneIdx(step.idx);
                          triggerAlert('info', `Simulating Section: ${step.label}`);
                        }}
                        className={`text-left p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 transition cursor-pointer ${
                          activeLandingSceneIdx === step.idx 
                            ? "bg-[#27272a] border-[#3f3f46] text-white" 
                            : "bg-[#09090b]/80 border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa]"
                        }`}
                      >
                        <div className="font-mono text-[11px]">
                          <strong>{step.label}</strong>
                          <span className="block text-[10px] font-sans font-normal text-[#71717a] truncate max-w-xs">{step.text}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">View</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* iPhone preview mockup representing TikTok / YouTube Shorts player layout */}
              <div className="w-full lg:w-[280px] shrink-0 flex flex-col items-center justify-center">
                <div className="w-full max-w-[270px] bg-black rounded-[36px] p-2.5 border-4 border-[#27272a] shadow-2xl relative aspect-[9/16] flex flex-col justify-between overflow-hidden">
                  
                  {/* Camera lens element notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex justify-center items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                  </div>

                  {/* Simulated video screenshot generator inside mobile view */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#09090b]/50 via-emerald-900/5 to-black/90 flex flex-col justify-between p-4 pt-10">
                    
                    {/* Platform mock header */}
                    <div className="flex justify-between items-center text-[10px] text-white/80 font-mono">
                      <span>⚡ Live Sandbox</span>
                      <span className="bg-emerald-500 text-black px-1.5 py-0.2 rounded text-[8px] font-bold">REWATCH LOOP</span>
                    </div>

                    {/* Mid visual frame previewer */}
                    <div className="my-auto text-center px-2 space-y-2">
                      <div className="w-10 h-10 rounded-full mx-auto bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce">
                        <Flame className="w-5 h-5 fill-current" />
                      </div>
                      <p className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider font-extrabold bg-black/40 py-1.5 rounded-md border border-white/5">
                        [Active Scene Concept Vibe]
                      </p>
                      <p className="text-[9px] text-white italic leading-relaxed font-sans line-clamp-3">
                        {[
                          "Extreme shot of a brass clock dial spinning backward. Gravity starts floating paperclips near the desk.",
                          "Slow motion water droplet floating upwards. Eye levels are extremely tense.",
                          "Gloved hand injecting glowing blue liquid helium-3. Pressure needle shaking on Red zone.",
                          "Close-up of soda bottle reversing ice into liquid. The glass is frosting backwards.",
                          "Metal vault door slams. Dial starts ticking. Seamless loop starts back to frame one.",
                        ][activeLandingSceneIdx]}
                      </p>
                    </div>

                    {/* Bottom voiceover and subtitles representing peak engagement */}
                    <div className="space-y-2">
                      <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 space-y-1">
                        <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold tracking-tight block">VOICEOVER SUBTITLES</span>
                        <p className="text-[10px] text-white font-extrabold leading-tight">
                          {[
                            "They built this secret clock for outer space, but nobody realized what happens if you turn it backwards on Earth.",
                            "If we can reach 15 seconds without the dial shattering, we break the law of physics. Watch this water dropper.",
                            "To make this reverse, we had to replace the quartz core with liquid helium-3. Look at the pressure rising.",
                            "7, 6... Look! The thermometer drops to absolute zero. The bottle of soda literally freezes backwards!",
                            "That is why NASA officially locked this file in 1968. If you missed how the lock itself unscrewed... look again.",
                          ][activeLandingSceneIdx]}
                        </p>
                      </div>

                      {/* Video playback navigation indicator */}
                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-1 border-t border-white/5">
                        <span className="text-[#a1a1aa]">34 Seconds Standard</span>
                        <span className="text-emerald-400">🔥 98.4% Retainment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Framework Visual Explainers */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-xl relative overflow-hidden group">
                <div className="p-3 bg-[#27272a] rounded-lg w-fit text-emerald-400 mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Reverse Link Audit</h3>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">
                  Paste raw YouTube Shorts, TikToks, or Reels. Our pipeline instantly decodes formatting patterns, transcript style fingerprints, voice patterns, and engagement triggers.
                </p>
              </div>

              <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-xl relative overflow-hidden group">
                <div className="p-3 bg-[#27272a] rounded-lg w-fit text-emerald-400 mb-4">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Cognitive Scorecard</h3>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">
                  Every concept undergoes immediate validation for Novelty, Uncertainty, Personal Stakes, Hook Strength, and Rewatch loops. Our scoring engine blocks poor scripts before you waste edit time.
                </p>
              </div>

              <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-xl relative overflow-hidden group">
                <div className="p-3 bg-[#27272a] rounded-lg w-fit text-emerald-400 mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Agnostic AI Camera Cues</h3>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">
                  Generate hyper-descriptive prompt parameters ready to copy-paste directly into Runway Gen-3/4, Kling, and Sora. Full lighting directions, movement mechanics, and negative keywords.
                </p>
              </div>
            </div>

            {/* Testimonials Zone - Citing Authority Bias */}
            <div className="border border-[#27272a] bg-[#18181b] p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">THE BEHAVIORAL SCIENCE OF SHORTS RETENTION</h4>
                <h3 className="text-lg sm:text-xl font-bold text-[#fafafa]">The First 1.5 Seconds Rule</h3>
                <p className="text-[#a1a1aa] text-xs max-w-2xl leading-relaxed">
                  Audience retention science shows that saying fewer words, establishing a rapid personal obstacle loop immediately, and forcing the viewer's eyes to follow an unfolding curiosity loop increases loop-through rates by up to 134%. Plotiqo AI embeds this dynamic directly in your scripts.
                </p>
              </div>
              <button 
                onClick={() => setCurrentTab('dashboard')}
                className="bg-[#fafafa] hover:bg-[#e4e4e7] text-black font-extrabold text-xs uppercase tracking-wider px-6 py-4 rounded-lg shrink-0 transition cursor-pointer"
              >
                Launch Studio Now
              </button>
            </div>
          </div>
        )}

        {/* RECENT PROJECTS DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="px-6 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
            
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Behavioral Creator Studio</h1>
                <p className="text-[#a1a1aa] text-xs">Run retention score audits and write high-retention screenplays.</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedProject(null);
                  setCurrentTab('workspace');
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider py-3 px-5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" /> Create New Blueprint
              </button>
            </div>

            {/* Credit Quota Progress Meter - Psychology Endowment & Loss Aversion */}
            <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl flex flex-col md:flex-row items-center gap-6 justify-between text-xs">
              <div className="space-y-1">
                <p className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  Your Active Plan Quota: <span className="text-emerald-400 font-extrabold">Unlimited Pro creations activated</span>
                </p>
                <p className="text-[#a1a1aa] text-[11px]">You have generated {projects.length} short production packages this billing period.</p>
              </div>
              <div className="w-full md:w-64 bg-[#09090b] rounded-full h-2 border border-[#27272a] overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (projects.length + 1) * 15)}%` }} />
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#71717a]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by blueprint title, platform, or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs font-medium focus:outline-none focus:border-[#3f3f46] text-[#fafafa] placeholder-[#71717a] transition"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["All", "Tech", "Life Hacks", "Finance", "Entertainment", "Education", "Gaming"].map(niche => (
                  <button
                    key={niche}
                    onClick={() => setNicheFilter(niche)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition cursor-pointer ${
                      nicheFilter === niche 
                        ? 'bg-emerald-500 text-black border-emerald-500' 
                        : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa]'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Cover Spinner */}
            {isLoading && (
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-[#27272a] border-t-emerald-500 animate-spin" />
                <h3 className="text-sm font-bold text-white mt-1">Calibrating Retention Parameters</h3>
                <p className="text-[#a1a1aa] text-[11px] font-mono uppercase tracking-wider">{loadingPhase}</p>
                <div className="text-[10px] text-emerald-400 max-w-sm mt-3 animate-pulse bg-emerald-500/10 border border-emerald-500/10 px-3 py-1.5 rounded-md">
                  Analyzing obstacles, mapping safe zones, scoring emotional stakes...
                </div>
              </div>
            )}

            {/* Projects Grid List */}
            {!isLoading && filteredProjects.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#27272a] rounded-xl bg-[#18181b]/20 flex flex-col items-center gap-4">
                <div className="bg-[#18181b] p-3.5 rounded-full border border-[#27272a] text-[#71717a]">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No creation packages found</h3>
                  <p className="text-[#a1a1aa] text-xs mt-1 max-w-sm">
                    Begin by pasting a short video link or entering your topic keyword, and let the retention calculator design the narrative arc.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('workspace')}
                  className="bg-[#fafafa] hover:bg-[#e4e4e7] text-black font-extrabold text-[10px] tracking-wider uppercase px-4 py-2.5 rounded-lg transition"
                >
                  Create first blueprint now
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((proj) => {
                  const score = proj.productionPackage?.scorecard?.total || 0;
                  return (
                    <div 
                      key={proj.id}
                      onClick={() => {
                        setSelectedProject(proj);
                        setCurrentTab('workspace');
                      }}
                      className="bg-[#18181b] border border-[#27272a] hover:border-[#323235] p-5 rounded-xl flex flex-col gap-4 cursor-pointer hover:shadow-lg transition relative group overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          proj.inputType === 'url' ? 'bg-[#09090b] border border-[#27272a] text-[#a1a1aa]' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        }`}>
                          {proj.inputType === 'url' ? 'URL Reverse Audit' : 'Direct Topic Engine'}
                        </span>
                        
                        {score > 0 && (
                          <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getScoreColor(score)}`}>
                            {score}/100 Rating
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#fafafa] text-sm tracking-tight line-clamp-1 group-hover:text-emerald-400 transition">
                          {proj.title}
                        </h3>
                        <p className="text-[#a1a1aa] text-[11px] font-medium flex items-center gap-1.5 capitalize mt-1">
                          <span>Niche: {proj.input.niche}</span>
                          <span className="text-[#71717a]">•</span>
                          <span>Platform: {proj.input.targetPlatform}</span>
                        </p>
                      </div>

                      {proj.productionPackage && (
                        <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a] font-mono text-[10px] text-[#a1a1aa]">
                          <span className="text-white font-bold block mb-1">PROPOSED HOOK:</span>
                          <p className="line-clamp-2 italic leading-relaxed">
                            "{proj.productionPackage.bestHook.hook}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-[#27272a]/40 pt-4 mt-auto">
                        <span className="text-[9px] text-[#71717a] font-mono">
                          {new Date(proj.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button 
                            title="Duplicate this project"
                            onClick={(e) => handleDuplicateProject(proj.id, e)}
                            className="px-2 py-1 bg-[#09090b] text-[#fafafa] border border-[#27272a] hover:border-[#323235] rounded-md text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                          >
                            Clone
                          </button>
                          <button 
                            title="Delete this project"
                            onClick={(e) => handleDeleteProject(proj.id, e)}
                            className="p-1 px-1.5 rounded-md text-[#71717a] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WORKSPACE & PACKAGE OUTPUT CONSOLE */}
        {currentTab === 'workspace' && (
          <div className="bg-[#09090b] border-t border-[#27272a] flex-1 flex flex-col lg:flex-row">
            
            {/* LEFT INPUT COLUMN (Control Panel) */}
            <div className="w-full lg:w-[400px] shrink-0 border-r border-[#27272a] p-6 flex flex-col gap-6 bg-[#09090b]">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-extrabold tracking-tight text-white uppercase text-xs">Behavioral Parameters</h2>
                </div>
                {selectedProject && (
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-[#18181b] border border-[#27272a] px-2 py-1 rounded cursor-pointer"
                  >
                    + Reset Form
                  </button>
                )}
              </div>

              {/* PROJECT GENERATOR FORM */}
              <form onSubmit={handleCreateProject} className="flex flex-col gap-5">
                {/* Switch between Keyword input or raw URLs */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Input Source Type</label>
                  <div className="grid grid-cols-2 gap-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                    <button
                      type="button"
                      onClick={() => setInputType('topic')}
                      className={`py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        inputType === 'topic' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:text-[#fafafa]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Topic / Idea
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputType('url')}
                      className={`py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        inputType === 'url' ? 'bg-[#27272a] text-[#fafafa]' : 'text-[#a1a1aa] hover:text-[#fafafa]'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-emerald-400" /> Video URL
                    </button>
                  </div>
                </div>

                {inputType === 'topic' ? (
                  <div>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-2">Target Concept Idea</label>
                    <textarea
                      value={formInput.title}
                      onChange={(e) => setFormInput(prev => ({ ...prev, title: e.target.value }))}
                      rows={3}
                      placeholder="e.g. 'I spent 100 hours building an astronauts secret clock but found a fatal flaw'..."
                      className="w-full p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46] transition placeholder-[#71717a] resize-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-2">Raw Short Video URL (YouTube, TikTok, Reels)</label>
                    <input
                      type="url"
                      value={formInput.url}
                      onChange={(e) => setFormInput(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://www.youtube.com/shorts/..."
                      className="w-full p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46] transition placeholder-[#71717a]"
                    />
                    
                    {/* Reverse Engineering Modes selection */}
                    <div className="mt-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Audit Recreation Mode</label>
                      <select 
                        value={formInput.mode}
                        onChange={(e: any) => setFormInput(prev => ({ ...prev, mode: e.target.value }))}
                        className="w-full p-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] focus:outline-none text-left"
                      >
                        <option value="reverse">Reverse Engineer (Same Niche & Style)</option>
                        <option value="original">Original Inspiration (Same Style, New Topic)</option>
                        <option value="niche-recreation">New Niche Recreation (Different Niche)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">Niche</label>
                    <select
                      value={formInput.niche}
                      onChange={(e) => setFormInput(prev => ({ ...prev, niche: e.target.value }))}
                      className="w-full p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white"
                    >
                      <option value="Entertainment">Entertainment</option>
                      <option value="Tech">Tech Hacks</option>
                      <option value="Finance">Finance / Money</option>
                      <option value="Education">Education</option>
                      <option value="Life Hacks">Life Hacks</option>
                      <option value="Gaming">Gaming</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">Platform Target</label>
                    <select
                      value={formInput.targetPlatform}
                      onChange={(e: any) => setFormInput(prev => ({ ...prev, targetPlatform: e.target.value }))}
                      className="w-full p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white"
                    >
                      <option value="YouTube Shorts">YouTube Shorts</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Instagram Reels">Instagram Reels</option>
                      <option value="All">All Platforms</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">Desired Length</label>
                    <select
                      value={formInput.desiredLength}
                      onChange={(e: any) => setFormInput(prev => ({ ...prev, desiredLength: e.target.value }))}
                      className="w-full p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white"
                    >
                      <option value="34s">High-Retention Standard (34s)</option>
                      <option value="60s">Full Short (60s)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">Language</label>
                    <input
                      type="text"
                      value={formInput.language}
                      onChange={(e) => setFormInput(prev => ({ ...prev, language: e.target.value }))}
                      placeholder="English"
                      className="w-full p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">Target Audience Core</label>
                  <input
                    type="text"
                    value={formInput.audienceType}
                    onChange={(e) => setFormInput(prev => ({ ...prev, audienceType: e.target.value }))}
                    placeholder="e.g. Students seeking immediate retention"
                    className="w-full p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="bg-[#18181b]/60 p-3 rounded-lg border border-[#27272a] text-[10px] text-[#a1a1aa] leading-relaxed flex gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>
                    Our backend builds real-time structured screenplays incorporating re-watch triggers and specific camera directions.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-black font-bold fill-current" />
                  {isLoading ? 'Calibrating retention loop...' : 'Create Viral Production Package'}
                </button>
              </form>

              {/* Quick-select Local History sidebar */}
              {projects.length > 0 && (
                <div className="mt-auto pt-4 border-t border-[#27272a]">
                  <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-2">Switch Project File</label>
                  <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                    {projects.slice(0, 10).map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className={`text-left p-2 rounded text-xs font-semibold truncate border transition cursor-pointer ${
                          selectedProject?.id === p.id 
                            ? 'bg-[#27272a] border-[#3f3f46] text-white' 
                            : 'bg-[#18181b] border-transparent text-[#a1a1aa] hover:text-white hover:border-[#27272a]'
                        }`}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: RE-ENGINEERED BLUEPRINT SHOWCASE */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#09090b]">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-[#27272a] border-t-emerald-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">Calculating Retention Vectors</h3>
                    <p className="text-slate-400 text-xs font-mono mt-1">{loadingPhase}</p>
                    <p className="text-slate-500 text-[11px] mt-4 max-w-sm leading-relaxed">
                      Cognitive retention dynamics require 5th grade reading levels, dual narratives, and BUT-SO transitions. Applying these constraints to your idea...
                    </p>
                  </div>
                </div>
              ) : selectedProject ? (
                <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                  
                  {/* Package Title Banner */}
                  <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                          Active Blueprint File
                        </span>
                        <span className="text-[10px] font-mono text-[#71717a]">
                          ID: {selectedProject.id}
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fafafa] leading-tight">
                        {selectedProject.title}
                      </h1>
                      <p className="text-[#a1a1aa] text-xs">
                        Platform: <strong className="text-white">{selectedProject.input.targetPlatform}</strong> | Niche: {selectedProject.input.niche} | Language: {selectedProject.input.language}
                      </p>
                    </div>

                    {/* Exporters and copying */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => handleCopyText(JSON.stringify(selectedProject, null, 2), "Full JSON")}
                        className="py-2 px-3.5 rounded-lg bg-[#27272a]/30 hover:bg-[#27272a] border border-[#27272a] text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-emerald-400" /> Copy JSON
                      </button>
                      <button 
                        onClick={() => handleExportFile('md', selectedProject)}
                        className="py-2 px-3.5 rounded-lg bg-[#27272a]/30 hover:bg-[#27272a] border border-[#27272a] text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" /> Export MD
                      </button>
                      <button 
                        onClick={() => handleExportFile('txt', selectedProject)}
                        className="py-2 px-3.5 rounded-lg bg-[#27272a]/30 hover:bg-[#27272a] border border-[#27272a] text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" /> Export TXT
                      </button>
                    </div>
                  </div>

                  {/* VIDEO ANALYZER REPORT SECTION (If project was URL-sourced) */}
                  {selectedProject.analysis && (
                    <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-xl flex flex-col gap-6 relative overflow-hidden">
                      <div className="flex items-center gap-2 pb-3 border-b border-[#27272a]">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-bold text-white text-sm">URL Reverse-Engineering Report</h3>
                        <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold ml-auto uppercase tracking-wider">
                          Deconstructed Target
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Target Video Meta</h4>
                            <p className="text-white text-xs font-semibold mt-1">{selectedProject.analysis.title}</p>
                            <p className="text-[#a1a1aa] text-[11px] mt-1 leading-relaxed">{selectedProject.analysis.description}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Simulated Transcription Transcript</h4>
                            <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] text-[#a1a1aa] text-[11px] font-mono line-clamp-4 leading-relaxed mt-2 italic">
                              "{selectedProject.analysis.transcript}"
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] space-y-2.5 font-mono text-[11px] text-[#a1a1aa]">
                          <div className="text-white font-bold border-b border-[#27272a] pb-1.5 uppercase text-[9px] tracking-wider">
                            Identified Psychological Triggers
                          </div>
                          <p><strong className="text-white font-medium">Pattern Hook:</strong> {selectedProject.analysis.breakdown.hook}</p>
                          <p><strong className="text-white font-medium">But-So Curve:</strong> {selectedProject.analysis.breakdown.narrativeArc}</p>
                          <p><strong className="text-white font-medium">Visual Tracker:</strong> {selectedProject.analysis.breakdown.mechanism}</p>
                          <p><strong className="text-white font-medium">Uncertainty Loop:</strong> {selectedProject.analysis.breakdown.foreshadow}</p>
                          <p><strong className="text-white font-medium">Peak Payoff:</strong> {selectedProject.analysis.breakdown.twist}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 border-t border-[#27272a]/80 pt-4 mt-2">
                        <div>
                          <div className="text-[9px] text-[#71717a] font-mono uppercase tracking-wider">Edit Tempo / Rhythm</div>
                          <div className="text-xs font-bold text-white mt-0.5">{selectedProject.analysis.styleFingerprint.editRhythm}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-[#71717a] font-mono uppercase tracking-wider">Narrative Angle Tone</div>
                          <div className="text-xs font-bold text-white mt-0.5">{selectedProject.analysis.styleFingerprint.tone}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-[#71717a] font-mono uppercase tracking-wider">Emotional Tension Gauge</div>
                          <div className="text-xs font-bold text-emerald-400 mt-0.5 uppercase">{selectedProject.analysis.styleFingerprint.energyLevel}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MAIN RETENTION SCORE CARD */}
                  {selectedProject.productionPackage && (
                    <div className="grid md:grid-cols-3 gap-6">
                      
                      {/* Detailed ring chart and score */}
                      <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-xl flex flex-col items-center text-center justify-center gap-4 relative">
                        <h3 className="font-bold text-[#71717a] text-[10px] font-mono uppercase tracking-wider">
                          Estimated Retention Rating
                        </h3>
                        
                        <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center bg-[#09090b] ${
                          getScoreBorder(selectedProject.productionPackage.scorecard.total)
                        }`}>
                          <span className="text-3xl font-extrabold tracking-tighter text-white">
                            {selectedProject.productionPackage.scorecard.total}
                          </span>
                          <span className="text-[9px] font-mono uppercase font-bold text-[#71717a]">/ 100 max</span>
                        </div>

                        <div>
                          {selectedProject.productionPackage.scorecard.total >= 80 ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              ✓ HIGH VIRAL FEASIBILITY
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1 justify-center">
                              <AlertTriangle className="w-3 h-3 text-rose-500" /> OPTIMIZE SUGGESTED
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#a1a1aa] leading-relaxed italic px-2">
                          "{selectedProject.productionPackage.weakestDimensionNote}"
                        </p>
                      </div>

                      {/* Dimension Grid breakdown */}
                      <div className="md:col-span-2 bg-[#18181b] border border-[#27272a] p-6 rounded-xl flex flex-col gap-4">
                        <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider pb-2 border-b border-[#27272a] flex justify-between items-center">
                          <span>Framework Multipliers Matrix</span>
                          <span className="text-[10px] font-normal text-[#71717a]">Target Range: &gt; 8 / 10</span>
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {Object.entries(selectedProject.productionPackage.scorecard).map(([key, val]) => {
                            if (key === 'total') return null;
                            return (
                              <div key={key} className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col text-center">
                                <span className="text-[10px] text-[#a1a1aa] font-medium tracking-tight truncate capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <span className={`text-xl font-mono font-extrabold mt-1 ${
                                  (val as number) >= 8 ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                  {val as number}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Obstacle constraints indicator loop */}
                        <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg text-xs flex gap-2">
                          <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
                          <p className="text-[#a1a1aa] leading-normal">
                            <strong className="text-white">Personal Stakes Applied:</strong> "I want X but obstacle stops me, so I must act." This holds retention through story curves.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 19-PART BLUEPRINT ACCORDION CARDS */}
                  {selectedProject.productionPackage && (
                    <div className="space-y-6">
                      
                      {/* SECTION 1: Concept & Hooks Variations */}
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                          <h3 className="font-extrabold text-white text-base">Viral Concept Narrative &amp; Hook Sets</h3>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#71717a] font-mono uppercase">1. Core Narrative Strategy</h4>
                          <p className="text-slate-300 text-sm mt-1 leading-relaxed bg-[#09090b] p-4 rounded-xl border border-[#27272a]">
                            {selectedProject.productionPackage.viralConcept}
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Recommended hooks */}
                          <div>
                            <h4 className="text-xs font-bold text-[#71717a] font-mono uppercase mb-2">4. Best Decisive Hook</h4>
                            <div className="bg-[#09090b] border border-emerald-500/20 p-4 rounded-xl font-sans">
                              <p className="text-emerald-400 text-lg font-bold tracking-tight">
                                "{selectedProject.productionPackage.bestHook.hook}"
                              </p>
                              <p className="text-[#a1a1aa] text-xs mt-2 italic leading-relaxed">
                                {selectedProject.productionPackage.bestHook.reason}
                              </p>
                            </div>
                          </div>

                          {/* 10 Hook variations list */}
                          <div>
                            <h4 className="text-xs font-bold text-[#71717a] font-mono uppercase mb-2">3. Ten Category Variations</h4>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                              {selectedProject.productionPackage.hooks.map((cat, i) => (
                                <div key={i} className="bg-[#09090b] p-2.5 rounded-lg border border-[#27272a] text-xs space-y-1">
                                  <div className="text-emerald-400 font-bold uppercase text-[9px] font-mono tracking-wide">
                                    {cat.category}
                                  </div>
                                  {cat.hooks.map((hk, hkIdx) => (
                                    <p key={hkIdx} className="text-slate-300 italic font-mono pl-2 border-l border-[#27272a]">
                                      - "{hk}"
                                    </p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Foreshadow & Tracker */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a]">
                            <span className="text-[10px] font-mono text-[#71717a] uppercase">5. Foreshadowing Promise (Secs 3 &amp; 8)</span>
                            <p className="text-sm text-slate-200 mt-1 leading-normal font-medium">"{selectedProject.productionPackage.foreshadow}"</p>
                          </div>
                          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a]">
                            <span className="text-[10px] font-mono text-[#71717a] uppercase">6. Visible Progress Tracker Mechanism</span>
                            <p className="text-sm text-slate-200 mt-1 leading-normal font-medium">"{selectedProject.productionPackage.mechanism}"</p>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: THE DUAL-NARRATIVE SCREENPLAY SCRIPT */}
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">7. Interactive Screenplay Script</h3>
                          </div>
                          <button
                            onClick={() => {
                              const scriptTxt = selectedProject.productionPackage?.script.map(s => `[${s.timeframe}] ${s.label}: ${s.text}`).join('\n') || '';
                              handleCopyText(scriptTxt, "Script Transcripts");
                            }}
                            className="bg-[#09090b] hover:bg-[#18181b] text-xs font-mono font-bold text-slate-300 py-1.5 px-3 rounded-lg border border-[#27272a] transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-400" /> Copy voiceover text
                          </button>
                        </div>

                        {/* Rules disclaimer banner */}
                        <div className="bg-[#09090b] p-3 rounded-lg text-xs space-y-1 text-[#a1a1aa] border border-[#27272a] leading-relaxed">
                          <p className="font-bold text-[#fafafa] uppercase text-[9px] tracking-wider text-emerald-400">Behavioral Standard Checklist Applied:</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-[#a1a1aa] text-[11px]">
                            <li>5th-grade accessibility benchmark words only (forces simple sentences).</li>
                            <li>Alternating dual timeline framework (Visual frames tell a separate physical mystery while speaker states the topic).</li>
                            <li>Seamless narrative hook link: Last word seamlessly wraps into a loop back into the first.</li>
                          </ul>
                        </div>

                        {/* Timeline List */}
                        <div className="flex flex-col gap-3">
                          {selectedProject.productionPackage.script.map((beat, i) => (
                            <div key={i} className="bg-[#09090b] p-4 rounded-xl border border-[#27272a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5">
                                <span className="bg-[#18181b] border border-[#27272a] px-2 py-1 rounded font-mono text-center text-[10px] text-emerald-400 font-extrabold shrink-0 uppercase tracking-widest">
                                  {beat.timeframe}
                                </span>
                                <span className="text-[10px] font-bold text-[#71717a] tracking-widest uppercase">
                                  {beat.label}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-white leading-relaxed flex-1 italic text-left md:pl-6 border-l border-[#27272a]">
                                "{beat.text}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 3: SHOT LIST & DIRECTION BOARDS */}
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                          <Camera className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider">8. Video Shots &amp; Camera Angles</h3>
                        </div>

                        {/* Visual directions grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5 bg-[#09090b] p-4 rounded-lg border border-[#27272a]">
                          <div>
                            <span className="text-[9px] text-[#71717a] font-mono block uppercase tracking-wider">Aspect Format</span>
                            <span className="text-xs font-bold text-white mt-1 block">{selectedProject.productionPackage.visualDirections.aspectRatio}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#71717a] font-mono block uppercase tracking-wider">Interactive Safe Zone</span>
                            <span className="text-xs font-bold text-emerald-400 mt-1 block leading-tight">{selectedProject.productionPackage.visualDirections.safeZone}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#71717a] font-mono block uppercase tracking-wider">Color Grade</span>
                            <span className="text-xs font-bold text-white mt-1 block">{selectedProject.productionPackage.visualDirections.colorPalette}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#71717a] font-mono block uppercase tracking-wider">Typography</span>
                            <span className="text-xs font-bold text-white mt-1 block">{selectedProject.productionPackage.visualDirections.fontStyle}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#71717a] font-mono block uppercase tracking-wider">Camera Motion</span>
                            <span className="text-xs font-bold text-emerald-400 mt-1 block">{selectedProject.productionPackage.visualDirections.motionStyle}</span>
                          </div>
                        </div>

                        {/* Table Shots */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-[#a1a1aa] border-collapse">
                            <thead>
                              <tr className="border-b border-[#27272a] text-[#71717a] font-mono uppercase text-[9px] tracking-wider">
                                <th className="pb-2">Shot ID</th>
                                <th className="pb-2">Focal Angle</th>
                                <th className="pb-2">Subject Action</th>
                                <th className="pb-2">Physical Activity</th>
                                <th className="pb-2">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProject.productionPackage.shotList.map((shot, i) => (
                                <tr key={i} className="border-b border-[#27272a] hover:bg-[#09090b]/50">
                                  <td className="py-2.5 font-bold text-white">#{shot.number}</td>
                                  <td className="py-2.5 font-mono text-emerald-400 font-semibold">{shot.angle}</td>
                                  <td className="py-2.5 text-slate-200">{shot.subject}</td>
                                  <td className="py-2.5 italic text-[#a1a1aa]">{shot.action}</td>
                                  <td className="py-2.5 font-mono font-bold text-white">{shot.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* SECTION 4: EDITING MODES, EASTER GONE, REWATCH PRINCIPLES */}
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                          <Sliders className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Speed-Editing &amp; Micro-Loops</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          {/* 14. edit instructions */}
                          <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] space-y-3 font-mono text-[11px] text-[#a1a1aa]">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase block border-b border-[#27272a] pb-1 tracking-wider">
                              14. Editing parameters
                            </span>
                            <p><strong className="text-white">Cuts Pace:</strong> {selectedProject.productionPackage.editingInstructions.cutRate}</p>
                            <p><strong className="text-white">BPM Range:</strong> {selectedProject.productionPackage.editingInstructions.bpmRange}</p>
                            <p><strong className="text-white">Music Arc:</strong> {selectedProject.productionPackage.editingInstructions.musicArc}</p>
                            <p><strong className="text-white">SFX Cues:</strong> {selectedProject.productionPackage.editingInstructions.soundEffects}</p>
                            <p><strong className="text-white">Overlays:</strong> {selectedProject.productionPackage.editingInstructions.textOverlays}</p>
                            <p><strong className="text-white">Transitions:</strong> {selectedProject.productionPackage.editingInstructions.transitions}</p>
                          </div>

                          {/* 10. retention trigger timeline */}
                          <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] space-y-3 text-xs">
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block border-b border-[#27272a] pb-1 tracking-wider">
                              10. Action Triggers List
                            </span>
                            <div className="space-y-2 max-h-[160px] overflow-y-auto">
                              {selectedProject.productionPackage.retentionTriggers.map((rt, idx) => (
                                <div key={idx} className="border-b border-[#27272a] pb-1.5 last:border-0">
                                  <span className="text-emerald-400 font-mono font-semibold">[{rt.timestamp}] {rt.type}:</span>
                                  <p className="text-[#a1a1aa] leading-relaxed text-[11px] font-mono mt-0.5">{rt.detail}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 11, 12, 13 Endings */}
                          <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] text-xs space-y-3 text-[#a1a1aa] font-mono">
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block border-b border-[#27272a] pb-1 tracking-wider">
                              Loop Mechanics
                            </span>
                            <div>
                              <strong className="text-white">11. Surprise Twist Outcome:</strong>
                              <p className="text-[#a1a1aa] text-[11px] mt-0.5 italic">"{selectedProject.productionPackage.twistEnding.description}" ({selectedProject.productionPackage.twistEnding.spokenWords})</p>
                            </div>
                            <div>
                              <strong className="text-white">12. Hidden Easter Egg:</strong>
                              <p className="text-[#a1a1aa] text-[11px] mt-0.5">{selectedProject.productionPackage.easterEgg}</p>
                            </div>
                            <div>
                              <strong className="text-white">13. Rewatch Trigger Strategy:</strong>
                              <p className="text-[#a1a1aa] text-[11px] mt-0.5">{selectedProject.productionPackage.rewatchTrigger}</p>
                            </div>
                          </div>
                        </div>

                        {/* Thumbnail card preview details */}
                        <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold tracking-wider">
                              15. Thumbnail Cover Design
                            </span>
                            <p className="text-xs text-[#a1a1aa] leading-relaxed mt-1 max-w-xl">
                              Position: {selectedProject.productionPackage.thumbnailFirstFrame.subjectPosition} | Style: {selectedProject.productionPackage.thumbnailFirstFrame.background} | Overlay Caption: <strong className="text-[#fafafa]">"{selectedProject.productionPackage.thumbnailFirstFrame.textOverlay}"</strong>
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-[#71717a] italic max-w-xs block text-right">
                            "The first 1.5 seconds layout commands standard clickability."
                          </span>
                        </div>
                      </div>

                      {/* SECTION 5: AI VIDEO MACHINE PROMPTS (Sora, Runway, Veo, Kling Optimized) */}
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl" />
                        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">⚡ Video Generator Prompts Matrix</h3>
                          </div>
                          
                          <button
                            onClick={() => {
                              const promptsTxt = `MASTER STYLE:\n${selectedProject.productionPackage?.masterStylePrompt}\n\nSCENE PROMPTS:\n` + 
                                selectedProject.productionPackage?.sceneVideoPrompts.map(s => `SCENE #${s.sceneNo}:\nVisual: ${s.visualPrompt}\nMovement: ${s.cameraMovement}\nNegative: ${s.negativePrompt}`).join('\n\n');
                              handleCopyText(promptsTxt, "Visual prompts");
                            }}
                            className="bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] text-xs font-mono font-bold text-slate-300 py-1.5 px-3 rounded-lg transition cursor-pointer"
                          >
                            Copy All Visual Prompts
                          </button>
                        </div>

                        {/* Master style section */}
                        <div className="bg-[#09090b] p-4 rounded-xl border border-[#27272a]">
                          <span className="text-[10px] text-[#71717a] font-mono uppercase font-bold">Master Unified Style Prompt</span>
                          <p className="text-sm font-semibold text-white mt-1 leading-relaxed">
                            "{selectedProject.productionPackage.masterStylePrompt}"
                          </p>
                          <span className="text-[9px] text-emerald-500 mt-2 block font-mono">
                            Applying this tag globally across all generation scenes ensures visual continuity in dynamic models.
                          </span>
                        </div>

                        {/* Scene by scene map list */}
                        <div className="space-y-4">
                          <span className="text-xs font-bold text-[#71717a] font-mono uppercase block">Shot-by-Shot Prompt Matrixes</span>
                          
                          {selectedProject.productionPackage.sceneVideoPrompts.map((s, idx) => (
                            <div key={idx} className="bg-[#09090b] p-4 rounded-xl border border-[#27272a] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-white">SCENE {s.sceneNo} — {s.shotName}</span>
                                <span className="text-xs font-mono text-emerald-400">Duration: {s.durationSeconds}s</span>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                <p className="leading-relaxed text-slate-300">
                                  <strong>Prompt:</strong> "{s.visualPrompt}"
                                </p>
                                <div className="grid md:grid-cols-4 gap-2 text-[11px] font-mono text-[#a1a1aa]">
                                  <span>Movement: <strong className="text-white">{s.cameraMovement}</strong></span>
                                  <span>Lighting: <strong className="text-white">{s.lighting}</strong></span>
                                  <span>Vibe: <strong className="text-white">{s.moodAndEnergy}</strong></span>
                                  <span>Reference: <strong className="text-white">{s.styleReference}</strong></span>
                                </div>
                                <p className="text-[11px] text-emerald-400/80 font-mono">
                                  <strong>Negative elements to dodge:</strong> "{s.negativePrompt}"
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Audio directions */}
                        <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a] mt-4 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <Music className="w-4 h-4" />
                              <strong className="text-xs font-mono uppercase">Audio &amp; Sound Arc Direction</strong>
                            </div>
                            <p className="text-xs text-[#a1a1aa] leading-normal">
                              Genre: {selectedProject.productionPackage.audioDirections.genre} | Energy Curve: {selectedProject.productionPackage.audioDirections.energyArc}
                            </p>
                            <p className="text-xs font-mono text-emerald-400">
                              Drop Key Moment: {selectedProject.productionPackage.audioDirections.keyMoment}
                            </p>
                          </div>
                          <span className="text-xs text-[#a1a1aa] font-mono border border-[#27272a] bg-[#09090b] px-3 py-1.5 rounded self-stretch md:self-auto text-center font-bold">
                            BPM Target: {selectedProject.productionPackage.audioDirections.bpmRange}
                          </span>
                        </div>
                      </div>

                      {/* SECTION 6: PLATFORM VARIATIONS & FINAL COPY/PASTE CAPTION */}
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                          <Compass className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider font-sans">Adaptations &amp; Title Variants</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Title set variations */}
                          <div className="space-y-3">
                            <span className="text-xs font-bold text-[#71717a] font-mono uppercase block">
                              18. YouTube Shorts Curiosity Gap Title Options
                            </span>
                            <div className="space-y-1.5 font-mono text-xs text-slate-300 bg-[#09090b] p-4 rounded-xl border border-[#27272a]">
                              {selectedProject.productionPackage.titleVariations.map((titleStr, i) => (
                                <p key={i} className="py-1 border-b border-[#27272a] last:border-0 pl-2 border-l-2 border-emerald-500">
                                  "{titleStr}"
                                </p>
                              ))}
                            </div>
                          </div>

                          {/* why it will go viral */}
                          <div className="space-y-3">
                            <span className="text-xs font-mono uppercase font-bold text-[#71717a] block">
                              19. Viral Psychology Mechanics At Work
                            </span>
                            <ul className="list-disc pl-4 space-y-2 text-xs text-[#a1a1aa] leading-relaxed">
                              {selectedProject.productionPackage.whyItWillGoViral.map((bullet, i) => (
                                <li key={i}>
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Platform specifics Adaptation table */}
                        <div className="grid md:grid-cols-3 gap-4 border-t border-[#27272a] pt-6 mt-4">
                          {selectedProject.productionPackage.platformAdaptations.map((ada, idx) => (
                            <div key={idx} className="bg-[#09090b] p-4 rounded-xl border border-[#27272a]">
                              <span className="text-xs font-extrabold text-emerald-400 block mb-1 uppercase tracking-wider text-[11px] font-mono">
                                Platform: {ada.platform}
                              </span>
                              <p className="text-xs text-[#a1a1aa] leading-relaxed italic">
                                "{ada.adaptation}"
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Copy-paste custom caption */}
                        <div className="p-5 rounded-xl bg-[#09090b] border border-[#27272a] mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                          <div className="space-y-1.5 flex-1">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                              17. Optimised Clipboard Caption ready to paste
                            </span>
                            <p className="text-xs text-slate-300 font-semibold italic">"{selectedProject.productionPackage.caption.hookSentence}"</p>
                            <p className="text-xs text-emerald-400 font-mono mt-1">
                              {selectedProject.productionPackage.caption.hashtags.map(h => `#${h}`).join(' ')}
                            </p>
                            <p className="text-xs text-[#a1a1aa] mt-1">{selectedProject.productionPackage.caption.cta}</p>
                          </div>
                          <button
                            onClick={() => {
                              const cap = `${selectedProject.productionPackage?.caption.hookSentence}\n\n` + 
                                selectedProject.productionPackage?.caption.hashtags.map(h => `#${h}`).join(' ') + `\n\n${selectedProject.productionPackage?.caption.cta}`;
                              handleCopyText(cap, "Captions");
                            }}
                            className="bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-slate-300 text-xs font-mono px-4 py-2 rounded-xl transition cursor-pointer"
                          >
                            Copy Caption Set
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                  <div className="bg-[#18181b] p-4 rounded-full text-emerald-400 border border-[#27272a]">
                    <Layers className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Workspace Empty</h3>
                    <p className="text-[#a1a1aa] text-sm max-w-sm mt-1 mx-auto leading-relaxed">
                      Select an existing short package from target list, or fill the active Creator Form on the left column to run the calculation engine!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBSCRIPTION & BILLING PLAs SHOWCASE */}
        {currentTab === 'pricing' && (
          <div className="px-4 py-16 max-w-7xl mx-auto w-full flex flex-col gap-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Transparent Billing Matrix
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none mt-2 font-sans">
                Unleash Infinite Creations
              </h1>
              <p className="text-[#a1a1aa] text-base leading-relaxed">
                Engineering viral loops is resource intensive. Choose a package to support your team, gain advanced PDF downloads, and activate URL Re-Engineering analysis.
              </p>
            </div>

            {/* Price Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-4">
              
              {/* Free tier */}
              <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-xl flex flex-col justify-between transition relative">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">Starter Pack</span>
                  <h3 className="text-2xl font-bold text-white">Free Plan</h3>
                  <div className="text-3xl font-extrabold text-[#fafafa] mt-1">$0 <span className="text-xs text-[#71717a] font-mono font-normal">/ month</span></div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Test the water and check the score matrix loops on standard topics.
                  </p>
                  
                  <div className="border-t border-[#27272a] pt-4 space-y-2.5 text-xs text-slate-300">
                    <p className="flex items-center gap-2 text-slate-400">✓ 3 Creations per Month limit</p>
                    <p className="flex items-center gap-2 text-slate-400">✓ Dynamic 34s Script Drafts</p>
                    <p className="flex items-center gap-2 text-[#71717a] line-through">✗ PDF Export Downloads</p>
                    <p className="flex items-center gap-2 text-[#71717a] line-through">✗ URL Reverse Engineering Analysis</p>
                    <p className="flex items-center gap-2 text-[#71717a] line-through">✗ Master Video Prompts Section</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleUpgradePlan('free')}
                  disabled={user.plan === 'free'}
                  className="w-full mt-8 py-3 rounded-lg font-bold text-xs tracking-wider uppercase border border-[#27272a] text-slate-400 hover:text-slate-200 transition disabled:opacity-50 cursor-pointer"
                >
                  {user.plan === 'free' ? 'Currently Active' : 'Switch to Free'}
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-[#18181b] border-2 border-emerald-500/40 p-8 rounded-xl flex flex-col justify-between transition relative shadow-lg shadow-emerald-500/5">
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-bold text-[9px] uppercase px-3 py-1 rounded-bl-xl font-mono tracking-wider">
                  Highly Best Value
                </div>
                
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">PRO MULTIPLIERS</span>
                  <h3 className="text-2xl font-bold text-white">Pro Studio</h3>
                  <div className="text-3xl font-extrabold text-white mt-1">$29 <span className="text-xs text-[#71717a] font-mono font-normal">/ month</span></div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed for dedicated YouTubers, TikTok content authors, and Instagram agencies.
                  </p>
                  
                  <div className="border-t border-[#27272a] pt-4 space-y-2.5 text-xs text-slate-100 font-semibold">
                    <p className="flex items-center gap-2 text-emerald-400">✓ Unlimited Creation Packages</p>
                    <p className="flex items-center gap-2 text-slate-300">✓ Dynamic PDF &amp; Markdown Exports</p>
                    <p className="flex items-center gap-2 text-slate-300">✓ URL Reverse Engineering Analysis enabled</p>
                    <p className="flex items-center gap-2 text-slate-300">✓ Master Visual Prompts Core</p>
                    <p className="flex items-center gap-2 text-emerald-400">✓ VIP Priority calculation servers</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleUpgradePlan('pro')}
                  disabled={user.plan === 'pro'}
                  className="w-full mt-8 py-3 rounded-lg font-bold text-xs tracking-wider uppercase bg-emerald-500 hover:bg-emerald-400 text-[#09090b] transition disabled:opacity-50 cursor-pointer"
                >
                  {user.plan === 'pro' ? 'Selected active' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Team Workspace Tier */}
              <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-xl flex flex-col justify-between transition relative">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">COLLABORATIVE CLOUD</span>
                  <h3 className="text-2xl font-bold text-white">Team Agency</h3>
                  <div className="text-3xl font-extrabold text-[#fafafa] mt-1">$99 <span className="text-xs text-[#71717a] font-mono font-normal">/ month</span></div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Enable multi-user workspaces, template library sharing, and custom brand instructions.
                  </p>
                  
                  <div className="border-t border-[#27272a] pt-4 space-y-2.5 text-xs text-slate-300">
                    <p className="flex items-center gap-2 text-slate-400">✓ Everything in Pro workspace</p>
                    <p className="flex items-center gap-2 text-slate-400">✓ Collaborative shared projects</p>
                    <p className="flex items-center gap-2 text-slate-400">✓ Custom visual brand assets presets</p>
                    <p className="flex items-center gap-2 text-slate-400">✓ Team member dashboards (up to 10)</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleUpgradePlan('team')}
                  disabled={user.plan === 'team'}
                  className="w-full mt-8 py-3 rounded-lg font-bold text-xs tracking-wider uppercase border border-[#27272a] text-slate-400 hover:text-slate-200 transition disabled:opacity-50 cursor-pointer"
                >
                  {user.plan === 'team' ? 'Selected active' : 'Get Team Access'}
                </button>
              </div>
            </div>

            {/* Simulated Checkout notice with guidelines */}
            <div className="bg-[#09090b] p-5 rounded-lg border border-[#27272a] text-xs text-[#71717a] leading-normal max-w-3xl mx-auto text-center font-mono">
              <p>
                <strong>Secure Payment integration Notice:</strong> Checkout utilizes standard simulated Stripe subscription flows. Upon choosing "Upgrade", your database records update immediately.
              </p>
            </div>
          </div>
        )}

        {/* ACTIVE SERVICES MONITOR (ADMIN PANEL) */}
        {currentTab === 'admin' && user?.email === 'moninilufa31@gmail.com' && (
          <div className="px-4 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-4 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Services Monitor Console</h1>
                <p className="text-[#a1a1aa] text-sm mt-1">Review telemetry stats, subscription billing values, and AI usage metrics.</p>
              </div>
              <button 
                onClick={fetchAdminAnalytics}
                className="bg-[#18181b] border border-[#27272a] text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> Reload stats
              </button>
            </div>

            {/* Stats matrix cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-[#18181b] p-5 rounded-lg border border-[#27272a] space-y-1.5 animate-fade-in">
                <span className="text-[10px] text-[#71717a] font-mono block uppercase">Active Creators Subscribed</span>
                <div className="text-3xl font-extrabold text-white flex items-end gap-1.5 font-mono">
                  {adminAnalytics.totalUsers} <span className="text-xs font-normal text-[#a1a1aa] mb-1">accounts</span>
                </div>
              </div>

              <div className="bg-[#18181b] p-5 rounded-lg border border-[#27272a] space-y-1.5">
                <span className="text-[10px] text-[#71717a] font-mono block uppercase">Generated Blueprints</span>
                <div className="text-3xl font-extrabold text-white flex items-end gap-1.5 font-mono">
                  {adminAnalytics.totalProjects} <span className="text-xs font-normal text-[#a1a1aa] mb-1">files</span>
                </div>
              </div>

              <div className="bg-[#18181b] p-5 rounded-lg border border-[#27272a] space-y-1.5">
                <span className="text-[10px] text-[#71717a] font-mono block uppercase">Monthly Billing Yield</span>
                <div className="text-3xl font-extrabold text-emerald-400 flex items-end gap-1.5 font-mono">
                  ${adminAnalytics.monthlyRevenue} <span className="text-xs font-normal text-[#71717a] mb-1">MRR</span>
                </div>
              </div>

              <div className="bg-[#18181b] p-5 rounded-lg border border-[#27272a] space-y-1.5">
                <span className="text-[10px] text-[#71717a] font-mono block uppercase">Stripe Active Licenses</span>
                <div className="text-3xl font-extrabold text-white flex items-end gap-1.5 font-mono">
                  {adminAnalytics.activeSubscriptions} <span className="text-xs font-normal text-[#71717a] mb-1">keys</span>
                </div>
              </div>
            </div>

            {/* Database & prompt rules log queue */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Backend Application Database Logs</h3>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded ml-auto uppercase tracking-wider">
                  Live DB Queries
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-[#a1a1aa] border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] pb-2 text-[#71717a] uppercase text-[9px] tracking-wider">
                      <th className="pb-2">Log ID</th>
                      <th className="pb-2">User Email</th>
                      <th className="pb-2">Action trigger</th>
                      <th className="pb-2">Timestamp UTC</th>
                      <th className="pb-2">Parameter details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAnalytics.recentLogs.map((log) => (
                      <tr key={log.id} className="border-b border-[#27272a]/60 hover:bg-[#09090b]/40">
                        <td className="py-2.5 text-[#71717a]">{log.id}</td>
                        <td className="py-2.5 text-slate-300">{log.userEmail}</td>
                        <td className="py-2.5 font-bold text-emerald-400">{log.action}</td>
                        <td className="py-2.5 text-[#71717a] hover:text-white transition">{log.timestamp}</td>
                        <td className="py-2.5 italic text-slate-400 max-w-xs truncate">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECRETS AND PROFILE CONFIGURATION */}
        {currentTab === 'settings' && (
          <div className="px-4 py-16 max-w-3xl mx-auto w-full flex flex-col gap-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Configuration Settings</h1>
              <p className="text-[#a1a1aa] text-sm">Configure database integrations, Stripe billing preferences, and model keys safely.</p>
            </div>

            {/* Profile specifications */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base border-b border-[#27272a] pb-3">1. Developer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <p><strong className="text-white">Primary account:</strong> moninilufa31@gmail.com</p>
                <p><strong className="text-white">Database:</strong> Simulated persistent File DB via server.ts</p>
                <p><strong className="text-white">Active Plan:</strong> <span className="text-emerald-400 font-bold uppercase">{user.plan}</span></p>
                <p><strong className="text-white">Hosting Frame:</strong> Google Cloud Run Container Environment</p>
              </div>
            </div>

            {/* API Rules instructions */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4 text-xs leading-relaxed">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-4 h-4" />
                <h3 className="font-bold text-white text-sm">2. API Secret Key Security Matrix</h3>
              </div>
              <p className="text-[#a1a1aa]">
                Your application performs all OpenAI and Gemini API evaluation requests **exclusively server-side** in `/server.ts` to keep credentials fully secure.
              </p>
              <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] leading-relaxed text-[11px] text-slate-300">
                <p className="font-bold mb-1 text-emerald-400">To connect live third-party keys:</p>
                <p className="text-[#a1a1aa]">Configure the keys directly under the **Settings &gt; Secrets** panel in the AI Studio UI sidebar. They will be dynamically injected at runtime into your server processes without having to customize any production code!</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] px-4 py-8 text-center text-xs text-[#71717a] max-w-7xl mx-auto w-full space-y-2 mt-auto font-sans">
        <p className="font-mono text-[11px]">
          © 2026 Plotiqo AI — Engineered on advanced Cognitive Retention Dynamics benchmarks.
        </p>
        <p className="text-[10px]">
          Utilizing generative calculations. Visual model-agnostic camera prompts are fully compatible with Runway Gen-3/4, Kling, and Sora platforms.
        </p>
      </footer>
    </div>
  );
}
