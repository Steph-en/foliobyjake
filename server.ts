import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { Category, Project, ProjectStatus, AnalyticsSummary, MediaAsset, CaseStudySection } from "./src/types";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use(express.json());

// Log all incoming requests to Express
app.use((req, res, next) => {
  console.log(`[Express Admin CMS] ${req.method} ${req.url}`);
  next();
});

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure directories exist
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.log("Could not pre-create local directories (non-fatal, possibly read-only host):", err);
}

// Serve uploaded files statically at /uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Initial Works Preseeding
const INITIAL_WORKS: Project[] = [
  {
    id: 1,
    name: 'Fixed Youth Conference',
    slug: 'fixed-youth-conference',
    category: 'Graphic Design',
    previewVideo: 'https://player.cloudinary.com/embed/?cloud_name=degd6ahfu&public_id=fxdythconcover_ll2nfk&autoplay=true&muted=true&loop=true&player[hide_controls]=true',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576064/1_ovs88o.jpg',
    description: 'A COMPREHENSIVE BRANDING PROJECT FOR A FAITH-BASED YOUTH CONFERENCE, FOCUSED ON CREATING A BOLD, CULTURALLY RELEVANT VISUAL IDENTITY ROOTED IN THE MESSAGE OF THE GOSPEL.',
    longDescription: 'This project involved developing a complete visual identity for FIXED YOUTH CON 2026, a dynamic youth conference hosted by EWC FIXED Teens Church. The objective was to translate a deeply spiritual message into a modern, engaging brand that resonates with today\'s generation. The challenge was to balance clarity of the Gospel message with high-impact visual storytelling that feels fresh, youthful, and culturally aligned. The identity system was built from the ground up, including logo design, typography direction, color systems, and scalable assets across digital and print platforms.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/14_zlxozl.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/2_jrisoo.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/3_ba5hmh.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576071/26_rt15ep.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/30_dzuiob.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/5_fdzjf1.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/7_olui9d.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/18_bajx9j.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/35_uyjv3j.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/9_fca1fd.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/4_kluty2.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/12_asdues.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/11_siobas.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/36_xsjomz.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/8_ichaae.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576067/16_qzf6d1.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/29_f31vsf.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/32_octwo6.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/31_d8cihb.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/20_jgxzsl.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/10_y7cf9b.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/17_gb6giz.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/28_oraqjh.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576071/24_pvjohp.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576070/22_adh37d.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576068/6_crc8p6.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576065/13_p6u3vy.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576071/25_hc0q6y.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576072/27_pnxxlm.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576073/33_kpffn1.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576069/19_hyst5x.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/15_fs5nui.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576070/21_lcp79w.jpg',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775130820/IMG_5038_huih0w.mp4',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775130687/IMG_5040_ooqaiq.mp4',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775169590/IMG_5064_9.43.22_PM_zr5dij.mov',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1775130954/IMG_5039_ngvq7u.mp4',
    ],
    client: 'EWC Fixed Teen\'s Church',
    year: '2026',
    role: 'Lead Conference Brand Designer',
    status: 'published',
    isFeatured: true,
    views: 1240,
    seoTitle: 'Fixed Youth Conference 2026 Branding - Jake Amponsah',
    seoDescription: 'Case study of the comprehensive branding system designed for FIXED Teens Church youth conference in Accra, Ghana.',
    seoKeywords: 'Branding, Faith, Youth Conference, Graphic Design, Ghana',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576064/1_ovs88o.jpg',
    sections: []
  },
  {
    id: 2,
    name: 'UAI by TúNiyi',
    slug: 'uai-by-tuniyi',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/c_thumb,g_face,w_800/v1774561640/tuniyi_PORTRAIT_COVER_yxvs6h.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442003/bannner_r79veh.jpg',
    description: 'A BRAND IDENTITY FOR A CONCEPTUAL FASHION LABEL EXPLORING THE INTERSECTION OF HUMAN VISION, SELF-EXPRESSION, AND ARTIFICIAL INTELLIGENCE.',
    longDescription: 'Developed for UAl by TúNiyi, this project transforms the philosophy "You Are Important" into a visually striking and intellectually grounded brand system. Inspired by the spectrum of human vision (20/20–20/200), the identity challenges how individuals perceive and utilize fashion as a form of expression.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442415/Jeans_Mock_up_gcktgr.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442667/STYLING_300x-100_dkbtrs.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442666/CLOTHES_AND_MERCH_300x-100_mnxlwj.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442413/Sweatshirt_2_Mock_Up_zfoxuf.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442411/tuniyi_post_5_wxbsdm.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442409/Free_Poster_Mockup_hhudxf.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442008/tuniyi_post_6_d52cbe.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442411/Sweatshirt_Mock_Up_knhws5.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442407/Citylight_Mockup_2_oxd0ju.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442008/Vector_Smart_Object_u7u9um.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442410/BRAND_IDENTITY_300x-100_e73mdy.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774471199/tuniyi_post_1_qy6fn1.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442418/tuniyi_post_2_yrrulk.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442006/FREE-Silk-Scarf-Mockup-Studio-Series-DEMO_By-Mocku_yyuggy.png',
    ],
    client: 'TúNiyi',
    year: '2025',
    role: 'Brand Identity Designer',
    status: 'published',
    isFeatured: true,
    views: 890,
    seoTitle: 'UAI by TúNiyi Brand Identity - Jake Amponsah',
    seoDescription: 'Explore the comprehensive graphic identity and branding system built for the UAI conceptual fashion label exploring self-expression, human vision, and artificial intelligence.',
    seoKeywords: 'UAI by TuNiyi, Brand Identity, Fashion Branding, Graphic Design, Jake Amponsah, Typographic Design, Editorial Design',
    seoOgImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442003/bannner_r79veh.jpg',
    sections: []
  },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Graphic Design', slug: 'graphic-design' },
  { id: 'cat2', name: 'Motion Graphics', slug: 'motion-graphics' }
];

