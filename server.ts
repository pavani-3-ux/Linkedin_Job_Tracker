import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Database Initialization & Seeding helper
const DB_FILE = path.join(process.cwd(), "data", "db.json");

const verifyDbDir = () => {
  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
};

const getInitialData = () => ({
  applications: [
    {
      id: "app-1",
      companyName: "Google",
      role: "User Experience Engineer",
      location: "Mountain View, CA (Hybrid)",
      salary: "$185,000 - $210,000",
      applicationDate: "2026-06-05",
      jobLink: "https://careers.google.com/jobs/results/ux-engineer",
      recruiterName: "Michael Green",
      recruiterEmail: "m.green@google.com",
      status: "Applied",
      notes: "Referral from Senior Frontend Lead Dave. Focus on WebGL, animations, accessibility and performance. Needs algorithms prep."
    },
    {
      id: "app-2",
      companyName: "Stripe",
      role: "Senior Product Engineer",
      location: "South San Francisco, CA (Hybrid)",
      salary: "$210,000 - $235,000",
      applicationDate: "2026-06-03",
      jobLink: "https://stripe.com/jobs/senior-ui",
      recruiterName: "Sarah Jenkins",
      recruiterEmail: "s.jenkins@stripe.com",
      status: "Interview Scheduled",
      notes: "Chat with hiring manager went exceptionally well. Discussed Linear-style animations and custom financial visualization canvases."
    },
    {
      id: "app-3",
      companyName: "Linear",
      role: "Product & Canvas Engineer",
      location: "Remote (Global)",
      salary: "$195,000 + Equity",
      applicationDate: "2026-06-01",
      jobLink: "https://linear.app/careers/canvas-engineer",
      recruiterName: "Karri Saarinen",
      recruiterEmail: "k.saarinen@linear.app",
      status: "Assessment",
      notes: "Frontend visual test. Built a nested graph viewport with keyboard shortcut bindings. Expecting feedback shortly."
    },
    {
      id: "app-4",
      companyName: "Notion",
      role: "Frontend Architect (Editor Team)",
      location: "San Francisco, CA",
      salary: "$225,000 - $250,000",
      applicationDate: "2026-05-28",
      jobLink: "https://notion.so/careers/front-end-editor",
      recruiterName: "Alice Wonder",
      recruiterEmail: "a.wonder@notion.so",
      status: "Final Round",
      notes: "Systems and editor collaborative sync round. Practice CRDTs, OT engines, selection boundaries, and RichText API abstractions."
    },
    {
      id: "app-5",
      companyName: "Vercel",
      role: "Principal Developer Advocate",
      location: "Hybrid (SF or NYC)",
      salary: "$240,000",
      applicationDate: "2026-05-20",
      jobLink: "https://vercel.com/careers/pda",
      recruiterName: "Guillermo Rauch",
      recruiterEmail: "g@vercel.com",
      status: "Offer Received",
      notes: "Offer received! Base: $240k + custom equity + performance pool. Discussing starting date and signing bonus details."
    },
    {
      id: "app-6",
      companyName: "Netflix",
      role: "Core Player UI Architect",
      location: "Los Gatos, CA",
      salary: "$320,000 Base Cash",
      applicationDate: "2026-05-15",
      jobLink: "https://netflix.com/careers/ui-architect",
      recruiterName: "Marcus Brody",
      recruiterEmail: "m.brody@netflix.com",
      status: "Rejected",
      notes: "Technical metrics system design was complex. Highlighted streaming video telemetry, viewport lazy buffer allocation. Reapply in 1 year."
    },
    {
      id: "app-7",
      companyName: "Slack",
      role: "Staff Software Engineer",
      location: "Remote",
      salary: "$205,000",
      applicationDate: "2026-06-07",
      jobLink: "https://slack.com/careers/staff-eng",
      recruiterName: "Emily Blunt",
      recruiterEmail: "e.blunt@slack.com",
      status: "Under Review",
      notes: "Submitted via referral. Focus on real-time canvas integration and heavy workspace offline syncing."
    }
  ],
  interviews: [
    {
      id: "int-1",
      applicationId: "app-2",
      title: "Stripe Team Technical Screen",
      date: "2026-06-12T14:00:00.000Z",
      type: "Technical Live Coding",
      zoomLink: "https://stripe.zoom.us/j/93821039121",
      notes: "Be prepared to implement custom layout containers and SVG animations of payment transactions. High interactive polish required.",
      feedback: "",
      score: 5,
      completed: false
    },
    {
      id: "int-2",
      applicationId: "app-4",
      title: "Notion Systems Round",
      date: "2026-06-16T16:30:00.000Z",
      type: "System Design",
      zoomLink: "https://notion.zoom.us/j/12293810239",
      notes: "Collaborative rich-text editor real-time synchronization with CRDT/OT structures, offline conflict resolution, and memory footprint budgets.",
      feedback: "",
      score: 5,
      completed: false
    }
  ],
  notifications: [
    {
      id: "not-1",
      type: "interview",
      message: "Upcoming Stripe Technical Screen in 3 days! Check your practice questions.",
      date: "2026-06-09T08:00:00.000Z",
      read: false
    },
    {
      id: "not-2",
      type: "offer",
      message: "Offer received from Vercel! Principal Developer Advocate. Outstanding job!",
      date: "2026-06-08T18:30:00.000Z",
      read: false
    }
  ],
  activity_logs: [
    {
      id: "log-1",
      timestamp: "2026-06-09T06:12:00.000Z",
      action: "Created Google Job application (UX Engineer)"
    },
    {
      id: "log-2",
      timestamp: "2026-06-08T18:30:00.000Z",
      action: "Received official Principal Developer Offer from Vercel Editor/HM Loop"
    }
  ],
  achievements: [
    {
      id: "ach-1",
      badge: "First Callback",
      description: "Get at least one callback for an interview.",
      unlocked: true,
      unlockedAt: "2026-06-01T12:00:00.000Z"
    },
    {
      id: "ach-2",
      badge: "Dream Applied",
      description: "Applied to at least 1 Tier-1 target profile.",
      unlocked: true,
      unlockedAt: "2026-06-05T09:00:00.000Z"
    },
    {
      id: "ach-3",
      badge: "First Offer",
      description: "Received an official offer to negotiate.",
      unlocked: true,
      unlockedAt: "2026-06-08T18:30:00.000Z"
    },
    {
      id: "ach-4",
      badge: "100 Club",
      description: "Submit 5 total verified premium app records.",
      unlocked: true,
      unlockedAt: "2026-06-05T10:00:00.000Z"
    }
  ]
});

