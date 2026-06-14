import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { Category, Project, ProjectStatus, AnalyticsSummary, MediaAsset, CaseStudySection } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure directories exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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
    sections: [
      {
        id: 'sec1-1',
        type: 'text',
        content: {
          textHeader: 'THE DESIGN STRATEGY',
          textBody: 'To capture the attention of high-schoolers, we developed a raw, modern aesthetic combining high-contrast punk/grunge typesetting with spiritual subtext. Over 30 graphics, flyers, posters, and video formats were generated to maintain digital engagement.'
        },
        order: 1
      },
      {
        id: 'sec1-2',
        type: 'side-by-side',
        content: {
          images: [
            'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/14_zlxozl.jpg',
            'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576066/2_jrisoo.jpg'
          ]
        },
        order: 2
      }
    ]
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
    ],
    client: 'TúNiyi',
    year: '2025',
    role: 'Brand Identity Designer',
    status: 'published',
    isFeatured: true,
    views: 890,
    seoTitle: 'UAI by TúNiyi Brand Identity - Jake Amponsah',
    seoDescription: 'Explore the graphic identity system built for UAI conceptual fashion label.',
    sections: []
  },
  {
    id: 3,
    name: 'Scolpta (Ashesi Career Fair)',
    slug: 'scolpta-ashesi',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/Artboard_13_lthkd6.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/c_fill,w_1920,h_1080/v1774425611/Artboard_1_fxrrrq.jpg',
    description: 'A BRAND IDENTITY AND EXPERIENTIAL DESIGN PROJECT FOR A GEN Z–FOCUSED CAREER FAIR ACTIVATION.',
    longDescription: 'This project involved creating a bold and unconventional visual identity for Scolpta\'s career fair presence. The concept "Think Upside Down" challenged traditional corporate communication by introducing a playful and disruptive design language rooted in Y2K aesthetics and Gen Z culture.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425610/Artboard_2_copy_10_sqyv8y.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774440404/setup__c86oxu.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774440405/stup_2_xidnzf.png',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/board_1_rb71ut.jpg',
    ],
    client: 'Scolpta',
    year: '2026',
    role: 'Brand Identity & Experiential Designer',
    status: 'published',
    isFeatured: true,
    views: 955,
    sections: []
  },
  {
    id: 4,
    name: 'VANT',
    slug: 'vant-branding',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628837/cover_portrait_4x-100_pz4u6u.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628826/Artboard_1_4x-100_jl5nih.jpg',
    description: 'A BRAND IDENTITY PROJECT FOR A CONTEMPORARY FASHION LABEL BUILT AROUND PERSPECTIVE, RESTRAINT, AND QUIET CONFIDENCE.',
    longDescription: 'This project translates the idea of vantage into a refined visual system centered on structure and restraint. Using New York typography and a restrained black, white, and ash palette, the identity emphasises balance, contrast, and composure. VANT is not about noise — it is about perspective.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628830/Artboard_8_4x-100_yyxc4i.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628826/Artboard_2_copy_4x-100_rhhmfx.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774628826/Artboard_2_4x-100_cqpzrz.jpg',
    ],
    client: 'VANT',
    year: '2026',
    role: 'Brand Identity Designer',
    status: 'published',
    isFeatured: false,
    views: 420,
    sections: []
  },
  {
    id: 5,
    name: 'Main Squeeze',
    slug: 'main-squeeze',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633759/COVER_b61g2a.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633765/MAIN_SQUEEZE_4x-100_or8fag.jpg',
    description: 'A BRAND IDENTITY PROJECT FOR A MODERN BEVERAGE BRAND, FOCUSED ON FRESHNESS, ENERGY, AND BOLD VISUAL APPEAL.',
    longDescription: 'A branding project for Main Squeeze, a beverage brand focused on freshness and energy. The direction leaned into bold typography and clean layouts while feeling consistent and recognisable across packaging and promo materials.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633759/Artboard_5_4x-100_ho8lbg.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633761/IMG_2335_hfuvwr.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774633763/IMG_2340_fc4pik.jpg',
    ],
    client: 'Ms Jo',
    year: '2023',
    role: 'Brand Identity Designer',
    status: 'published',
    isFeatured: false,
    views: 532,
    sections: []
  },
  {
    id: 6,
    name: 'Stackz',
    slug: 'stackz',
    category: 'Graphic Design',
    previewImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774642493/Artboard_10_4x-100_copy_wmgwyw.jpg',
    heroImage: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640756/Artboard_1_4x-100_tzpe6t.jpg',
    description: 'BRAND IDENTITY (AVAILABLE FOR SALE)',
    longDescription: 'A self-initiated branding project for Stackz, a pastry brand inspired by a family-style tradition of stacked desserts. The project is currently available for sale, including full brand identity and concept.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640780/Artboard_14_4x-100_otsrtp.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640733/Artboard_8_4x-100_s59olb.jpg',
      'https://res.cloudinary.com/degd6ahfu/image/upload/v1774640740/Artboard_5_4x-100_zsgqvx.jpg',
    ],
    client: 'Self Initiated',
    year: '2024',
    role: 'Brand Identity Designer',
    status: 'published',
    isFeatured: false,
    views: 311,
    sections: []
  },
  {
    id: 7,
    name: 'Motion Collection',
    slug: 'motion-graphics',
    category: 'Motion Graphics',
    previewVideo: 'https://player.cloudinary.com/embed/?cloud_name=degd6ahfu&public_id=work_with_us_motion_3.0_vgu5uv',
    heroVideo: 'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446445/album_art_1x1_iqrlul.mp4',
    description: 'A COLLECTION OF MOTION-DRIVEN VISUALS DESIGNED TO BRING BRANDS AND IDEAS TO LIFE THROUGH DYNAMIC STORYTELLING.',
    longDescription: 'This body of work explores the intersection of design and movement, transforming static visuals into engaging, immersive experiences through typography-driven animations and brand-focused motion systems.',
    gallery: [
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446445/album_art_1x1_iqrlul.mp4',
      'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446446/work_with_us_motion_3.0_vgu5uv.mp4',
    ],
    client: 'Personal Project',
    year: '2026',
    role: 'Motion Designer',
    status: 'published',
    isFeatured: true,
    views: 742,
    sections: []
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Graphic Design', slug: 'graphic-design' },
  { id: 'cat2', name: 'Motion Graphics', slug: 'motion-graphics' }
];