const INITIAL_MEDIA: MediaAsset[] = [
  { id: 'm1', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576064/1_ovs88o.jpg', name: 'Youth Conference Hero', type: 'image', size: '1.2 MB', createdAt: new Date().toISOString() },
  { id: 'm2', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442003/bannner_r79veh.jpg', name: 'UAI Banner', type: 'image', size: '840 KB', createdAt: new Date().toISOString() },
];

interface LocalDatabase {
  projects: Project[];
  categories: Category[];
  media: MediaAsset[];
  contactsCount: number;
}

// Initialize database with defaults
let db: LocalDatabase = {
  projects: INITIAL_WORKS,
  categories: INITIAL_CATEGORIES,
  media: INITIAL_MEDIA,
  contactsCount: 14
};

// Read database from file or use defaults
if (fs.existsSync(DB_FILE)) {
  try {
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    if (rawData && rawData.trim()) {
      const parsed = JSON.parse(rawData);
      db = parsed;
    }
  } catch (err) {
    console.warn("Failed to read db.json, using defaults:", err);
    db = {
      projects: INITIAL_WORKS,
      categories: INITIAL_CATEGORIES,
      media: INITIAL_MEDIA,
      contactsCount: 14
    };
  }
} else {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.warn("Unable to write db.json during seeding (expected in serverless/read-only env):", err);
  }
}

// Ensure database structure is valid
function validateDatabase() {
  if (!db || typeof db !== "object") {
    console.warn("[DB Validation] Database is invalid, resetting to defaults");
    db = {
      projects: INITIAL_WORKS,
      categories: INITIAL_CATEGORIES,
      media: INITIAL_MEDIA,
      contactsCount: 14
    };
  }
  if (!Array.isArray(db.projects)) {
    console.warn("[DB Validation] db.projects is not an array, resetting");
    db.projects = INITIAL_WORKS;
  }
  if (!Array.isArray(db.categories)) {
    console.warn("[DB Validation] db.categories is not an array, resetting");
    db.categories = INITIAL_CATEGORIES;
  }
  if (!Array.isArray(db.media)) {
    console.warn("[DB Validation] db.media is not an array, resetting");
    db.media = INITIAL_MEDIA;
  }
  if (typeof db.contactsCount !== "number") {
    db.contactsCount = 14;
  }
}

// Validate on startup
validateDatabase();

function saveDb() {
  try {
    validateDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.warn("Unable to write db.json: changes won't persist across serverless instances.", err);
  }
}

// ───── API ROUTES ─────

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
app.get("/api/categories", (req, res) => {
  try {
    validateDatabase();
    res.json(db.categories);
  } catch (err) {
    console.error("[API Error] /api/categories failed:", err);
    res.status(500).json({ error: { message: "Failed to fetch categories" } });
  }
});

app.post("/api/categories", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Category name required" });

  const id = "cat" + (db.categories.length + 1) + "_" + Date.now();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const newCat = { id, name, slug };
  db.categories.push(newCat);
  saveDb();
  res.status(201).json(newCat);
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const catIdx = db.categories.findIndex(c => c.id === id);
  if (catIdx === -1) return res.status(404).json({ error: "Category not found" });

  if (name) {
    db.categories[catIdx].name = name;
    db.categories[catIdx].slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  saveDb();
  res.json(db.categories[catIdx]);
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const catIdx = db.categories.findIndex(c => c.id === id);
  if (catIdx === -1) return res.status(404).json({ error: "Category not found" });

  db.categories.splice(catIdx, 1);
  saveDb();
  res.json({ success: true });
});

// Projects Endpoints - FIXED
app.get("/api/projects", (req, res) => {
  try {
    validateDatabase();
    const { view } = req.query;
    
    // Ensure db.projects is an array
    if (!Array.isArray(db.projects)) {
      console.warn("[API] db.projects is not an array, resetting to defaults");
      db.projects = INITIAL_WORKS;
      saveDb();
    }
    
    const result = view === "admin" 
      ? db.projects 
      : db.projects.filter(p => p.status === "published");
    
    res.json(result);
  } catch (err) {
    console.error("[API Error] /api/projects failed:", err);
    res.status(500).json({ 
      error: { 
        message: "Failed to fetch projects",
        code: "PROJECTS_FETCH_ERROR"
      } 
    });
  }
});

app.get("/api/projects/:id", (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const inc = req.query.increment === "true";

    const project = db.projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (inc) {
      project.views = (project.views || 0) + 1;
      saveDb();
    }

    res.json(project);
  } catch (err) {
    console.error("[API Error] /api/projects/:id failed:", err);
    res.status(500).json({ error: { message: "Failed to fetch project" } });
  }
});