const loadDb = () => {
  verifyDbDir();
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting to defaults", err);
    return getInitialData();
  }
};

const saveDb = (data: any) => {
  verifyDbDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- DATA ROUTES ---

// Applications Endpoints
app.get("/api/applications", (req, res) => {
  const db = loadDb();
  res.json(db.applications);
});

app.post("/api/applications", (req, res) => {
  const db = loadDb();
  const newApp = {
    id: `app-${Date.now()}`,
    ...req.body
  };
  db.applications.unshift(newApp);

  // Add history log
  const log = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `Added Application: ${newApp.role} at ${newApp.companyName}`
  };
  db.activity_logs.unshift(log);

  // Check achievements - 5 applications is "100 Club"
  const unlockAward = db.applications.length >= 5;
  db.achievements = db.achievements.map((ach: any) => {
    if (ach.badge === "100 Club" && !ach.unlocked && unlockAward) {
      return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
    }
    return ach;
  });

  saveDb(db);
  res.status(201).json(newApp);
});

app.put("/api/applications/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const index = db.applications.findIndex((item: any) => item.id === id);

  if (index !== -1) {
    const original = db.applications[index];
    const updated = { ...original, ...req.body };
    db.applications[index] = updated;

    // Log if status changed
    if (original.status !== updated.status) {
      db.activity_logs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: `Moved ${updated.companyName} (${updated.role}) to "${updated.status}"`
      });

      // Unlock "Dream Applied" or callback
      if (updated.status === "Interview Scheduled" || updated.status === "Final Round") {
        db.achievements = db.achievements.map((ach: any) => {
          if (ach.badge === "First Callback" && !ach.unlocked) {
            return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return ach;
        });
      }

      if (updated.status === "Offer Received") {
        db.achievements = db.achievements.map((ach: any) => {
          if (ach.badge === "First Offer" && !ach.unlocked) {
            return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return ach;
        });
      }
    }

    saveDb(db);
    res.json(updated);
  } else {
    res.status(404).json({ error: "Application not found" });
  }
});

