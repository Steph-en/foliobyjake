# Premium Creator Portfolio & Dynamic Studio Admin

A bespoke, high-performance web platform built with **React**, **Vite**, **Express**, and **TypeScript**. Embodying a Swiss-Minimalist / Technical aesthetic, this platform allows creators, agencies, or independent studios to orchestrate and display interactive case studies, curate rich media galleries, and manage digital portfolios via an offline-first, highly responsive administrator dashboard.

---

## 🎨 Design Philosophy & Visual Language

- **Minimalist Slate Canvas**: A meticulously styled off-black and charcoal color model, incorporating a raw technical-monospaced grid, high typographic hierarchy, and generous negative space.
- **Typographic System**: Pairs clean **Inter** display headings for readable, authoritative blocks with **JetBrains Mono** for structural meta-labels, timelines, and status elements.
- **Motion Choreography**: High-fidelity scrolling interactions powered by **GSAP (GreenSock)**, **ScrollTrigger**, and **Lenis Smooth Scroll**, combined with responsive state transitions engineered using **Framer Motion**.
- **No Telemetry Clutter**: Free of artificial diagnostic readouts or synthetic status logs, keeping the viewer's focus solely on visual craft and creative execution.

---

## 🔥 Key Technical Capabilities

### 1. Robust Full-Stack Architecture
- **Express + Vite Integration**: Unified backend api router hosting secure media processing endpoints combined with Vite’s light development middleware.
- **Multer Middleware Engine**: Built-in file handler mapping local storage buffers directly to `/uploads` on disk, complete with local static asset hosting services.
- **Zod & React Hook Form Validation**: Strong type interfaces securing core project fields, case study configurations, categories, and media schemas.

### 2. Live Media & Asset Orchestration (Interactive Media Manager)
- **Multi-Format Local Picker**: Integrated `<input type="file" />` selectors supporting direct local uploads for previews, hero cards, and case studies, seamlessly side-by-side with remote URL registration.
- **Drag-and-Drop Uploader**: Drop files directly into the interactive media hub with instant input field fallback.
- **Client-Side Sanitization**: Guarded upload validation that intercepts unapproved asset types or oversized files (over 50MB) client-side before any backend overhead.
- **Animated Progress Trackers**: High-precision visual status bars featuring smooth emerald gradients, precise loaded sizes (`XX MB / XX MB`), and numeric percentage trackers.

### 3. Dynamic Case Study Builder & Reorderable Gallery
- **Dnd-Kit Sortable Grid**: Arrange and order layout gallery files fluidly on a live workspace utilizing robust Pointer Sensors.
- **Bento Case Study Components**: Configure editorial rows, split comparative channels, text containers, or media grids instantly per project.

---

## ⚙️ Environment Configuration

Define a `.env` file at the root of your project using `.env.example` as a template:

---

## 🚀 Quick Start Guide

### Pre-requisites
Ensure you have **Node.js (LTS)** and **npm** installed on your workstation.

### 1. Install Dependencies
Installs all system, developer, and UI assets safely inside the workspace:
```bash
npm install
```

### 2. Launch Development Server
Fires up the Express API router coupled with Vite development configurations on port `3000`:
```bash
npm run dev
```
Explore the development frame locally at: `http://localhost:3000`

### 3. Build for Production
Bundles client-side assets under `dist/` and compiles TypeScript backend configurations to CJS format using `esbuild`:
```bash
npm run build
```

### 4. Start Production Server
Run the production build container using the compiled, singular backend bundle:
```bash
npm run start
```

---

## 📁 Repository Map

```text
├── server.ts             # Express core entry point hosting API routes and Vite middleware.
├── vite.config.ts        # Vite execution context and plugin rules.
├── package.json          # System dependency map and command scripts.
├── src/
│   ├── main.tsx          # Client-side mounting portal.
│   ├── App.tsx           # App Router, Global Scroll, and public Landing spaces.
│   ├── types.ts          # Shared TypeScript contracts for projects and case studies.
│   ├── lib/
│   │   └── api.ts        # Axios client mapping multi-part uploads with progress hooks.
│   └── components/
│       ├── ContactModal.tsx    # Immersive visual mailing and contact module.
│       └── Admin/
│           ├── index.tsx       # Root Admin layout.
│           ├── Dashboard.tsx   # Project tracking metrics.
│           ├── MediaManager.tsx # Asset hub with local dropboxes, progress state, and URLs.
│           ├── ProjectEditor.tsx # Form layouts with local pickers and reorderable galleries.
│           └── ProjectTable.tsx  # Interactive list layout for quick project adjustments.
```

---

## 🛡️ Client-Side Validation Rules

Supported local image formats and extensions are actively monitored prior to network transmission, restricting execution immediately upon boundary exceptions:

| Asset Dimension | MIME Types Approved | Valid Extensions | Maximum Allowed Size |
| :--- | :--- | :--- | :--- |
| **Image Engine** | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `image/bmp` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`, `.bmp` | **50 MB** |
| **Video Engine** | `video/mp4`, `video/webm`, `video/ogg`, `video/quicktime` | `.mp4`, `.webm`, `.ogg`, `.mov` | **50 MB** |