const INITIAL_MEDIA: MediaAsset[] = [
  { id: 'm1', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774576064/1_ovs88o.jpg', name: 'Youth Conference Hero', type: 'image', size: '1.2 MB', createdAt: new Date().toISOString() },
  { id: 'm2', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774442003/bannner_r79veh.jpg', name: 'UAI Banner', type: 'image', size: '840 KB', createdAt: new Date().toISOString() },
  { id: 'm3', url: 'https://res.cloudinary.com/degd6ahfu/image/upload/v1774425614/Artboard_13_lthkd6.jpg', name: 'Scolpta Poster', type: 'image', size: '1.4 MB', createdAt: new Date().toISOString() },
  { id: 'm4', url: 'https://res.cloudinary.com/degd6ahfu/video/upload/v1774446445/album_art_1x1_iqrlul.mp4', name: 'Logo Motion Loop', type: 'video', size: '4.8 MB', createdAt: new Date().toISOString() },
];

interface LocalDatabase {
  projects: Project[];
  categories: Category[];
  media: MediaAsset[];
  contactsCount: number;
}

// Read database from file, or seed it if not found
let db: LocalDatabase = {
  projects: INITIAL_WORKS,
  categories: INITIAL_CATEGORIES,
  media: INITIAL_MEDIA,
  contactsCount: 14 // Starting counter
};

if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (err) {
    console.warn("Failed to read db.json, using defaults:", err);
  }
} else {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ───── API ROUTES ─────

// Auth Mock login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    res.json({ success: true, token: "mock-jwt-token-jake-cm-system" });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password" });
  }
});

// Categories Endpoints
app.get("/api/categories", (req, res) => {
  res.json(db.categories);
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

// Projects Endpoints
app.get("/api/projects", (req, res) => {
  const { view } = req.query; // 'admin' exposes draft/archived
  if (view === "admin") {
    res.json(db.projects);
  } else {
    res.json(db.projects.filter(p => p.status === "published"));
  }
});

app.get("/api/projects/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const inc = req.query.increment === "true";

  const project = db.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (inc) {
    project.views = (project.views || 0) + 1;
    saveDb();
  }

  res.json(project);
});

app.post("/api/projects", (req, res) => {
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
});

app.put("/api/projects/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const updatedData = req.body;

  const projectIdx = db.projects.findIndex(p => p.id === projectId);
  if (projectIdx === -1) return res.status(404).json({ error: "Project not found" });

  db.projects[projectIdx] = {
    ...db.projects[projectIdx],
    ...updatedData,
    id: projectId // Keep ID immutable
  };

  saveDb();
  res.json(db.projects[projectIdx]);
});

app.post("/api/projects/:id/duplicate", (req, res) => {
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
});

app.delete("/api/projects/:id", (req, res) => {
  const projectId = Number(req.params.id);
  const projectIdx = db.projects.findIndex(p => p.id === projectId);
  if (projectIdx === -1) return res.status(404).json({ error: "Project not found" });

  db.projects.splice(projectIdx, 1);
  saveDb();
  res.json({ success: true });
});

// Media Library Endpoints
app.get("/api/media", (req, res) => {
  res.json(db.media);
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

// increment Contact counting directly
app.post("/api/contacts/increment", (req, res) => {
  db.contactsCount = (db.contactsCount || 0) + 1;
  saveDb();
  res.json({ success: true, count: db.contactsCount });
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  const totalProjects = db.projects.length;
  const featuredProjects = db.projects.filter(p => p.isFeatured).length;
  const totalViews = db.projects.reduce((sum, p) => sum + (p.views || 0), 0);

  // Group by category helper
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

  // Views over time data
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
});

// Vite & Static file hosting configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Middleware mode for Vite HMR
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production bundle
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CMS Back-end Server running on port ${PORT}`);
  });
}

startServer();