app.delete("/api/applications/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const originalLength = db.applications.length;
  db.applications = db.applications.filter((item: any) => item.id !== id);

  if (db.applications.length !== originalLength) {
    db.activity_logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Deleted application record ${id}`
    });
    saveDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Application not found" });
  }
});

// Interviews Endpoints
app.get("/api/interviews", (req, res) => {
  const db = loadDb();
  res.json(db.interviews);
});

app.post("/api/interviews", (req, res) => {
  const db = loadDb();
  const newInt = {
    id: `int-${Date.now()}`,
    feedback: "",
    score: 5,
    completed: false,
    ...req.body
  };
  db.interviews.unshift(newInt);

  // Auto trigger a system alert
  const appItem = db.applications.find((a: any) => a.id === newInt.applicationId);
  const company = appItem ? appItem.companyName : "Target";
  db.notifications.unshift({
    id: `not-${Date.now()}`,
    type: "interview",
    message: `${newInt.type} for ${company} scheduled. Preparation checklist updated.`,
    date: new Date().toISOString(),
    read: false
  });

  saveDb(db);
  res.status(201).json(newInt);
});

app.put("/api/interviews/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const index = db.interviews.findIndex((item: any) => item.id === id);

  if (index !== -1) {
    const updated = { ...db.interviews[index], ...req.body };
    db.interviews[index] = updated;
    saveDb(db);
    res.json(updated);
  } else {
    res.status(404).json({ error: "Interview record not found" });
  }
});

app.delete("/api/interviews/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  db.interviews = db.interviews.filter((item: any) => item.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Notifications
app.get("/api/notifications", (req, res) => {
  const db = loadDb();
  res.json(db.notifications);
});

app.post("/api/notifications/:id/read", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  db.notifications = db.notifications.map((n: any) => {
    if (n.id === id) {
      return { ...n, read: true };
    }
    return n;
  });
  saveDb(db);
  res.json({ success: true });
});

// Logs & Gamification
app.get("/api/dashboard-meta", (req, res) => {
  const db = loadDb();
  res.json({
    activityLogs: db.activity_logs.slice(0, 10),
    achievements: db.achievements,
    streak: 8, // hardcoded streak for visual effect
    weeklyGoal: { progress: 4, target: 5 }
  });
});

// Reset demo seed
app.post("/api/seed", (req, res) => {
  const defaultData = getInitialData();
  saveDb(defaultData);
  res.json({ success: true, message: "Database re-seeded with premium demo data." });
});


// --- GEMINI CO-PILOT ENDPOINTS (SERVER-SIDE) ---

// 1. AI Resume Score
app.post("/api/ai/resume-score", async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Elegant fallback simulation if user has not loaded their exact API Key yet
    return res.json({
      fallback: true,
      score: 84,
      overview: "Your profile demonstrates outstanding Frontend UI engineering capabilities, matching Vercel/Linear architectures nicely. Key keywords like 'Webpack' are present, but 'System Telemetry' is missing, impacting ATS scoring.",
      suggestions: [
        "Include production metrics on cumulative load speed enhancements (e.g., 'Reduced Core Web Vitals LCP by 40%').",
        "Add explicit state sync paradigms such as CRDTs, OT or local indexedDB storage structures.",
        "Include testing framework paradigms such as Playwright or MSW representation."
      ],
      fitAnalysis: "Highly qualified. Your background aligns with 85% of critical skills. Add server-side systems knowledge."
    });
  }

  try {
    const prompt = `You are a professional recruiting coordinator. Your objective is to grade a user's resume or highlights against a job description. 
    Analyze this candidate's resume/profile highlights:
    "${resumeText || "Senior React frontend developer with experience in rendering performance, high design systems, and client database caching."}"
    
    Against this Target Job Description:
    "${jobDescription || "Frontend Developer specialized in high animation performance, browser canvas layouts, and state optimization."}"
    
    Structure your answer as custom JSON with these keys: "score" (integer 0-100), "overview" (string summary), "suggestions" (array of strings, specific ATS actionable items), "fitAnalysis" (string explanation of technical skill alignment). Only output valid, clean JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            overview: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            fitAnalysis: { type: Type.STRING }
          },
          required: ["score", "overview", "suggestions", "fitAnalysis"]
        }
      }
    });

    const bodyText = response.text || "{}";
    res.json(JSON.parse(bodyText.trim()));
  } catch (err: any) {
    console.error("Gemini API Error structure:", err);
    res.status(500).json({ error: "Gemini server failed to finalize scoring", details: err.message });
  }
});