app.post("/api/projects", (req, res) => {
  try {
    const newProjectData = req.body;
    if (!newProjectData.name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const newId = db.projects.length > 0 ? Math.max(...db.projects.map(p => p.id)) + 1 : 1;
    const slug = newProjectData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newProj: Project = {
      id: newId,
      name: newProjectData.name,
      slug: newProjectData.slug || slug,
      category: newProjectData.category || "Graphic Design",
      description: newProjectData.description || "",
      longDescription: newProjectData.longDescription || "",
      client: newProjectData.client || "",
      year: newProjectData.year || "",
      role: newProjectData.role || "",
      previewImage: newProjectData.previewImage || "",
      previewVideo: newProjectData.previewVideo || "",
      heroImage: newProjectData.heroImage || "",
      heroVideo: newProjectData.heroVideo || "",
      gallery: newProjectData.gallery || [],
      status: newProjectData.status || "draft",
      isFeatured: !!newProjectData.isFeatured,
      views: 0,
      seoTitle: newProjectData.seoTitle || "",
      seoDescription: newProjectData.seoDescription || "",
      seoKeywords: newProjectData.seoKeywords || "",
      sections: newProjectData.sections || [],
      createdAt: new Date().toISOString()
    };

    db.projects.push(newProj);
    saveDb();
    res.status(201).json(newProj);
  } catch (err) {
    console.error("[API Error] /api/projects POST failed:", err);
    res.status(500).json({ error: { message: "Failed to create project" } });
  }
});

app.put("/api/projects/:id", (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const updatedData = req.body;

    const projectIdx = db.projects.findIndex(p => p.id === projectId);
    if (projectIdx === -1) return res.status(404).json({ error: "Project not found" });

    db.projects[projectIdx] = {
      ...db.projects[projectIdx],
      ...updatedData,
      id: projectId
    };

    saveDb();
    res.json(db.projects[projectIdx]);
  } catch (err) {
    console.error("[API Error] /api/projects/:id PUT failed:", err);
    res.status(500).json({ error: { message: "Failed to update project" } });
  }
});

