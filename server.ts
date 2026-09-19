import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import dotenv from "dotenv";
import * as db from "./server/db";
import { sendContactEmail, validateContactPayload } from "./server/mail";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// ── Vercel Detection ──
const IS_VERCEL = !!process.env.VERCEL;

// ── CORS Middleware (CRITICAL for Vercel deployments) ──
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://www.foliobyjake.com',
    'https://foliobyjake.com',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    // Allow all Vercel preview deployments
    /^https:\/\/.*\.vercel\.app$/
  ].filter(Boolean);

  const origin = req.headers.origin || '';
  const isAllowed = allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') return origin === allowed;
    return allowed?.test(origin);
  });

  if (isAllowed || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Force Cache-Control headers on all API routes so browsers & proxies never serve stale cached data
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[Express Admin CMS] ${req.method} ${req.url}`);

  // Vercel serverless routing edge case workaround
  const apiPaths = ["/projects", "/categories", "/media", "/auth", "/contacts", "/analytics"];
  const isApiPath = apiPaths.some(p => req.url && req.url.startsWith(p));

  if (isApiPath && !req.url.startsWith("/api")) {
    const originalUrl = req.url;
    req.url = "/api" + (originalUrl.startsWith("/") ? "" : "/") + originalUrl;
    console.log(`[Serverless Compatible Router] Rewrote: ${originalUrl} -> ${req.url}`);
  }

  next();
});

// ── Local Uploads (dev-only; production uploads go to Cloudinary from the client) ──
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!IS_VERCEL) {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.log("Could not pre-create local uploads directory (non-fatal):", err);
  }
  app.use("/uploads", express.static(UPLOADS_DIR));
}

let upload: any = null;
if (!IS_VERCEL) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
  });
  upload = multer({ storage });
}

// Small helper so every route doesn't need its own try/catch boilerplate
function handle(fn: (req: express.Request, res: express.Response) => Promise<void>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res).catch(next);
  };
}

// ───── API ROUTES ─────

// Read-only Sync Endpoint (returns current database state without allowing destructive overwrites)
app.get("/api/sync", handle(async (req, res) => {
  const [projects, categories, media] = await Promise.all([
    db.getProjects("admin"),
    db.getCategories(),
    db.getMedia(),
  ]);
  res.json({ success: true, projects, categories, media });
}));

// Auth Mock login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const expectedUsername = process.env.USERNAME || "admin";
  const expectedPassword = process.env.PASSWORD || "admin";

  if (username === expectedUsername && password === expectedPassword) {
    res.json({ success: true, token: "mock-jwt-token-jake-cm-system" });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password" });
  }
});

// Categories Endpoints
app.get("/api/categories", handle(async (req, res) => {
  res.json(await db.getCategories());
}));

app.post("/api/categories", handle(async (req, res) => {
  const { name } = req.body;
  if (!name) return void res.status(400).json({ error: "Category name required" });
  res.status(201).json(await db.createCategory(name));
}));

app.put("/api/categories/:id", handle(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    res.json(await db.updateCategory(id, name || ""));
  } catch (err: any) {
    if (err.message === "Category not found") return void res.status(404).json({ error: err.message });
    throw err;
  }
}));

app.delete("/api/categories/:id", handle(async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteCategory(id);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message === "Category not found") return void res.status(404).json({ error: err.message });
    throw err;
  }
}));

// Projects Endpoints
app.get("/api/projects", handle(async (req, res) => {
  const { view } = req.query;
  res.json(await db.getProjects(typeof view === "string" ? view : undefined));
}));

app.get("/api/projects/:id", handle(async (req, res) => {
  const projectId = Number(req.params.id);
  const inc = req.query.increment === "true";

  const project = inc ? await db.incrementProjectViews(projectId) : await db.getProject(projectId);
  if (!project) return void res.status(404).json({ error: "Project not found" });
  res.json(project);
}));

app.post("/api/projects", handle(async (req, res) => {
  const newProjectData = req.body;
  if (!newProjectData.name) {
    return void res.status(400).json({ error: "Project name is required" });
  }
  const newProj = await db.createProject(newProjectData);
  res.status(201).json(newProj);
}));

// Reorder Projects Endpoint
app.post("/api/projects/reorder", handle(async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return void res.status(400).json({ error: "orderedIds array required" });
  }
  const projects = await db.reorderProjects(orderedIds.map(Number));
  res.json({ success: true, projects });
}));

app.put("/api/projects/:id", handle(async (req, res) => {
  const projectId = Number(req.params.id);
  const updated = await db.updateProject(projectId, req.body);
  if (!updated) return void res.status(404).json({ error: "Project not found" });
  res.json(updated);
}));

app.post("/api/projects/:id/duplicate", handle(async (req, res) => {
  const projectId = Number(req.params.id);
  const duplicate = await db.duplicateProject(projectId);
  if (!duplicate) return void res.status(404).json({ error: "Project not found" });
  res.status(201).json(duplicate);
}));

app.delete("/api/projects/:id", handle(async (req, res) => {
  const projectId = Number(req.params.id);
  const ok = await db.deleteProject(projectId);
  if (!ok) return void res.status(404).json({ error: "Project not found" });
  res.json({ success: true });
}));

// Media Library Endpoints
app.get("/api/media", handle(async (req, res) => {
  res.json(await db.getMedia());
}));

app.post("/api/media", handle(async (req, res) => {
  const { url, name, type } = req.body;
  if (!url || !name) return void res.status(400).json({ error: "Media URL and Name are required" });
  res.status(201).json(await db.addMedia({ url, name, type }));
}));

// Media Upload Endpoint (conditional on environment)
app.post("/api/media/upload", (req, res, next) => {
  // Reject on Vercel
  if (IS_VERCEL || !upload) {
    return void res.status(503).json({
      error: "Local file uploads unavailable on this deployment. Please use Cloudinary URLs instead.",
      hint: "Upload your files to Cloudinary and paste the secure_url here."
    });
  }

  // Process with multer on local/dev
  upload.single("file")(req, res, next);
}, handle(async (req, res) => {
  if (!req.file) {
    return void res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const fileName = req.body.name || req.file.originalname;
  const fileType = req.file.mimetype.startsWith("video/") ? "video" : "image";
  const sizeKb = Math.round(req.file.size / 1024);
  const sizeStr = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

  const asset = await db.addMedia({ url: fileUrl, name: fileName, type: fileType, size: sizeStr });
  res.status(201).json(asset);
}));

app.delete("/api/media/:id", handle(async (req, res) => {
  const { id } = req.params;
  const ok = await db.removeMedia(id);
  if (!ok) return void res.status(404).json({ error: "Media not found" });
  res.json({ success: true });
}));

// Contact form — send email via SMTP, then increment analytics
app.post("/api/contacts", handle(async (req, res) => {
  const parsed = validateContactPayload(req.body);
  if (!parsed.ok) {
    return void res.status(400).json({ success: false, message: parsed.error });
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (err) {
    console.error("Contact email failed:", err);
    return void res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }

  const count = await db.incrementContacts();
  res.json({ success: true, count });
}));

app.post("/api/contacts/increment", handle(async (req, res) => {
  const count = await db.incrementContacts();
  res.json({ success: true, count });
}));

// Analytics Dashboard
app.get("/api/analytics", handle(async (req, res) => {
  const [projects, contactsCount] = await Promise.all([
    db.getProjects("admin"),
    db.getContactsCount(),
  ]);

  const totalProjects = projects.length;
  const featuredProjects = projects.filter(p => p.isFeatured).length;
  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);

  const categoryViewsMap: Record<string, number> = {};
  projects.forEach(p => {
    categoryViewsMap[p.category] = (categoryViewsMap[p.category] || 0) + (p.views || 0);
  });

  const categoryViews = Object.entries(categoryViewsMap).map(([category, views]) => ({ category, views }));

  const projectViews = projects
    .map(p => ({ name: p.name, views: p.views || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const viewsOverTime = [
    { date: "Mon", views: Math.floor(totalViews * 0.12) },
    { date: "Tue", views: Math.floor(totalViews * 0.14) },
    { date: "Wed", views: Math.floor(totalViews * 0.18) },
    { date: "Thu", views: Math.floor(totalViews * 0.22) },
    { date: "Fri", views: Math.floor(totalViews * 0.16) },
    { date: "Sat", views: Math.floor(totalViews * 0.10) },
    { date: "Sun", views: Math.floor(totalViews * 0.08) }
  ];

  res.json({
    totalProjects,
    featuredProjects,
    totalViews,
    contactRequests: contactsCount,
    viewsOverTime,
    projectViews,
    categoryViews
  });
}));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error captured:", err);
  res.status(err.status || 500).json({
    error: {
      code: String(err.status || 500),
      message: err.message || "An internal server error occurred.",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// ── Vite & Static File Configuration ──
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/uploads/**']
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${IS_VERCEL ? 'Vercel (Serverless)' : 'Local/Development'}`);
    console.log(`✓ Database: Supabase (Postgres)`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