// 2. AI Interview Prep
app.post("/api/ai/prep-interview", async (req, res) => {
  const { companyName, roleName, candidateNotes, userDraftAnswer } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      fallback: true,
      questions: [
        {
          id: "q-1",
          question: "Can you describe a scenario where you had to dramatically optimize rendering speed or animations in React?",
          hint: "Highlight React.memo, virtualized viewports, layout reflow debounces, and GPU-accelerated motion CSS properties."
        },
        {
          id: "q-2",
          question: "How do you decide between Client State (e.g. Context, signals) and Server State (e.g., query, local synchronization storage)?",
          hint: "Focus on latency tolerance, multi-session mutations, and caching logic."
        }
      ],
      feedback: userDraftAnswer ? `Excellent focus on standard hooks! To make this answer linear-grade: quantify your accomplishments (e.g., 'saved 14ms of render block cycles') and mention rendering profiles under Chrome DevTools performance audits.` : "Input your answer draft below and hit submit to get tailored AI review and guidance."
    });
  }

  try {
    const prompt = `You are a Lead Software Architect at a tier-1 startup. 
    Select 2 deep technical interview questions for a candidate preparing for:
    Company: ${companyName || "A Premium SaaS"}
    Role: ${roleName || "Senior Software Engineer"}
    Context of Candidate: ${candidateNotes || "React, TypeScript, CSS layout design"}
    
    If this user provided an draft answer: "${userDraftAnswer || ""}", provide exact constructive feedback to upgrade their answer structure. If no draft was provided, return empty feedback.
    
    Respond in JSON format with keys: "questions" (array of objects containing: "id", "question", "hint"), "feedback" (string containing review on user draft answer).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  hint: { type: Type.STRING }
                },
                required: ["id", "question", "hint"]
              }
            },
            feedback: { type: Type.STRING }
          },
          required: ["questions", "feedback"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AI Cover Letter Generator
app.post("/api/ai/cover-letter", async (req, res) => {
  const { companyName, roleName, customHighlights } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      fallback: true,
      letter: `Dear Hiring Team at ${companyName || "[Company]"},

I am thrilled to submit my application for the ${roleName || "[Role]"} opportunity. Having spent several years engineering high-performance canvas systems, responsive interfaces, and offline-persistent state caches, your recent technical announcements perfectly match my architectural principles.

In my recent positions, I focused deeply on user interaction and frontend rendering speed. Specifically, I led:
- Modern reactive refactoring that reduced telemetry rendering delays by 50%.
- Seamless design synchronization using custom UI libraries and custom animation timings.
- Implementing offline state reconciliation using local database indices.

I'm extremely impressed by your focus on visual elegance and fast delivery. I would appreciate the opportunity to share how my engineering habits can accelerate your timeline for high-fidelity SaaS development.

Sincerely,
[Your Name]
Career Command Center Candidate`
    });
  }

  try {
    const prompt = `You are an elite developer career coach. Draft a highly compelling, modern, non-cliché, professional, persuasive short cover letter for:
    Role: ${roleName || "Staff Frontend Engineer"}
    Company: ${companyName || "Stripe"}
    Highlights: ${customHighlights || "reducing startup load, modern animations, clean typography design habit"}
    
    Focus on quantified impact, strong design layout values, and direct tone. Ensure there are no boring boilerplate statements. Return a JSON with key "letter". Only return valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            letter: { type: Type.STRING }
          },
          required: ["letter"]
        }
      }
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. AI Job Match Score
app.post("/api/ai/match-score", async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      fallback: true,
      score: 88,
      factors: [
        { label: "Design Systems & Tailwind CSS", value: 95 },
        { label: "Frontend State Synchronization", value: 85 },
        { label: "Engineering Performance Metrics", value: 78 }
      ],
      unmatchedKeywords: ["GraphQL APIs", "WebSockets Subscriptions", "Cypress integration tests"]
    });
  }

  try {
    const prompt = `Assess match breakdown score of resume highlights against target descriptions.
    Resume: "${resumeText || ""}"
    Job: "${jobDescription || ""}"
    Return JSON with key "score" (integer), "factors" (array of objects with "label" string and "value" integer 0-100), and "unmatchedKeywords" (array of strings).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            factors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.INTEGER }
                },
                required: ["label", "value"]
              }
            },
            unmatchedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "factors", "unmatchedKeywords"]
        }
      }
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. AI Career Insights
app.post("/api/ai/insights", async (req, res) => {
  const ai = getGeminiClient();
  const db = loadDb();

  // Create summary of applications to send as structural context
  const appsSummary = db.applications.map((a: any) => `${a.role} at ${a.companyName} (${a.status})`).join("\n");

  if (!ai) {
    return res.json({
      fallback: true,
      marketInsight: "The market is demanding high visual expertise coupled with systems latency skills. 'Frontend Architects' with hybrid capability are fetching 20% premium multiples.",
      personalStrategy: "Your portfolio has active tracks with heavy design-conscious startups (Stripe, Linear, Notion, Vercel). Double-down on custom pixel architectures and showcase real live interactive views.",
      recommendedActions: [
        "Reach out to Michael Green on Google UX Engineering tracking.",
        "Practice collaborative systems whiteboard sessions for Notion Editor round.",
        "Structure Vercel start parameters before next Friday's offer negotiation window."
      ]
    });
  }

  try {
    const prompt = `Give tailored professional job search direction insights based on the user's current active applications track list:
    ${appsSummary}
    
    Provide custom JSON with keys: "marketInsight" (string), "personalStrategy" (string), "recommendedActions" (array of strings). Do not return markdown, just valid JSON output.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketInsight: { type: Type.STRING },
            personalStrategy: { type: Type.STRING },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["marketInsight", "personalStrategy", "recommendedActions"]
        }
      }
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- SERVING FRONTEND VITE MIDDLEWARE ---

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving from built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Career Command Center] Server booting. Run port: ${PORT}`);
  });
}

startServer();