app.post("/api/projects/:id/duplicate", (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const original = db.projects.find(p => p.id === projectId);
    if (!original) return res.status(404).json({ error: "Project not found" });

    const newId = db.projects.length > 0 ? Math.max(...db.projects.map(p => p.id)) + 1 : 1;
    const duplicateProj: Project = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${newId}`,
      isFeatured: false,
      views: 0,
      status: "draft",
      createdAt: new Date().toISOString()
    };

    db.projects.push(duplicateProj);
    saveDb();
    res.status(201).json(duplicateProj);
  } catch (err) {
    console.error("[API Error] /api/projects/:id/duplicate failed:", err);
    res.status(500).json({ error: { message: "Failed to duplicate project" } });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const projectIdx = db.projects.findIndex(p => p.id === projectId);
    if (projectIdx === -1) return res.status(404).json({ error: "Project not found" });

    db.projects.splice(projectIdx, 1);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    console.error("[API Error] /api/projects/:id DELETE failed:", err);
    res.status(500).json({ error: { message: "Failed to delete project" } });
  }
});

// Media Library Endpoints
app.get("/api/media", (req, res) => {
  try {
    validateDatabase();
    res.json(db.media);
  } catch (err) {
    console.error("[API Error] /api/media failed:", err);
    res.status(500).json({ error: { message: "Failed to fetch media" } });
  }
});

app.post("/api/media", (req, res) => {
  const { url, name, type } = req.body;
  if (!url || !name) return res.status(400).json({ error: "Media URL and Name are required" });

  const id = "m_" + Date.now();
  const asset: MediaAsset = {
    id,
    url,
    name,
    type: type || (url.includes("/video/") || url.endsWith(".mp4") ? "video" : "image"),
    size: "Custom Sync",
    createdAt: new Date().toISOString()
  };

  db.media.push(asset);
  saveDb();
  res.status(201).json(asset);
});

app.post("/api/media/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const fileName = req.body.name || req.file.originalname;
  const fileType = req.file.mimetype.startsWith("video/") ? "video" : "image";
  const sizeKb = Math.round(req.file.size / 1024);
  const sizeStr = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

  const assetId = "m_" + Date.now();
  const asset: MediaAsset = {
    id: assetId,
    url: fileUrl,
    name: fileName,
    type: fileType,
    size: sizeStr,
    createdAt: new Date().toISOString()
  };

  db.media.push(asset);
  saveDb();
  res.status(201).json(asset);
});

app.delete("/api/media/:id", (req, res) => {
  const { id } = req.params;
  const mediaIdx = db.media.findIndex(m => m.id === id);
  if (mediaIdx === -1) return res.status(404).json({ error: "Media not found" });

  db.media.splice(mediaIdx, 1);
  saveDb();
  res.json({ success: true });
});

// Increment Contact counting
app.post("/api/contacts/increment", (req, res) => {
  db.contactsCount = (db.contactsCount || 0) + 1;
  saveDb();
  res.json({ success: true, count: db.contactsCount });
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  try {
    validateDatabase();
    const totalProjects = db.projects.length;
    const featuredProjects = db.projects.filter(p => p.isFeatured).length;
    const totalViews = db.projects.reduce((sum, p) => sum + (p.views || 0), 0);

    const categoryViewsMap: Record<string, number> = {};
    db.projects.forEach(p => {
      categoryViewsMap[p.category] = (categoryViewsMap[p.category] || 0) + (p.views || 0);
    });

    const categoryViews = Object.entries(categoryViewsMap).map(([category, views]) => ({
      category,
      views
    }));

    const projectViews = db.projects
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

    const summary: AnalyticsSummary = {
      totalProjects,
      featuredProjects,
      totalViews,
      contactRequests: db.contactsCount,
      viewsOverTime,
      projectViews,
      categoryViews
    };

    res.json(summary);
  } catch (err) {
    console.error("[API Error] /api/analytics failed:", err);
    res.status(500).json({ error: { message: "Failed to fetch analytics" } });
  }
});

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Critical express error captured:", err);
  res.status(err.status || 500).json({
    error: {
      code: String(err.status || 500),
      message: err.message || "An internal database or router error has occurred.",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// Vite & Static file hosting configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/uploads/**']
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
    console.log(`✅ CMS Backend running on port ${PORT}`);
    console.log(`📊 Database initialized with ${db.projects.length} projects`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;